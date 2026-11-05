package com.fooddelivery.service;

import com.fooddelivery.dto.OrderItemResponse;
import com.fooddelivery.dto.OrderResponse;
import com.fooddelivery.dto.PlaceOrderRequest;
import com.fooddelivery.dto.UpdateOrderStatusRequest;
import com.fooddelivery.entity.Address;
import com.fooddelivery.entity.Cart;
import com.fooddelivery.entity.CartItem;
import com.fooddelivery.entity.Order;
import com.fooddelivery.entity.OrderItem;
import com.fooddelivery.entity.OrderStatus;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.RestaurantEmployee;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.EmptyCartException;
import com.fooddelivery.exception.OrderNotFoundException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.UnauthorizedOrderAccessException;
import com.fooddelivery.repository.AddressRepository;
import com.fooddelivery.repository.CartRepository;
import com.fooddelivery.repository.OrderRepository;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.RestaurantEmployeeRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of {@link OrderService}.
 *
 * <h3>Place-order flow:</h3>
 * <ol>
 *   <li>Load the customer's cart and validate it is not empty.</li>
 *   <li>Determine the restaurant from the first cart item (all items must belong to one restaurant).</li>
 *   <li>Create the {@link Order} with a generated order number.</li>
 *   <li>Copy each {@link CartItem} into an {@link OrderItem}, snapshotting price and subtotal.</li>
 *   <li>Calculate the total amount.</li>
 *   <li>Remove ordered items from the cart, preserving items from closed restaurants.</li>
 *   <li>Return the new order.</li>
 * </ol>
 */
@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantEmployeeRepository employeeRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
                            CartRepository cartRepository,
                            UserRepository userRepository,
                            AddressRepository addressRepository,
                            RestaurantRepository restaurantRepository,
                            RestaurantEmployeeRepository employeeRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.restaurantRepository = restaurantRepository;
        this.employeeRepository = employeeRepository;
    }

    // ---- Public API ----

    @Override
    public OrderResponse placeOrder(PlaceOrderRequest request) {
        User user = getAuthenticatedUser();
        if (user.isBlocked()) {
            throw new com.fooddelivery.exception.UserBlockedException(
                    "Your account has been blocked by an administrator. You cannot place orders until an administrator unblocks your account.");
        }
        if (!user.isEnabled()) {
            throw new com.fooddelivery.exception.UserBlockedException(
                    "Your account is suspended. Please contact support.");
        }

        // 1. Load cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new EmptyCartException("Your cart is empty. Add items before placing an order."));

        if (cart.getCartItems().isEmpty()) {
            throw new EmptyCartException("Your cart is empty. Add items before placing an order.");
        }

        // Closed-restaurant items stay in the cart but cannot be included in an order.
        List<CartItem> orderableItems = cart.getCartItems().stream()
                .filter(item -> item.getFoodItem().getRestaurant().isActive()
                        && item.getFoodItem().getRestaurant().isApproved())
                .toList();
        if (orderableItems.isEmpty()) {
            throw new EmptyCartException("Your cart has no items from an open restaurant.");
        }

        // Determine the restaurant from the first orderable item and enforce the single-restaurant constraint.
        Restaurant restaurant = orderableItems.get(0).getFoodItem().getRestaurant();
        for (CartItem cartItem : orderableItems) {
            if (!cartItem.getFoodItem().getRestaurant().getId().equals(restaurant.getId())) {
                throw new IllegalStateException(
                        "All items in the cart must belong to the same restaurant. " +
                        "Please remove items from other restaurants before placing your order.");
            }
        }

        // 3. Resolve delivery address
        String deliveryAddress;
        String phoneNumber;
        Address addressRef = null;

        if (request.getAddressId() != null) {
            // Use saved address
            addressRef = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Address not found with id: " + request.getAddressId()));

            // Verify address belongs to the user
            if (!addressRef.getUser().getId().equals(user.getId())) {
                throw new UnauthorizedOrderAccessException(
                        "This address does not belong to you");
            }

            deliveryAddress = addressRef.toFormattedString();
            phoneNumber = addressRef.getPhoneNumber();
        } else {
            // Use manually provided address
            if (request.getDeliveryAddress() == null || request.getDeliveryAddress().isBlank()) {
                throw new IllegalStateException(
                        "Either addressId or deliveryAddress must be provided");
            }
            if (request.getPhoneNumber() == null || request.getPhoneNumber().isBlank()) {
                throw new IllegalStateException(
                        "Either addressId or phoneNumber must be provided");
            }
            deliveryAddress = request.getDeliveryAddress();
            phoneNumber = request.getPhoneNumber();
        }

        // 4. Build the order
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .restaurant(restaurant)
                .deliveryAddress(deliveryAddress)
                .phoneNumber(phoneNumber)
                .deliveryAddressRef(addressRef)
                .paymentMethod(request.getPaymentMethod())
                .totalAmount(BigDecimal.ZERO) // will be recalculated
                .build();

        // 5. Copy cart items → order items
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : orderableItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .foodItem(cartItem.getFoodItem())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .subtotal(cartItem.getSubtotal())
                    .build();
            order.getOrderItems().add(orderItem);
            totalAmount = totalAmount.add(cartItem.getSubtotal());
        }

        BigDecimal companyShareAmount = BigDecimal.ZERO;
        String companyName = null;
        RestaurantEmployee registeredEmployee = null;
        if (user.isCompanyAffiliated()
                && user.getAffiliatedCompany() != null
                && user.getEmployeeId() != null
                && employeeRepository.isVerifiedEmployee(
                        user.getAffiliatedCompany(), user.getEmployeeId(), user.getFullName())
                && restaurant.getTieUpCompanies().stream()
                        .anyMatch(company -> company.equalsIgnoreCase(user.getAffiliatedCompany()))) {
            companyShareAmount = totalAmount.multiply(new BigDecimal("0.50"))
                    .setScale(2, RoundingMode.HALF_UP);
            companyName = user.getAffiliatedCompany();
            registeredEmployee = employeeRepository
                    .findFirstByRestaurantIdAndCompanyNameIgnoreCaseAndEmployeeIdIgnoreCase(
                            restaurant.getId(), companyName, user.getEmployeeId())
                    .orElse(null);
        }

        order.setGrossAmount(totalAmount);
        order.setCompanyShareAmount(companyShareAmount);
        order.setCompanyName(companyName);
        order.setEmployeeIdSnapshot(companyName == null ? null : user.getEmployeeId());
        order.setRegisteredEmployee(registeredEmployee);
        order.setTotalAmount(totalAmount.subtract(companyShareAmount));

        // 6. Save order
        Order savedOrder = orderRepository.save(order);

        // 7. Remove ordered items; closed-restaurant items remain in the unavailable cart section.
        cart.getCartItems().removeAll(orderableItems);
        cart.recalculateTotal();
        cartRepository.save(cart);

        return mapToResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        User user = getAuthenticatedUser();
        return orderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        User user = getAuthenticatedUser();
        Order order = findOrderOrThrow(orderId);

        // Customers can only view their own orders
        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedOrderAccessException(
                    "You do not have permission to view this order");
        }

        return mapToResponse(order);
    }

    @Override
    public OrderResponse cancelOrder(Long orderId) {
        User user = getAuthenticatedUser();
        Order order = findOrderOrThrow(orderId);

        // Only the customer who placed the order can cancel it
        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedOrderAccessException(
                    "You do not have permission to cancel this order");
        }

        // Cannot cancel delivered orders
        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel a delivered order");
        }

        // Cannot cancel orders already out for delivery
        if (order.getOrderStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            throw new IllegalStateException("Cannot cancel an order that is out for delivery");
        }

        // Cannot cancel already cancelled orders
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("This order is already cancelled");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        User user = getAuthenticatedUser();
        Order order = findOrderOrThrow(orderId);

        // Only the restaurant owner who owns the restaurant can update status
        if (!order.getRestaurant().getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedOrderAccessException(
                    "You are not the owner of the restaurant for this order");
        }

        order.setOrderStatus(request.getOrderStatus());

        // If status is DELIVERED, mark payment as PAID for cash orders
        if (request.getOrderStatus() == OrderStatus.DELIVERED) {
            order.setPaymentStatus(com.fooddelivery.entity.PaymentStatus.PAID);
        }

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getRestaurantOrders() {
        User owner = getAuthenticatedUser();
        List<Restaurant> restaurants = restaurantRepository.findByOwner(owner);

        return restaurants.stream()
                .flatMap(r -> orderRepository.findByRestaurantIdOrderByCreatedAtDesc(r.getId()).stream())
                .map(this::mapToResponse)
                .toList();
    }

    // ---- Internal helpers ----

    private Order findOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(
                        "Order not found with id: " + orderId));
    }

    /**
     * Generate a unique order number like: ORD-20260527-A3F8B1.
     */
    private String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniquePart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + datePart + "-" + uniquePart;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .totalAmount(order.getTotalAmount())
                .grossAmount(order.getGrossAmount() == null ? order.getTotalAmount() : order.getGrossAmount())
                .companyShareAmount(order.getCompanyShareAmount() == null ? BigDecimal.ZERO : order.getCompanyShareAmount())
                .companyName(order.getCompanyName())
                .employeeId(order.getEmployeeIdSnapshot())
                .deliveryAddress(order.getDeliveryAddress())
                .phoneNumber(order.getPhoneNumber())
                .orderStatus(order.getOrderStatus().name())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .items(order.getOrderItems().stream()
                        .map(this::mapToItemResponse)
                        .toList())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponse mapToItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .foodItemId(item.getFoodItem().getId())
                .foodItemName(item.getFoodItem().getName())
                .foodItemImageUrl(item.getFoodItem().getImageUrl())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }
}
