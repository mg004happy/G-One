package com.fooddelivery.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service responsible for JWT token creation, parsing, and validation.
 *
 * <h3>How it works:</h3>
 * <ol>
 *   <li><strong>Generation</strong> — builds a signed JWT containing the username (subject),
 *       issued-at timestamp, and expiration timestamp.</li>
 *   <li><strong>Extraction</strong> — parses the token and pulls individual claims
 *       (e.g. username, expiration).</li>
 *   <li><strong>Validation</strong> — checks that the token belongs to the given user
 *       and has not expired.</li>
 * </ol>
 */
@Service
public class JwtService {

    private final String secretKey;
    private final long jwtExpirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secretKey,
            @Value("${jwt.expiration-ms}") long jwtExpirationMs) {
        this.secretKey = secretKey;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    // ---- Public API ----

    /**
     * Generate a JWT for the given user.
     *
     * @param userDetails the authenticated user
     * @return signed JWT string
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generate a JWT with extra claims.
     *
     * @param extraClaims additional claims to embed in the token
     * @param userDetails the authenticated user
     * @return signed JWT string
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Extract the username (subject) from a token.
     *
     * @param token JWT string
     * @return the username stored in the token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Validate whether the token is valid for the given user.
     *
     * @param token       JWT string
     * @param userDetails the user to validate against
     * @return true if the token is valid and not expired
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // ---- Internal helpers ----

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        // byte[] keyBytes = Decoders.BASE64URL.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
