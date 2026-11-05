package com.fooddelivery.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class RestaurantEmployeeResponse {
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private String employeeName;
    private String employeeId;
    private String companyName;
    private String phoneNumber;
    private long orderCount;
    private BigDecimal companyOwedAmount;
}
