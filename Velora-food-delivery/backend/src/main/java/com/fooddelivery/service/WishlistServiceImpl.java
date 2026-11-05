package com.fooddelivery.service;

import com.fooddelivery.dto.WishlistResponse;
import com.fooddelivery.entity.FoodItem;
import com.fooddelivery.entity.User;
import com.fooddelivery.entity.Wishlist;
import com.fooddelivery.exception.FoodItemNotFoundException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.WishlistItemNotFoundException;
import com.fooddelivery.repository.FoodItemRepository;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.repository.WishlistRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of {@link WishlistService}.
 *
 * <p>Manages a customer's favourite food items. Duplicate entries are
 * prevented by a DB unique constraint and an explicit service-level check.</p>
 */
@Service
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;

    public WishlistServiceImpl(WishlistRepository wishlistRepository,
                               FoodItemRepository foodItemRepository,
                               UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.foodItemRepository = foodItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public WishlistResponse addToWishlist(Long foodItemId) {
        User user = getAuthenticatedUser();
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new FoodItemNotFoundException(
                        "Food item not found with id: " + foodItemId));

        // Prevent duplicate
        if (wishlistRepository.existsByUserAndFoodItem(user, foodItem)) {
            throw new IllegalStateException("This item is already in your wishlist");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .foodItem(foodItem)
                .build();

        Wishlist saved = wishlistRepository.save(wishlist);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist() {
        User user = getAuthenticatedUser();
        return wishlistRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void removeFromWishlist(Long foodItemId) {
        User user = getAuthenticatedUser();
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new FoodItemNotFoundException(
                        "Food item not found with id: " + foodItemId));

        Wishlist wishlist = wishlistRepository.findByUserAndFoodItem(user, foodItem)
                .orElseThrow(() -> new WishlistItemNotFoundException(
                        "This item is not in your wishlist"));

        wishlistRepository.delete(wishlist);
    }

    // ---- Internal helpers ----

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private WishlistResponse mapToResponse(Wishlist wishlist) {
        FoodItem food = wishlist.getFoodItem();
        return WishlistResponse.builder()
                .id(wishlist.getId())
                .foodItemId(food.getId())
                .foodItemName(food.getName())
                .foodItemImageUrl(food.getImageUrl())
                .foodItemPrice(food.getPrice())
                .restaurantName(food.getRestaurant().getName())
                .available(food.isAvailable())
                .restaurantActive(food.getRestaurant().isActive() && food.getRestaurant().isApproved())
                .createdAt(wishlist.getCreatedAt())
                .build();
    }
}
