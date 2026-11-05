package com.fooddelivery.repository;

import com.fooddelivery.entity.Order;
import com.fooddelivery.entity.OrderStatus;
import com.fooddelivery.entity.RestaurantEmployee;
import com.fooddelivery.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Data JPA repository for {@link Order} entities.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    long countByRegisteredEmployeeAndOrderStatusNot(RestaurantEmployee employee, OrderStatus excludedStatus);

    @Query("SELECT COALESCE(SUM(o.companyShareAmount), 0) FROM Order o " +
            "WHERE o.registeredEmployee = :employee AND o.orderStatus <> :excludedStatus")
    BigDecimal sumCompanyShareByEmployee(@Param("employee") RestaurantEmployee employee,
                                         @Param("excludedStatus") OrderStatus excludedStatus);

    /**
     * Find all orders placed by a specific user, most recent first.
     */
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find all orders for a specific restaurant, most recent first.
     */
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);

    // ---- Admin: paginated + filtered ----

    /**
     * Find orders by status with pagination.
     */
    Page<Order> findByOrderStatus(OrderStatus status, Pageable pageable);

    /**
     * Find orders by restaurant ID with pagination.
     */
    Page<Order> findByRestaurantId(Long restaurantId, Pageable pageable);

    /**
     * Find orders created between two dates with pagination.
     */
    Page<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    // ---- Analytics queries ----

    long countByOrderStatus(OrderStatus status);

    /**
     * Sum total revenue from all DELIVERED orders.
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus = 'DELIVERED'")
    BigDecimal sumTotalRevenue();

    /**
     * Sum revenue from DELIVERED orders created after a given date.
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.orderStatus = 'DELIVERED' AND o.createdAt >= :since")
    BigDecimal sumRevenueSince(@Param("since") LocalDateTime since);

    /**
     * Sum revenue from DELIVERED orders created between two dates.
     * Used for daily revenue analytics where we need revenue for a specific day.
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.orderStatus = 'DELIVERED' AND o.createdAt >= :start AND o.createdAt <= :end")
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Top-selling food items by total quantity, limited by pageable.
     * Returns Object[] with [foodItemName, totalQuantity].
     */
    @Query("SELECT oi.foodItem.name, SUM(oi.quantity) FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.orderStatus = 'DELIVERED' " +
           "GROUP BY oi.foodItem.name ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingFoods(Pageable pageable);

    /**
     * Most active restaurants by order count.
     * Returns Object[] with [restaurantName, orderCount].
     */
    @Query("SELECT o.restaurant.name, COUNT(o) FROM Order o " +
           "GROUP BY o.restaurant.name ORDER BY COUNT(o) DESC")
    List<Object[]> findMostActiveRestaurants(Pageable pageable);

    /**
     * Count orders grouped by status.
     * Returns Object[] with [OrderStatus, count].
     */
    @Query("SELECT o.orderStatus, COUNT(o) FROM Order o GROUP BY o.orderStatus")
    List<Object[]> countOrdersGroupedByStatus();
}
