package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.ClubMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {
    boolean existsByUser_UserIdAndClub_ClubId(Long userId, Long clubId);
    List<ClubMembership> findByUser_UserId(Long userId);
    List<ClubMembership> findByClub_ClubId(Long clubId);

    @Transactional
    void deleteByUser_UserIdAndClub_ClubId(Long userId, Long clubId);

    // --- YENİ EKLENEN: Üye Sayısını Getir ---
    int countByClub_ClubId(Long clubId);


    void deleteByClub_ClubId(Long clubId);
}