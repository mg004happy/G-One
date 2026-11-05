package com.fooddelivery.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TieUpCustomerResponse {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String affiliatedCompany;
    private String employeeId;
}
