package com.fooddelivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RestaurantEmployeeRequest {
    @NotBlank @Size(max = 160)
    private String employeeName;
    @NotBlank @Size(max = 80)
    private String employeeId;
    @NotBlank @Size(max = 120)
    private String companyName;
    @NotBlank @Size(max = 40)
    private String phoneNumber;
}
