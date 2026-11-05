package com.fooddelivery.security;

import com.fooddelivery.entity.User;
import com.fooddelivery.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that intercepts every HTTP request and performs JWT-based authentication.
 *
 * <h3>Flow:</h3>
 * <ol>
 *   <li>Extract the {@code Authorization} header.</li>
 *   <li>If the header is absent or does not start with "Bearer ", skip.</li>
 *   <li>Parse the JWT to extract the username (email).</li>
 *   <li>Load the {@link UserDetails} from the database.</li>
 *   <li>Validate the token against the loaded user.</li>
 *   <li><strong>Check if the user is blocked or disabled — reject with 403 if so.</strong></li>
 *   <li>If valid, set a fully-authenticated {@link UsernamePasswordAuthenticationToken}
 *       on the {@link SecurityContextHolder} so downstream filters and controllers
 *       see the user as authenticated.</li>
 * </ol>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // 1. Extract the Authorization header
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract the JWT token (strip "Bearer " prefix)
        final String jwt = authHeader.substring(7);

        // 3. Extract username from token
        final String userEmail;
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception ex) {
            // Token is malformed, expired, or otherwise invalid — skip authentication
            filterChain.doFilter(request, response);
            return;
        }

        // 4. If we have a username and no existing authentication in context
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 5. Load user from database
            User user = userRepository.findByEmail(userEmail).orElse(null);

            if (user != null && jwtService.isTokenValid(jwt, user)) {

                // 6. Check if the user is blocked or account is disabled
                if (user.isBlocked() || !user.isEnabled()) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    String message = user.isBlocked()
                            ? "Your account has been blocked by an administrator. You cannot place orders until an administrator unblocks your account."
                            : "Your account is suspended. Please contact support.";
                    response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"" + message + "\"}");
                    return; // Do NOT proceed down the filter chain
                }

                // 7. Create authentication token and set it in the security context
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                user.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
