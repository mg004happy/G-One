package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO for user data returned to the admin.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String accountStatus;
    private boolean blocked;
    private boolean companyAffiliated;
    private String affiliatedCompany;
    private String employeeId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
