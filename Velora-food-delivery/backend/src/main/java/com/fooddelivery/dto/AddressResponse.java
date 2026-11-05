package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO for address data returned to the client.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {

    private Long id;
    private String fullName;
    private String phoneNumber;
    private String street;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
    private String addressType;
    private boolean isDefault;
    private LocalDateTime createdAt;
}
