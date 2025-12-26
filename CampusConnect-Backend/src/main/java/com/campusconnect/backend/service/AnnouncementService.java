package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AnnouncementRequest;
import com.campusconnect.backend.model.Announcement;
import com.campusconnect.backend.model.Club;
import com.campusconnect.backend.model.User;
import com.campusconnect.backend.repository.AnnouncementRepository;
import com.campusconnect.backend.repository.ClubRepository;
import com.campusconnect.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository, ClubRepository clubRepository, UserRepository userRepository) {
        this.announcementRepository = announcementRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
    }

    public Announcement createAnnouncement(AnnouncementRequest request) {
        Club club = clubRepository.findById(request.getClubId())
                .orElseThrow(() -> new RuntimeException("Kulüp bulunamadı."));
        User user = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .club(club)
                .createdBy(user)
                .build();

        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAnnouncementsByClub(Long clubId) {
        return announcementRepository.findByClub_ClubIdOrderByCreatedAtDesc(clubId);
    }
}