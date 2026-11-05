package com.fooddelivery.controller;

import com.fooddelivery.dto.AuthResponse;
import com.fooddelivery.dto.LoginRequest;
import com.fooddelivery.dto.RegisterRequest;
import com.fooddelivery.dto.CompanyAffiliationRequest;
import com.fooddelivery.dto.CompanyAffiliationResponse;
import com.fooddelivery.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

/**
 * REST controller for authentication endpoints (register and login).
 * All routes under {@code /api/auth/**} are publicly accessible.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user.
     *
     * @param request validated registration details
     * @return 201 Created with JWT token and user info
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticate an existing user.
     *
     * @param request validated login credentials
     * @return 200 OK with JWT token and user info
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/company-affiliation")
    public ResponseEntity<CompanyAffiliationResponse> updateCompanyAffiliation(
            @Valid @RequestBody CompanyAffiliationRequest request) {
        return ResponseEntity.ok(authService.updateCompanyAffiliation(request));
    }
}
