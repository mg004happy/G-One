package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for authentication responses returned after login/register.
 * Contains the JWT token and basic user information.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;
    private boolean companyAffiliated;
    private String affiliatedCompany;
    private String employeeId;
}
