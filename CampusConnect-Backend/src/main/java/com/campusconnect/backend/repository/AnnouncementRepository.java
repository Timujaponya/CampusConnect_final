package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    // Tarihe göre yeniden eskiye duyurular
    List<Announcement> findAllByOrderByCreatedAtDesc();

    // Sadece belirli bir kulübün duyuruları
    List<Announcement> findByClub_ClubIdOrderByCreatedAtDesc(Long clubId);
}