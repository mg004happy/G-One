package com.fooddelivery.service;

import com.fooddelivery.dto.WishlistResponse;

import java.util.List;

/**
 * Service interface for wishlist/favourites operations.
 */
public interface WishlistService {

    WishlistResponse addToWishlist(Long foodItemId);

    List<WishlistResponse> getMyWishlist();

    void removeFromWishlist(Long foodItemId);
}
