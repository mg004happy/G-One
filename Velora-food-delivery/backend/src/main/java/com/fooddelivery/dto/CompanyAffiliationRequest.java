package com.fooddelivery.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyAffiliationRequest {
    private boolean companyAffiliated;

    @Size(max = 120)
    private String affiliatedCompany;

    @Size(max = 80)
    private String employeeId;
}
