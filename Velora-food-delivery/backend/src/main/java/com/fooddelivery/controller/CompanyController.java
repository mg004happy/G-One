package com.fooddelivery.controller;

import com.fooddelivery.repository.RestaurantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public directory of employer names currently offered by approved restaurants. */
@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final RestaurantRepository restaurantRepository;

    public CompanyController(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    @GetMapping
    public ResponseEntity<List<String>> getAvailableCompanies() {
        return ResponseEntity.ok(restaurantRepository.findDistinctApprovedTieUpCompanies());
    }
}
