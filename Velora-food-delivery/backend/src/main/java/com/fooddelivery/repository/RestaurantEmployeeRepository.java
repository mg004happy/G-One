package com.fooddelivery.repository;

import com.fooddelivery.entity.RestaurantEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface RestaurantEmployeeRepository extends JpaRepository<RestaurantEmployee, Long> {
    List<RestaurantEmployee> findByRestaurantIdOrderByCompanyNameAscEmployeeNameAsc(Long restaurantId);

    java.util.Optional<RestaurantEmployee> findFirstByRestaurantIdAndCompanyNameIgnoreCaseAndEmployeeIdIgnoreCase(Long restaurantId, String companyName, String employeeId);

    boolean existsByRestaurantIdAndCompanyNameIgnoreCaseAndEmployeeIdIgnoreCase(Long restaurantId, String companyName, String employeeId);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM RestaurantEmployee e " +
            "JOIN e.restaurant r WHERE r.approved = true " +
            "AND LOWER(TRIM(e.companyName)) = LOWER(TRIM(:company)) " +
            "AND LOWER(TRIM(e.employeeId)) = LOWER(TRIM(:employeeId)) " +
            "AND LOWER(TRIM(e.employeeName)) = LOWER(TRIM(:employeeName))")
    boolean isVerifiedEmployee(@Param("company") String company,
                               @Param("employeeId") String employeeId,
                               @Param("employeeName") String employeeName);
}
