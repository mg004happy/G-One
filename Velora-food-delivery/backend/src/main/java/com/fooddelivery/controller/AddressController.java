package com.fooddelivery.controller;

import com.fooddelivery.dto.AddressRequest;
import com.fooddelivery.dto.AddressResponse;
import com.fooddelivery.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for delivery address management.
 * All endpoints are restricted to authenticated users with the {@code CUSTOMER} role.
 */
@RestController
@RequestMapping("/api/addresses")
@PreAuthorize("hasRole('CUSTOMER')")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    /**
     * Add a new delivery address.
     */
    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(
            @Valid @RequestBody AddressRequest request) {
        AddressResponse response = addressService.addAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all addresses for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses() {
        List<AddressResponse> addresses = addressService.getMyAddresses();
        return ResponseEntity.ok(addresses);
    }

    /**
     * Get a specific address by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AddressResponse> getAddressById(@PathVariable Long id) {
        AddressResponse response = addressService.getAddressById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing address.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        AddressResponse response = addressService.updateAddress(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an address.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Set an address as the default delivery address.
     */
    @PutMapping("/{id}/default")
    public ResponseEntity<AddressResponse> setDefaultAddress(@PathVariable Long id) {
        AddressResponse response = addressService.setDefaultAddress(id);
        return ResponseEntity.ok(response);
    }
}
