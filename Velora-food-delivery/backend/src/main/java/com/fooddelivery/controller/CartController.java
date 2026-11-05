package com.fooddelivery.controller;

import com.fooddelivery.dto.AddToCartRequest;
import com.fooddelivery.dto.CartResponse;
import com.fooddelivery.dto.UpdateCartItemRequest;
import com.fooddelivery.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for shopping cart operations.
 *
 * <p>All endpoints are restricted to authenticated users with the {@code CUSTOMER} role.
 * The authenticated user is resolved from the JWT token in the security context.</p>
 */
@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Add a food item to the cart (or increase quantity if it already exists).
     *
     * @param request the food item ID and quantity
     * @return 200 OK with the updated cart
     */
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addToCart(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get the authenticated user's cart.
     *
     * @return 200 OK with the cart
     */
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        CartResponse response = cartService.getCart();
        return ResponseEntity.ok(response);
    }

    /**
     * Update the quantity of an existing cart item.
     *
     * @param cartItemId the cart item to update
     * @param request    the new quantity
     * @return 200 OK with the updated cart
     */
    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse response = cartService.updateCartItem(cartItemId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Remove a single item from the cart.
     *
     * @param cartItemId the cart item to remove
     * @return 200 OK with the updated cart
     */
    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<CartResponse> removeCartItem(@PathVariable Long cartItemId) {
        CartResponse response = cartService.removeCartItem(cartItemId);
        return ResponseEntity.ok(response);
    }

    /**
     * Clear all items from the cart.
     *
     * @return 204 No Content
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
