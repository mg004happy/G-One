package com.fooddelivery.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TieUpCompaniesRequest {
    @NotNull(message = "Company list is required")
    private List<String> tieUpCompanies;
}
