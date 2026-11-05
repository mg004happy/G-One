package com.fooddelivery.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TieUpDepartureResponse {
    private String customerName;
    private String customerEmail;
    private String phoneNumber;
    private String companyName;
    private String employeeId;
    private LocalDateTime leftAt;
}
