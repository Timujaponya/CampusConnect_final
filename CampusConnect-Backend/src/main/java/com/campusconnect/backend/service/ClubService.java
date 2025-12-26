package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.ClubRequest;
import com.campusconnect.backend.model.*;
import com.campusconnect.backend.repository.*;
import org.springframework.context.annotation.Lazy; // Döngüsel bağımlılık çözümü için
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClubService {

    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final NotificationService notificationService;

    // Silme işlemi için gerekli olan eksik servisler:
    private final EventRepository eventRepository;
    private final EventService eventService;

    // Constructor Injection
    public ClubService(ClubRepository clubRepository,
                       UserRepository userRepository,
                       ClubMembershipRepository clubMembershipRepository,
                       NotificationService notificationService,
                       EventRepository eventRepository,
                       @Lazy EventService eventService) { // @Lazy: EventService henüz oluşmadıysa bekle
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.notificationService = notificationService;
        this.eventRepository = eventRepository;
        this.eventService = eventService;
    }

    public List<Club> getAllClubs() {
        List<Club> clubs = clubRepository.findAll();
        for (Club club : clubs) {
            club.setMemberCount(clubMembershipRepository.countByClub_ClubId(club.getClubId()));
        }
        return clubs;
    }

    // --- GÜNCELLENEN SİLME METODU (Tam Donanımlı) ---
    @Transactional
    public void deleteClub(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new RuntimeException("Kulüp bulunamadı.");
        }

        Club club = clubRepository.findById(clubId).get();
        String clubName = club.getName();

        // 1. ADIM: Üyeleri Bul ve "Kulüp Silindi" Bildirimi Gönder
        List<ClubMembership> memberships = clubMembershipRepository.findByClub_ClubId(clubId);
        for (ClubMembership member : memberships) {
            notificationService.create(
                    member.getUser().getUserId(),
                    "DUYURU: Üyesi olduğun '" + clubName + "' kulübü kapatıldı.",
                    NotificationType.DELETE_ALERT
            );
        }

        // 2. ADIM: Üyelikleri Sil
        clubMembershipRepository.deleteByClub_ClubId(clubId);

        // 3. ADIM: Kulübe Bağlı Etkinlikleri Sil
        // Not: EventService.deleteEvent metodunu kullanıyoruz ki etkinlik katılımcılarına da bildirim gitsin.
        List<Event> clubEvents = eventRepository.findByClub_ClubId(clubId);
        for (Event event : clubEvents) {
            eventService.deleteEvent(event.getEventId());
        }

        // 4. ADIM: Kulübü Sil
        clubRepository.deleteById(clubId);
    }

    @Transactional
    public Club createClub(ClubRequest request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı ID: " + request.getOwnerId()));

        Club newClub = Club.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .build();

        return clubRepository.save(newClub);
    }

    @Transactional
    public String joinClub(Long clubId, Long userId) {
        if (clubMembershipRepository.existsByUser_UserIdAndClub_ClubId(userId, clubId)) {
            return "Zaten bu kulübün üyesisiniz.";
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));
        Club club = clubRepository.findById(clubId).orElseThrow(() -> new RuntimeException("Kulüp bulunamadı."));

        ClubMembership membership = ClubMembership.builder()
                .user(user).club(club).roleInClub("MEMBER").status("ACTIVE").build();

        clubMembershipRepository.save(membership);

        // BİLDİRİM OLUŞTUR (Kulüp Sahibine)
        if (!club.getOwner().getUserId().equals(userId)) {
            notificationService.create(
                    club.getOwner().getUserId(),
                    user.getFullName() + ", '" + club.getName() + "' kulübüne katıldı.",
                    NotificationType.CLUB_JOIN
            );
        }

        return "Kulübe başarıyla üye oldunuz!";
    }

    public List<ClubMembership> getUserMemberships(Long userId) {
        return clubMembershipRepository.findByUser_UserId(userId);
    }

    public boolean isMember(Long clubId, Long userId) {
        return clubMembershipRepository.existsByUser_UserIdAndClub_ClubId(userId, clubId);
    }

    @Transactional
    public String leaveClub(Long clubId, Long userId) {
        if (!clubMembershipRepository.existsByUser_UserIdAndClub_ClubId(userId, clubId)) {
            throw new RuntimeException("Zaten üye değilsiniz.");
        }
        clubMembershipRepository.deleteByUser_UserIdAndClub_ClubId(userId, clubId);
        return "Kulüpten ayrıldınız.";
    }

    public List<ClubMembership> getClubMembers(Long clubId) {
        return clubMembershipRepository.findByClub_ClubId(clubId);
    }
}