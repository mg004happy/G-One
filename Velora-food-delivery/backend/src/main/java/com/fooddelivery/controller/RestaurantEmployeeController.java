package com.fooddelivery.controller;

import com.fooddelivery.dto.RestaurantEmployeeRequest;
import com.fooddelivery.dto.RestaurantEmployeeResponse;
import com.fooddelivery.dto.TieUpCustomerResponse;
import com.fooddelivery.dto.TieUpDepartureResponse;
import com.fooddelivery.service.RestaurantEmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/employees")
public class RestaurantEmployeeController {
    private final RestaurantEmployeeService service;

    public RestaurantEmployeeController(RestaurantEmployeeService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<RestaurantEmployeeResponse>> list(@PathVariable Long restaurantId) {
        // The service verifies that the authenticated account owns this restaurant.
        return ResponseEntity.ok(service.listForOwner(restaurantId));
    }

    @GetMapping("/customers")
    public ResponseEntity<List<TieUpCustomerResponse>> listTieUpCustomers(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(service.listTieUpCustomersForOwner(restaurantId));
    }

    @GetMapping("/departures")
    public ResponseEntity<List<TieUpDepartureResponse>> listTieUpDepartures(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(service.listTieUpDeparturesForOwner(restaurantId));
    }

    @PostMapping
    public ResponseEntity<RestaurantEmployeeResponse> add(@PathVariable Long restaurantId,
            @Valid @RequestBody RestaurantEmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addForOwner(restaurantId, request));
    }

    @DeleteMapping("/{employeeRecordId}")
    public ResponseEntity<Void> remove(@PathVariable Long restaurantId,
            @PathVariable Long employeeRecordId) {
        service.removeForOwner(restaurantId, employeeRecordId);
        return ResponseEntity.noContent().build();
    }
}
