package com.fooddelivery.service;

import com.fooddelivery.dto.AddToCartRequest;
import com.fooddelivery.dto.CartResponse;
import com.fooddelivery.dto.UpdateCartItemRequest;

/**
 * Service interface for shopping cart operations.
 */
public interface CartService {

    /**
     * Add a food item to the authenticated user's cart.
     * If the item already exists in the cart, its quantity is increased.
     * If the user has no cart, one is created automatically.
     *
     * @param request the food item ID and quantity
     * @return the updated cart
     */
    CartResponse addToCart(AddToCartRequest request);

    /**
     * Get the authenticated user's cart.
     *
     * @return the cart with all items
     */
    CartResponse getCart();

    /**
     * Update the quantity of an existing cart item.
     *
     * @param cartItemId the cart item to update
     * @param request    the new quantity
     * @return the updated cart
     */
    CartResponse updateCartItem(Long cartItemId, UpdateCartItemRequest request);

    /**
     * Remove a single item from the cart.
     *
     * @param cartItemId the cart item to remove
     * @return the updated cart
     */
    CartResponse removeCartItem(Long cartItemId);

    /**
     * Clear all items from the authenticated user's cart.
     */
    void clearCart();
}
