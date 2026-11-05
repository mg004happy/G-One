package com.fooddelivery.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RestaurantAvailabilityRequest {

    @NotNull
    private Boolean active;
}
