package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.EventRequest;
import com.campusconnect.backend.model.*; // Hepsini kapsar
import com.campusconnect.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final EventParticipationRepository eventParticipationRepository;

    // YENİ EKLENENLER
    private final ClubMembershipRepository clubMembershipRepository; // Kulüp üyelerine bildirim atmak için
    private final NotificationService notificationService; // Bildirim servisi

    public EventService(EventRepository eventRepository,
                        UserRepository userRepository,
                        ClubRepository clubRepository,
                        EventParticipationRepository eventParticipationRepository,
                        ClubMembershipRepository clubMembershipRepository,
                        NotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.eventParticipationRepository = eventParticipationRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.notificationService = notificationService;
    }

    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAllByOrderByStartTimeAsc();
        for (Event event : events) {
            event.setParticipantCount(eventParticipationRepository.countByEvent_EventId(event.getEventId()));
        }
        return events;
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    // --- SİLME İŞLEMİ VE İPTAL BİLDİRİMİ ---
    @Transactional // Bu işlem bir bütün olarak çalışmalı
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Etkinlik bulunamadı"));

        String eventName = event.getTitle();

        // 1. ADIM: Katılımcıları Bul
        List<EventParticipation> participations = eventParticipationRepository.findByEvent_EventId(id);

        // 2. ADIM: Hepsine "İptal" Bildirimi Gönder
        for (EventParticipation participation : participations) {
            notificationService.create(
                    participation.getUser().getUserId(),
                    "ÜZGÜNÜZ: Katıldığın '" + eventName + "' etkinliği iptal edildi/silindi.",
                    NotificationType.DELETE_ALERT
            );
        }

        // 3. ADIM: Katılımcı Kayıtlarını Tablodan Sil (Constraint Hatasını Önler)
        eventParticipationRepository.deleteByEvent_EventId(id);

        // 4. ADIM: Etkinliği Sil
        eventRepository.delete(event);
    }

    @Transactional
    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    // --- ETKİNLİK OLUŞTURMA VE KULÜP BİLDİRİMİ ---
    @Transactional
    public Event createEvent(EventRequest request) {
        User organizer = userRepository.findById(request.getOrganizerId()).orElseThrow(() -> new RuntimeException("Organizatör bulunamadı"));
        Club club = null;

        if (request.getClubId() != null) {
            club = clubRepository.findById(request.getClubId()).orElseThrow(() -> new RuntimeException("Kulüp bulunamadı"));
        }

        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        Event newEvent = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .startTime(LocalDateTime.parse(request.getStartTime(), formatter))
                .endTime(LocalDateTime.parse(request.getEndTime(), formatter))
                .organizer(organizer)
                .club(club)
                .build();

        Event savedEvent = eventRepository.save(newEvent);

        // KULÜP ETKİNLİĞİ İSE ÜYELERE BİLDİRİM GÖNDER
        if (club != null) {
            List<ClubMembership> members = clubMembershipRepository.findByClub_ClubId(club.getClubId());
            for (ClubMembership membership : members) {
                // Organizatörün kendisine bildirim gitmesin
                if (!membership.getUser().getUserId().equals(organizer.getUserId())) {
                    notificationService.create(
                            membership.getUser().getUserId(),
                            club.getName() + ", '" + savedEvent.getTitle() + "' etkinliğini oluşturdu.",
                            NotificationType.CLUB_EVENT
                    );
                }
            }
        }

        return savedEvent;
    }

    // --- ETKİNLİĞE KATILMA VE ORGANİZATÖR BİLDİRİMİ ---
    @Transactional
    public String joinEvent(Long eventId, Long userId) {
        if (eventParticipationRepository.existsByUser_UserIdAndEvent_EventId(userId, eventId)) {
            return "Zaten katılıyorsunuz.";
        }
        User user = userRepository.findById(userId).orElseThrow();
        Event event = eventRepository.findById(eventId).orElseThrow();

        EventParticipation participation = EventParticipation.builder()
                .user(user)
                .event(event)
                .status("GOING")
                .build();

        eventParticipationRepository.save(participation);

        // ORGANİZATÖRE BİLDİRİM GÖNDER
        // Kendi etkinliğine katılıyorsan bildirim gitmesin
        if (!event.getOrganizer().getUserId().equals(userId)) {
            notificationService.create(
                    event.getOrganizer().getUserId(),
                    user.getFullName() + ", '" + event.getTitle() + "' etkinliğine katıldı.",
                    NotificationType.EVENT_JOIN
            );
        }

        return "Etkinliğe katıldınız!";
    }

    @Transactional
    public String leaveEvent(Long eventId, Long userId) {
        if (!eventParticipationRepository.existsByUser_UserIdAndEvent_EventId(userId, eventId)) {
            throw new RuntimeException("Zaten katılmıyorsunuz.");
        }
        eventParticipationRepository.deleteByUser_UserIdAndEvent_EventId(userId, eventId);
        return "Etkinlikten ayrıldınız.";
    }

    public boolean isAttending(Long eventId, Long userId) {
        return eventParticipationRepository.existsByUser_UserIdAndEvent_EventId(userId, eventId);
    }

    public List<EventParticipation> getUserParticipations(Long userId) {
        return eventParticipationRepository.findByUser_UserId(userId);
    }

    public List<Event> getEventsByClub(Long clubId) {
        return eventRepository.findByClub_ClubId(clubId);
    }
}