package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.NotificationDTO;
import com.campusconnect.backend.model.User;
import com.campusconnect.backend.repository.UserRepository;
import com.campusconnect.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // <-- EKSİK OLAN SATIR BUYDU
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // GÜVENLİ USER ID ALMA METODU (Debug Loglu)
    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            System.err.println("!!! HATA: Authentication nesnesi boş! Token gönderilmemiş olabilir.");
            return null;
        }

        String email = authentication.getName();
        System.out.println(">>> İstek Atan Kullanıcı Email: " + email);

        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .orElseGet(() -> {
                    System.err.println("!!! HATA: Email veritabanında bulunamadı: " + email);
                    return null;
                });
    }

    @GetMapping
    public ResponseEntity<?> getAllNotifications(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);

        // Kimlik kontrolü logları
        if (userId != null) {
            System.out.println("=========================================");
            System.out.println("KİMLİK DOĞRULANDI (GET Notifications)");
            System.out.println("Veritabanı ID: " + userId);
            System.out.println("=========================================");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Giriş yapmalısınız.");
        }

        try {
            List<NotificationDTO> notifs = notificationService.getUserNotifications(userId);
            System.out.println(">>> " + userId + " ID'li kullanıcıya " + notifs.size() + " bildirim dönüldü.");
            return ResponseEntity.ok(notifs);
        } catch (Exception e) {
            System.err.println("!!! Service Hatası: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        if (userId != null) {
            notificationService.markAllAsRead(userId);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<Void> deleteAll(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        if (userId != null) {
            notificationService.deleteAll(userId);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    // TEST METODU
    @PostMapping("/test-seed")
    public ResponseEntity<Void> createTestNotification(@RequestParam String type, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        if (userId != null) {
            String text = "Test Bildirimi";
            try {
                com.campusconnect.backend.model.NotificationType notifType = com.campusconnect.backend.model.NotificationType.valueOf(type);
                notificationService.create(userId, text, notifType);
            } catch (Exception e) {
                System.out.println("Type hatası, varsayılan atandı.");
            }
        }
        return ResponseEntity.ok().build();
    }
}