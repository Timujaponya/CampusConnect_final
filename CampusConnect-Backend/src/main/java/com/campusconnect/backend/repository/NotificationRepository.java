package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Sadece bana ait olanları getir (Başkalarınınkini asla getirme)
    // Eğer Entity'de "User user" kullanıyorsan: findByUser_UserIdOrderByCreatedAtDesc
    // Eğer Entity'de "Long userId" kullanıyorsan: findByUserIdOrderByCreatedAtDesc

    // Bizim yapımızda User userId (Long) kullanıyorduk, o yüzden:
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserId(Long userId);
}