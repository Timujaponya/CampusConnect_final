package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Bildirim kime gidiyor? (Senin User entity'inle ilişki kurabilirsin)
    private Long userId;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String text; // "Ali seni takip etti" gibi

    private boolean isRead = false; // Varsayılan okunmadı

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}