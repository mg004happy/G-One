package com.fooddelivery.service;

import com.fooddelivery.dto.FoodItemResponse;
import com.fooddelivery.dto.RestaurantResponse;
import com.fooddelivery.entity.Category;
import com.fooddelivery.entity.FoodItem;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.repository.FoodItemRepository;
import com.fooddelivery.repository.RestaurantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Implementation of {@link SearchService}.
 *
 * <h3>Search approach:</h3>
 * <p>All search queries use the null-parameter pattern in JPQL:
 * {@code (:param IS NULL OR column = :param)}. This means passing {@code null}
 * for any parameter effectively disables that filter, allowing flexible
 * combinations without multiple query methods.</p>
 *
 * <h3>Recommendation approach:</h3>
 * <ul>
 *   <li><strong>Top-rated restaurants</strong> — sorted by denormalized {@code averageRating}
 *       from the restaurants table (no JOIN needed).</li>
 *   <li><strong>Trending foods</strong> — ranked by total quantity sold across DELIVERED orders
 *       (aggregated from order_items).</li>
 * </ul>
 */
@Service
@Transactional(readOnly = true)
public class SearchServiceImpl implements SearchService {

    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;

    public SearchServiceImpl(RestaurantRepository restaurantRepository,
                             FoodItemRepository foodItemRepository) {
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
    }

    // =====================================================================
    // SEARCH
    // =====================================================================

    @Override
    public Page<RestaurantResponse> searchRestaurants(String keyword, Double minRating,
                                                       String sortBy, Pageable pageable) {
        return restaurantRepository.searchRestaurants(keyword, minRating, pageable)
                .map(this::mapRestaurant);
    }

    @Override
    public Page<FoodItemResponse> searchFoods(String keyword, Category category, Boolean veg,
                                               BigDecimal minPrice, BigDecimal maxPrice,
                                               Pageable pageable) {
        // Always bind a VARCHAR for keyword; PostgreSQL cannot infer the type of a
        // null parameter used inside LOWER/CONCAT in the optional search predicate.
        String normalizedKeyword = keyword == null ? "" : keyword.trim();
        return foodItemRepository.searchFoods(normalizedKeyword, category, veg, minPrice, maxPrice, pageable)
                .map(this::mapFoodItem);
    }

    // =====================================================================
    // RECOMMENDATIONS
    // =====================================================================

    @Override
    public List<RestaurantResponse> getTopRatedRestaurants(int limit) {
        return restaurantRepository.findTopRatedRestaurants(PageRequest.of(0, limit))
                .stream()
                .map(this::mapRestaurant)
                .toList();
    }

    @Override
    public List<FoodItemResponse> getTrendingFoods(int limit) {
        // Query returns [foodItemId, foodItemName, totalQuantity]
        List<Object[]> rows = foodItemRepository.findMostOrderedFoods(PageRequest.of(0, limit));

        // For each trending food, load the full entity to build the response
        return rows.stream()
                .map(row -> {
                    Long foodItemId = (Long) row[0];
                    return foodItemRepository.findById(foodItemId).orElse(null);
                })
                .filter(f -> f != null)
                .map(this::mapFoodItem)
                .toList();
    }

    // =====================================================================
    // INTERNAL MAPPERS
    // =====================================================================

    private RestaurantResponse mapRestaurant(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .address(r.getAddress())
                .phone(r.getPhone())
                .imageUrl(r.getImageUrl())
                .openingTime(r.getOpeningTime())
                .closingTime(r.getClosingTime())
                .active(r.isActive())
                .approved(r.isApproved())
                .tieUpCompanies(r.getTieUpCompanies())
                .ownerName(r.getOwner().getFullName())
                .ownerEmail(r.getOwner().getEmail())
                .averageRating(r.getAverageRating())
                .totalReviews(r.getTotalReviews())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private FoodItemResponse mapFoodItem(FoodItem f) {
        return FoodItemResponse.builder()
                .id(f.getId())
                .name(f.getName())
                .description(f.getDescription())
                .price(f.getPrice())
                .imageUrl(f.getImageUrl())
                .available(f.isAvailable())
                .veg(f.isVeg())
                .category(f.getCategory().name())
                .restaurantId(f.getRestaurant().getId())
                .restaurantName(f.getRestaurant().getName())
                .restaurantActive(f.getRestaurant().isActive() && f.getRestaurant().isApproved())
                .restaurantTieUpCompanies(List.copyOf(f.getRestaurant().getTieUpCompanies()))
                .createdAt(f.getCreatedAt())
                .build();
    }
}
