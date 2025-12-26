package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    // Tüm etkinlikleri tarihe göre sıralı getir (En yakından uzağa)
    List<Event> findAllByOrderByStartTimeAsc();

    // Belirli bir kulübün etkinliklerini getir
    List<Event> findByClub_ClubId(Long clubId);


}