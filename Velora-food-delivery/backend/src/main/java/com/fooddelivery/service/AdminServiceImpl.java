package com.fooddelivery.service;

import com.fooddelivery.dto.DashboardStatsResponse;
import com.fooddelivery.dto.OrderAnalyticsResponse;
import com.fooddelivery.dto.OrderItemResponse;
import com.fooddelivery.dto.OrderResponse;
import com.fooddelivery.dto.RevenueAnalyticsResponse;
import com.fooddelivery.dto.UpdateUserStatusRequest;
import com.fooddelivery.dto.UserResponse;
import com.fooddelivery.entity.AccountStatus;
import com.fooddelivery.entity.Order;
import com.fooddelivery.entity.OrderItem;
import com.fooddelivery.entity.OrderStatus;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.Role;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.OrderNotFoundException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.repository.FoodItemRepository;
import com.fooddelivery.repository.OrderRepository;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of {@link AdminService}.
 *
 * <p>Provides dashboard statistics, user management (block/unblock/delete),
 * restaurant management (approve/disable/delete), order browsing with
 * pagination, and analytics queries.</p>
 */
@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;

    public AdminServiceImpl(UserRepository userRepository,
                            RestaurantRepository restaurantRepository,
                            OrderRepository orderRepository,
                            FoodItemRepository foodItemRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.orderRepository = orderRepository;
        this.foodItemRepository = foodItemRepository;
    }

    // =====================================================================
    // DASHBOARD STATS
    // =====================================================================

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        return DashboardStatsResponse.builder()
                // User counts
                .totalUsers(userRepository.countByRoleNot(Role.ADMIN))
                .totalCustomers(userRepository.countByRole(Role.CUSTOMER))
                .totalRestaurantOwners(userRepository.countByRole(Role.RESTAURANT_OWNER))
                .totalAdmins(userRepository.countByRole(Role.ADMIN))
                // Restaurant counts
                .totalRestaurants(restaurantRepository.count())
                .totalApprovedRestaurants(restaurantRepository.countByApprovedTrue())
                .totalPendingRestaurants(restaurantRepository.countByApprovedFalse())
                // Food items
                .totalFoodItems(foodItemRepository.count())
                // Order counts
                .totalOrders(orderRepository.count())
                .totalCompletedOrders(orderRepository.countByOrderStatus(OrderStatus.DELIVERED))
                .totalCancelledOrders(orderRepository.countByOrderStatus(OrderStatus.CANCELLED))
                .totalPendingOrders(orderRepository.countByOrderStatus(OrderStatus.PENDING))
                // Revenue
                .totalRevenue(orderRepository.sumTotalRevenue())
                .todayRevenue(orderRepository.sumRevenueSince(todayStart))
                .monthlyRevenue(orderRepository.sumRevenueSince(monthStart))
                .build();
    }

    // =====================================================================
    // USER MANAGEMENT
    // =====================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findByRoleNot(Role.ADMIN, pageable).map(this::mapUserToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String search, Pageable pageable) {
        return userRepository.searchUsersExcludingRole(search, Role.ADMIN, pageable)
                .map(this::mapUserToResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String search, Role role, Pageable pageable) {
        return userRepository.searchUsersWithRole(search, role, Role.ADMIN, pageable)
                .map(this::mapUserToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsersByRole(Role role, Pageable pageable) {
        if (role == Role.ADMIN) {
            return Page.empty(pageable);
        }
        return userRepository.findByRole(role, pageable).map(this::mapUserToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapUserToResponse(user);
    }

    @Override
    public UserResponse updateUserStatus(Long id, UpdateUserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setAccountStatus(request.getAccountStatus());
        user.setBlocked(request.getAccountStatus() == AccountStatus.BLOCKED);

        User saved = userRepository.save(user);
        return mapUserToResponse(saved);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    // =====================================================================
    // RESTAURANT MANAGEMENT
    // =====================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<com.fooddelivery.dto.RestaurantResponse> getAllRestaurants(Pageable pageable) {
        return restaurantRepository.findAll(pageable).map(this::mapRestaurantToResponse);
    }

    private com.fooddelivery.dto.RestaurantResponse mapRestaurantToResponse(Restaurant restaurant) {
        return com.fooddelivery.dto.RestaurantResponse.builder()
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
                .ownerId(restaurant.getOwner() != null ? restaurant.getOwner().getId() : null)
                .ownerName(restaurant.getOwner() != null ? restaurant.getOwner().getFullName() : null)
                .ownerEmail(restaurant.getOwner() != null ? restaurant.getOwner().getEmail() : null)
                .averageRating(restaurant.getAverageRating())
                .totalReviews(restaurant.getTotalReviews())
                .createdAt(restaurant.getCreatedAt())
                .build();
    }

    @Override
    public void approveRestaurant(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found with id: " + restaurantId));
        restaurant.setApproved(true);
        restaurant.setVerified(true);
        restaurant.setActive(true);
        restaurant.setClosedByAdmin(false);
        restaurantRepository.save(restaurant);
    }

    @Override
    public void disableRestaurant(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found with id: " + restaurantId));
        restaurant.setActive(false);
        restaurant.setApproved(false);
        restaurant.setClosedByAdmin(true);
        restaurantRepository.save(restaurant);
    }

    @Override
    public void deleteRestaurant(Long restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }
        restaurantRepository.deleteById(restaurantId);
    }

    // =====================================================================
    // ORDER MANAGEMENT (paginated)
    // =====================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapOrderToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByOrderStatus(status, pageable).map(this::mapOrderToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByRestaurant(Long restaurantId, Pageable pageable) {
        return orderRepository.findByRestaurantId(restaurantId, pageable).map(this::mapOrderToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(
                        "Order not found with id: " + orderId));
        return mapOrderToResponse(order);
    }

    // =====================================================================
    // ANALYTICS
    // =====================================================================

    @Override
    @Transactional(readOnly = true)
    public OrderAnalyticsResponse getOrderAnalytics() {
        // Orders grouped by status
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (Object[] row : orderRepository.countOrdersGroupedByStatus()) {
            ordersByStatus.put(row[0].toString(), (Long) row[1]);
        }

        // Top 10 selling foods
        List<OrderAnalyticsResponse.TopSellingFoodItem> topFoods = new ArrayList<>();
        for (Object[] row : orderRepository.findTopSellingFoods(PageRequest.of(0, 10))) {
            topFoods.add(OrderAnalyticsResponse.TopSellingFoodItem.builder()
                    .foodItemName((String) row[0])
                    .totalQuantitySold((Long) row[1])
                    .build());
        }

        // Top 10 most active restaurants
        List<OrderAnalyticsResponse.ActiveRestaurant> activeRestaurants = new ArrayList<>();
        for (Object[] row : orderRepository.findMostActiveRestaurants(PageRequest.of(0, 10))) {
            activeRestaurants.add(OrderAnalyticsResponse.ActiveRestaurant.builder()
                    .restaurantName((String) row[0])
                    .orderCount((Long) row[1])
                    .build());
        }

        // User analytics
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        return OrderAnalyticsResponse.builder()
                .ordersByStatus(ordersByStatus)
                .topSellingFoods(topFoods)
                .mostActiveRestaurants(activeRestaurants)
                .newUsersLast30Days(userRepository.countByCreatedAtAfter(thirtyDaysAgo))
                .activeCustomers(userRepository.countActiveCustomers())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueAnalyticsResponse> getDailyRevenue(int days) {
        List<RevenueAnalyticsResponse> result = new ArrayList<>();

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(LocalTime.MAX);

            // Use between-dates query for accurate daily revenue
            BigDecimal dailyRevenue = orderRepository.sumRevenueBetween(dayStart, dayEnd);
            long orderCount = orderRepository.findByCreatedAtBetween(
                    dayStart, dayEnd, PageRequest.of(0, 1)).getTotalElements();

            result.add(RevenueAnalyticsResponse.builder()
                    .date(date)
                    .revenue(dailyRevenue)
                    .orderCount(orderCount)
                    .build());
        }

        return result;
    }

    // =====================================================================
    // INTERNAL MAPPERS
    // =====================================================================

    private UserResponse mapUserToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accountStatus(user.getAccountStatus().name())
                .blocked(user.isBlocked())
                .companyAffiliated(user.isCompanyAffiliated())
                .affiliatedCompany(user.getAffiliatedCompany())
                .employeeId(user.getEmployeeId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private OrderResponse mapOrderToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .totalAmount(order.getTotalAmount())
                .grossAmount(order.getGrossAmount() == null ? order.getTotalAmount() : order.getGrossAmount())
                .companyShareAmount(order.getCompanyShareAmount() == null ? java.math.BigDecimal.ZERO : order.getCompanyShareAmount())
                .companyName(order.getCompanyName())
                .employeeId(order.getEmployeeIdSnapshot())
                .deliveryAddress(order.getDeliveryAddress())
                .phoneNumber(order.getPhoneNumber())
                .orderStatus(order.getOrderStatus().name())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .items(order.getOrderItems().stream()
                        .map(this::mapOrderItemToResponse)
                        .toList())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponse mapOrderItemToResponse(OrderItem item) {
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
