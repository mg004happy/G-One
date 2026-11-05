package com.fooddelivery.config;

import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


/**
 * Central Spring Security configuration.
 *
 * <h3>Key decisions:</h3>
 * <ul>
 *   <li>CSRF disabled — the API is stateless and token-based.</li>
 *   <li>Sessions set to STATELESS — no server-side session is created.</li>
 *   <li>{@code /api/auth/**} is publicly accessible; everything else requires authentication.</li>
 *   <li>GET requests to {@code /api/restaurants/**} and {@code /api/foods/**} are public (browse menus).</li>
 *   <li>{@link JwtAuthenticationFilter} is registered <em>before</em>
 *       {@link UsernamePasswordAuthenticationFilter} so that JWT-based auth runs first.</li>
 *   <li>{@code @EnableMethodSecurity} enables {@code @PreAuthorize} annotations on controllers.</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserRepository userRepository;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserRepository userRepository) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userRepository = userRepository;
    }

    /**
     * Configures the security filter chain.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF (stateless JWT auth doesn't need it)
                .csrf(AbstractHttpConfigurer::disable)

                // Enable CORS with the CorsConfig bean
                .cors(cors -> {})

                // Define URL authorization rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/companies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/restaurants/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/foods/**").permitAll()
                        // Search & recommendations — public
                        .requestMatchers(HttpMethod.GET, "/api/search/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/recommendations/**").permitAll()
                        // Reviews — public read, authenticated write
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .anyRequest().authenticated()
                )

                // Stateless session — no HttpSession
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Register custom authentication provider
                .authenticationProvider(authenticationProvider())

                // Add JWT filter before Spring's default username/password filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * UserDetailsService that loads users by email from the database.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + username));
    }

    /**
     * Authentication provider using our custom UserDetailsService and BCrypt encoder.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Exposes the AuthenticationManager so it can be injected into AuthService.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BCrypt password encoder.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
