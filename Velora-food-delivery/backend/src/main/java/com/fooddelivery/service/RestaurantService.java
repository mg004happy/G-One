package com.fooddelivery.service;

import com.fooddelivery.dto.RestaurantRequest;
import com.fooddelivery.dto.RestaurantResponse;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.Role;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.UnauthorizedOperationException;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Service handling restaurant CRUD operations.
 *
 * <h3>Authorization logic:</h3>
 * <ul>
 *   <li><strong>Create</strong> — only RESTAURANT_OWNER (enforced by {@code @PreAuthorize} on the controller).</li>
 *   <li><strong>Update / Delete</strong> — only the owner of the specific restaurant.</li>
 *   <li><strong>Read</strong> — publicly accessible.</li>
 * </ul>
 */
@Service
@Transactional
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public RestaurantService(RestaurantRepository restaurantRepository,
                             UserRepository userRepository) {
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new restaurant. The currently authenticated user becomes the owner.
     */
    public RestaurantResponse createRestaurant(RestaurantRequest request) {
        User owner = getAuthenticatedUser();
        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .phone(request.getPhone())
                .imageUrl(request.getImageUrl())
                .openingTime(LocalTime.parse(request.getOpeningTime()))
                .closingTime(LocalTime.parse(request.getClosingTime()))
                .active(false)
                .approved(false)
                .verified(false)
                .tieUpCompanies(normalizeTieUpCompanies(request.getTieUpCompanies()))
                .owner(owner)
                .build();

        Restaurant saved = restaurantRepository.save(restaurant);
        return mapToResponse(saved);
    }

    /**
     * Return all restaurants to admins, the signed-in owner's own restaurants
     * to restaurant owners, and only approved/open restaurants to customers
     * and anonymous visitors.
     */
    public List<RestaurantResponse> getAllRestaurants() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<Restaurant> restaurants;

        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            User currentUser = getAuthenticatedUser();
            if (currentUser.getRole() == Role.ADMIN) {
                restaurants = restaurantRepository.findAll();
            } else if (currentUser.getRole() == Role.RESTAURANT_OWNER) {
                restaurants = restaurantRepository.findByOwner(currentUser);
            } else {
                restaurants = restaurantRepository.findByActiveTrueAndApprovedTrue();
            }
        } else {
            restaurants = restaurantRepository.findByActiveTrueAndApprovedTrue();
        }

        return restaurants
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Get a single restaurant by ID.
     */
    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        if (!restaurant.isActive() || !restaurant.isApproved()) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + id);
        }
        return mapToResponse(restaurant);
    }

    /** Resolve a customer detail URL by restaurant slug, while preserving legacy numeric URLs. */
    public RestaurantResponse getRestaurantByIdentifier(String identifier) {
        try {
            return getRestaurantById(Long.parseLong(identifier));
        } catch (NumberFormatException ignored) {
            String requestedSlug = slugify(identifier);
            Restaurant restaurant = restaurantRepository.findAll().stream()
                    .filter(Restaurant::isActive)
                    .filter(Restaurant::isApproved)
                    .filter(candidate -> slugify(candidate.getName()).equals(requestedSlug))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Restaurant not found with slug: " + identifier));
            return mapToResponse(restaurant);
        }
    }

    private String slugify(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    private Set<String> normalizeTieUpCompanies(List<String> companies) {
        if (companies == null || companies.isEmpty()) return new LinkedHashSet<>();
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String company : companies) {
            if (company == null || company.isBlank()) continue;
            String value = company.trim();
            boolean alreadyPresent = normalized.stream().anyMatch(existing -> existing.equalsIgnoreCase(value));
            if (!alreadyPresent) normalized.add(value);
        }
        return normalized;
    }

    /**
     * Update an existing restaurant. Only the owner can update.
     */
    public RestaurantResponse updateRestaurant(Long id, RestaurantRequest request) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        verifyOwnership(restaurant);

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        restaurant.setImageUrl(request.getImageUrl());
        restaurant.setOpeningTime(LocalTime.parse(request.getOpeningTime()));
        restaurant.setClosingTime(LocalTime.parse(request.getClosingTime()));
        if (request.getTieUpCompanies() != null) {
            restaurant.setTieUpCompanies(normalizeTieUpCompanies(request.getTieUpCompanies()));
        }

        Restaurant updated = restaurantRepository.save(restaurant);
        return mapToResponse(updated);
    }

    /** Update only the company's tie-up list, without resubmitting restaurant details. */
    public RestaurantResponse updateTieUpCompanies(Long id, List<String> companies) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        verifyOwnership(restaurant);
        restaurant.setTieUpCompanies(normalizeTieUpCompanies(companies));
        return mapToResponse(restaurantRepository.save(restaurant));
    }

    /** Open or close a restaurant. Only its owner may change availability. */
    public RestaurantResponse setRestaurantAvailability(Long id, boolean active) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        verifyOwnership(restaurant);
        if (active && !restaurant.isApproved()) {
            throw new IllegalStateException("This restaurant must be approved before it can be opened");
        }
        restaurant.setActive(active);
        restaurant.setClosedByAdmin(false);
        return mapToResponse(restaurantRepository.save(restaurant));
    }

    /**
     * Delete a restaurant. Only the owner can delete.
     */
    public void deleteRestaurant(Long id) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        verifyOwnership(restaurant);
        restaurantRepository.delete(restaurant);
    }

    // ---- Internal helpers ----

    private Restaurant findRestaurantOrThrow(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found with id: " + id));
    }

    private void verifyOwnership(Restaurant restaurant) {
        User currentUser = getAuthenticatedUser();
        if (!restaurant.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException(
                    "You are not the owner of this restaurant");
        }
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    private RestaurantResponse mapToResponse(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .address(restaurant.getAddress())
                .phone(restaurant.getPhone())
                .imageUrl(restaurant.getImageUrl())
                .openingTime(restaurant.getOpeningTime())
                .closingTime(restaurant.getClosingTime())
                .active(restaurant.isActive())
                .approved(restaurant.isApproved())
                .closedByAdmin(restaurant.isClosedByAdmin())
                .tieUpCompanies(restaurant.getTieUpCompanies())
                .ownerId(restaurant.getOwner().getId())
                .ownerName(restaurant.getOwner().getFullName())
                .ownerEmail(restaurant.getOwner().getEmail())
                .averageRating(restaurant.getAverageRating())
                .totalReviews(restaurant.getTotalReviews())
                .createdAt(restaurant.getCreatedAt())
                .build();
    }
}
