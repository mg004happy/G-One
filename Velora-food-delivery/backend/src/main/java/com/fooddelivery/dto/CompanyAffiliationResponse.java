package com.fooddelivery.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyAffiliationResponse {
    private boolean companyAffiliated;
    private String affiliatedCompany;
    private String employeeId;
}
