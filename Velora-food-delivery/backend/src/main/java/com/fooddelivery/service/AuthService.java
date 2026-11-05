package com.fooddelivery.service;

import com.fooddelivery.dto.AuthResponse;
import com.fooddelivery.dto.LoginRequest;
import com.fooddelivery.dto.RegisterRequest;
import com.fooddelivery.dto.CompanyAffiliationRequest;
import com.fooddelivery.dto.CompanyAffiliationResponse;
import com.fooddelivery.entity.User;
import com.fooddelivery.entity.Role;
import com.fooddelivery.entity.TieUpDeparture;
import com.fooddelivery.exception.InvalidCredentialsException;
import com.fooddelivery.exception.ResourceAlreadyExistsException;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.RestaurantEmployeeRepository;
import com.fooddelivery.repository.TieUpDepartureRepository;
import com.fooddelivery.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling user registration and login.
 *
 * <h3>Register flow:</h3>
 * <ol>
 *   <li>Check if email is already taken → throw 409 if so.</li>
 *   <li>Encode the raw password with BCrypt.</li>
 *   <li>Persist the new {@link User} entity.</li>
 *   <li>Generate a JWT for the new user.</li>
 *   <li>Return an {@link AuthResponse} containing the token and user info.</li>
 * </ol>
 *
 * <h3>Login flow:</h3>
 * <ol>
 *   <li>Authenticate credentials via Spring Security's {@link AuthenticationManager}.</li>
 *   <li>If authentication fails → throw 401.</li>
 *   <li>Load the user from the database.</li>
 *   <li>Generate a JWT.</li>
 *   <li>Return an {@link AuthResponse}.</li>
 * </ol>
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantEmployeeRepository employeeRepository;
    private final TieUpDepartureRepository tieUpDepartureRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       RestaurantRepository restaurantRepository,
                       RestaurantEmployeeRepository employeeRepository,
                       TieUpDepartureRepository tieUpDepartureRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.employeeRepository = employeeRepository;
        this.tieUpDepartureRepository = tieUpDepartureRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Register a new user.
     *
     * @param request the registration details
     * @return an AuthResponse with JWT token and user info
     */
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);
        String phoneNumber = request.getPhoneNumber().trim().replaceAll("[\\s().-]", "");
        boolean companyAffiliated = request.getRole() == Role.CUSTOMER
                && Boolean.TRUE.equals(request.getCompanyAffiliated());
        String company = companyAffiliated && request.getAffiliatedCompany() != null
                ? request.getAffiliatedCompany().trim() : null;
        String employeeId = companyAffiliated && request.getEmployeeId() != null
                ? request.getEmployeeId().trim() : null;

        if (companyAffiliated) {
            if (company == null || company.isBlank()) {
                throw new IllegalArgumentException("Select your affiliated company");
            }
            if (employeeId == null || employeeId.isBlank()) {
                throw new IllegalArgumentException("Employee ID is required for company affiliation");
            }
            if (!restaurantRepository.findDistinctApprovedTieUpCompanies().stream().anyMatch(c -> c.equalsIgnoreCase(company))) {
                throw new IllegalArgumentException("Select a company currently listed by an approved restaurant");
            }
            if (!employeeRepository.isVerifiedEmployee(company, employeeId, request.getFullName())) {
                throw new IllegalArgumentException("Employee name and ID could not be verified for the selected company");
            }
        }

        // Check for duplicate email
        if (userRepository.existsByEmailNormalized(email)) {
            throw new ResourceAlreadyExistsException("An account with this email address already exists");
        }
        if (userRepository.existsByPhoneNumberNormalized(phoneNumber)) {
            throw new ResourceAlreadyExistsException("An account with this phone number already exists");
        }

        // Build and save user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(email)
                .phoneNumber(phoneNumber)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .companyAffiliated(companyAffiliated)
                .affiliatedCompany(company)
                .employeeId(employeeId)
                .build();

        userRepository.save(user);

        // Generate JWT
        String token = jwtService.generateToken(user);

        return buildAuthResponse(token, user);
    }

    /**
     * Authenticate an existing user.
     *
     * @param request the login credentials
     * @return an AuthResponse with JWT token and user info
     */
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Fetch user (authentication already confirmed the user exists)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // Generate JWT
        String token = jwtService.generateToken(user);

        return buildAuthResponse(token, user);
    }

    @Transactional
    public CompanyAffiliationResponse updateCompanyAffiliation(CompanyAffiliationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Please sign in to update company affiliation");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new InvalidCredentialsException("Authenticated user not found"));
        if (user.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException("Only customer accounts can set a company affiliation");
        }

        String company = request.getAffiliatedCompany() == null ? null : request.getAffiliatedCompany().trim();
        String employeeId = request.getEmployeeId() == null ? null : request.getEmployeeId().trim();
        if (request.isCompanyAffiliated()) {
            if (company == null || company.isBlank()) {
                throw new IllegalArgumentException("Select your affiliated company");
            }
            if (employeeId == null || employeeId.isBlank()) {
                throw new IllegalArgumentException("Employee ID is required for company affiliation");
            }
            if (!restaurantRepository.findDistinctApprovedTieUpCompanies().stream().anyMatch(c -> c.equalsIgnoreCase(company))) {
                throw new IllegalArgumentException("Select a company currently listed by an approved restaurant");
            }
            if (!employeeRepository.isVerifiedEmployee(company, employeeId, user.getFullName())) {
                throw new IllegalArgumentException("Employee name and ID could not be verified for the selected company");
            }
            tieUpDepartureRepository.deleteByCustomerEmailIgnoreCaseAndCompanyNameIgnoreCase(
                    user.getEmail(), company);
            user.setCompanyAffiliated(true);
            user.setAffiliatedCompany(company);
            user.setEmployeeId(employeeId);
        } else {
            if (user.isCompanyAffiliated() && user.getAffiliatedCompany() != null) {
                TieUpDeparture departure = new TieUpDeparture();
                departure.setCustomerName(user.getFullName());
                departure.setCustomerEmail(user.getEmail());
                departure.setPhoneNumber(user.getPhoneNumber());
                departure.setCompanyName(user.getAffiliatedCompany());
                departure.setEmployeeId(user.getEmployeeId());
                tieUpDepartureRepository.save(departure);
            }
            user.setCompanyAffiliated(false);
            user.setAffiliatedCompany(null);
            user.setEmployeeId(null);
        }

        User saved = userRepository.save(user);
        return CompanyAffiliationResponse.builder()
                .companyAffiliated(saved.isCompanyAffiliated())
                .affiliatedCompany(saved.getAffiliatedCompany())
                .employeeId(saved.getEmployeeId())
                .build();
    }

    // ---- Helper ----

    private AuthResponse buildAuthResponse(String token, User user) {
        boolean verifiedAffiliation = user.isCompanyAffiliated()
                && user.getAffiliatedCompany() != null
                && user.getEmployeeId() != null
                && employeeRepository.isVerifiedEmployee(
                        user.getAffiliatedCompany(), user.getEmployeeId(), user.getFullName());
        return AuthResponse.builder()
                .token(token)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .companyAffiliated(verifiedAffiliation)
                .affiliatedCompany(user.getAffiliatedCompany())
                .employeeId(user.getEmployeeId())
                .build();
    }
}
