package com.campusconnect.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // Güvenlik için en az 256-bit (32 karakter) bir gizli anahtar
    // Gerçek projede bunu application.properties dosyasından çekmek daha iyidir.
    private static final String JWT_SECRET = "BurayaCokGizliVeUzunBirAnahtarYazmanGerekiyor123456";
    private static final long JWT_EXPIRATION_MS = 86400000; // 1 Gün

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }

    public String generateToken(Authentication authentication) {
        String username = authentication.getName(); // UserDetails'den username alır

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + JWT_EXPIRATION_MS))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException e) {
            System.err.println("Geçersiz JWT imzası: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("Geçersiz JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("JWT süresi dolmuş: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("Desteklenmeyen JWT token: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claim string boş: " + e.getMessage());
        }
        return false;
    }
}