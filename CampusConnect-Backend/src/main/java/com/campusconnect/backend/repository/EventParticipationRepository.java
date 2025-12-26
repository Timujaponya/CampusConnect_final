package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.EventParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface EventParticipationRepository extends JpaRepository<EventParticipation, Long> {
    // Kullanıcı katılıyor mu?
    boolean existsByUser_UserIdAndEvent_EventId(Long userId, Long eventId);

    // Etkinliğin katılımcılarını getir
    List<EventParticipation> findByEvent_EventId(Long eventId);

    // Kullanıcının katıldığı etkinlikler
    List<EventParticipation> findByUser_UserId(Long userId);

    // Ayrılma (Silme)
    @Transactional
    void deleteByUser_UserIdAndEvent_EventId(Long userId, Long eventId);

    // --- YENİ: Katılımcı Sayısı ---
    int countByEvent_EventId(Long eventId);


    // Etkinliğe ait tüm katılımları sil
    void deleteByEvent_EventId(Long eventId);


}