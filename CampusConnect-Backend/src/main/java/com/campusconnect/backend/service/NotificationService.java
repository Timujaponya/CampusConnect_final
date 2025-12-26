package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.NotificationDTO;
import com.campusconnect.backend.model.Notification;
import com.campusconnect.backend.model.NotificationType;
import com.campusconnect.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // Bildirim Oluştur (Diğer servisler burayı çağırır)
    public void create(Long userId, String text, NotificationType type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .text(text)
                .type(type)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    // Kullanıcının Bildirimlerini Getir
    public List<NotificationDTO> getUserNotifications(Long userId) {
        // En yeniden eskiye doğru sıralı getir
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return notifications.stream()
                .map(this::mapToDTO) // Artık hata vermeyecek çünkü aşağıda tanımladık
                .collect(Collectors.toList());
    }

    // Tümünü Okundu Yap
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    // Tekil Silme
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    // Tümünü Silme
    @Transactional
    public void deleteAll(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }

    // --- EKSİK OLAN METOD BURASIYDI ---
    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .text(notification.getText())
                .type(notification.getType().name()) // Enum'ı String'e çevir
                .isRead(notification.isRead())
                .time(calculateTimeAgo(notification.getCreatedAt())) // Zamanı hesapla
                .build();
    }

    // Zaman Hesaplayıcı (Örn: "5 dk önce")
    private String calculateTimeAgo(LocalDateTime creationTime) {
        if (creationTime == null) return "Şimdi";

        Duration duration = Duration.between(creationTime, LocalDateTime.now());
        long seconds = duration.getSeconds();

        if (seconds < 60) {
            return "Şimdi";
        } else if (seconds < 3600) {
            return (seconds / 60) + " dk önce";
        } else if (seconds < 86400) {
            return (seconds / 3600) + " saat önce";
        } else {
            return (seconds / 86400) + " gün önce";
        }
    }
}