package com.fooddelivery.service;

import com.fooddelivery.dto.AddToCartRequest;
import com.fooddelivery.dto.CartItemResponse;
import com.fooddelivery.dto.CartResponse;
import com.fooddelivery.dto.UpdateCartItemRequest;
import com.fooddelivery.entity.Cart;
import com.fooddelivery.entity.CartItem;
import com.fooddelivery.entity.FoodItem;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.CartItemNotFoundException;
import com.fooddelivery.exception.FoodItemNotFoundException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.repository.CartRepository;
import com.fooddelivery.repository.FoodItemRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Implementation of {@link CartService}.
 *
 * <h3>Key behaviours:</h3>
 * <ul>
 *   <li>Auto-creates a cart the first time a customer adds an item.</li>
 *   <li>Deduplicates items — if the same food item is added again, quantity is incremented.</li>
 *   <li>Snapshots the food item price at add-time into {@code CartItem.price}.</li>
 *   <li>Recalculates {@code Cart.totalAmount} after every mutation.</li>
 *   <li>Validates that the food item exists and is marked as available.</li>
 * </ul>
 */
@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           FoodItemRepository foodItemRepository,
                           UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.foodItemRepository = foodItemRepository;
        this.userRepository = userRepository;
    }

    // ---- Public API ----

    @Override
    public CartResponse addToCart(AddToCartRequest request) {
        User user = getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new FoodItemNotFoundException(
                        "Food item not found with id: " + request.getFoodItemId()));

        if (!foodItem.isAvailable()) {
            throw new IllegalStateException(
                    "Food item '" + foodItem.getName() + "' is currently unavailable");
        }
        if (!foodItem.getRestaurant().isActive() || !foodItem.getRestaurant().isApproved()) {
            throw new IllegalStateException(
                    "Restaurant '" + foodItem.getRestaurant().getName() + "' is currently closed");
        }

        // Check if the food item already exists in the cart
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(ci -> ci.getFoodItem().getId().equals(foodItem.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Increase quantity
            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            cartItem.recalculateSubtotal();
        } else {
            // Add new cart item
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .foodItem(foodItem)
                    .quantity(request.getQuantity())
                    .price(foodItem.getPrice())
                    .subtotal(foodItem.getPrice().multiply(
                            java.math.BigDecimal.valueOf(request.getQuantity())))
                    .build();
            cart.getCartItems().add(cartItem);
        }

        cart.recalculateTotal();
        Cart saved = cartRepository.save(cart);
        return mapToResponse(saved);
    }

    @Override
    public CartResponse getCart() {
        User user = getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);
        return mapToResponse(cart);
    }

    @Override
    public CartResponse updateCartItem(Long cartItemId, UpdateCartItemRequest request) {
        User user = getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = findCartItemInCart(cart, cartItemId);
        if (!cartItem.getFoodItem().getRestaurant().isActive()
                || !cartItem.getFoodItem().getRestaurant().isApproved()) {
            throw new IllegalStateException("Items from a closed restaurant cannot be updated");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItem.recalculateSubtotal();
        cart.recalculateTotal();

        Cart saved = cartRepository.save(cart);
        return mapToResponse(saved);
    }

    @Override
    public CartResponse removeCartItem(Long cartItemId) {
        User user = getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = findCartItemInCart(cart, cartItemId);
        cart.getCartItems().remove(cartItem);
        cart.recalculateTotal();

        Cart saved = cartRepository.save(cart);
        return mapToResponse(saved);
    }

    @Override
    public void clearCart() {
        User user = getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);
        cart.getCartItems().clear();
        cart.recalculateTotal();
        cartRepository.save(cart);
    }

    // ---- Internal helpers ----

    /**
     * Retrieve the user's cart or create a new empty one.
     */
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    /**
     * Find a cart item within the user's cart or throw 404.
     */
    private CartItem findCartItemInCart(Cart cart, Long cartItemId) {
        return cart.getCartItems().stream()
                .filter(ci -> ci.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new CartItemNotFoundException(
                        "Cart item not found with id: " + cartItemId));
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> items = cart.getCartItems().stream()
                .map(this::mapToItemResponse)
                .toList();
        List<CartItem> openRestaurantItems = cart.getCartItems().stream()
                .filter(item -> item.getFoodItem().getRestaurant().isActive()
                        && item.getFoodItem().getRestaurant().isApproved())
                .toList();
        BigDecimal openRestaurantTotal = openRestaurantItems.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .totalItems(openRestaurantItems.size())
                .totalAmount(openRestaurantTotal)
                .updatedAt(cart.getUpdatedAt())
                .items(items)
                .build();
    }

    private CartItemResponse mapToItemResponse(CartItem cartItem) {
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .foodItemId(cartItem.getFoodItem().getId())
                .foodItemName(cartItem.getFoodItem().getName())
                .foodItemImageUrl(cartItem.getFoodItem().getImageUrl())
                .restaurantId(cartItem.getFoodItem().getRestaurant().getId())
                .restaurantName(cartItem.getFoodItem().getRestaurant().getName())
                .restaurantActive(cartItem.getFoodItem().getRestaurant().isActive()
                        && cartItem.getFoodItem().getRestaurant().isApproved())
                .restaurantTieUpCompanies(List.copyOf(cartItem.getFoodItem().getRestaurant().getTieUpCompanies()))
                .quantity(cartItem.getQuantity())
                .price(cartItem.getPrice())
                .subtotal(cartItem.getSubtotal())
                .build();
    }
}
