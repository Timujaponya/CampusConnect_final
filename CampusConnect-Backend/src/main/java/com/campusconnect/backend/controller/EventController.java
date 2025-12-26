package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.EventRequest;
import com.campusconnect.backend.model.Event;
import com.campusconnect.backend.model.EventParticipation;
import com.campusconnect.backend.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping("/create")
    public ResponseEntity<Event> create(@RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.createEvent(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, Authentication authentication) {
        try {
            Event event = eventService.getEventById(id);
            if (event == null) return ResponseEntity.notFound().build();

            if (!isAuthorized(authentication, event)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Yetkiniz yok.");
            }

            eventService.deleteEvent(id);
            return ResponseEntity.ok("Etkinlik silindi.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- DÜZELTİLEN METOD ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Event updatedEvent, Authentication authentication) {
        try {
            Event existingEvent = eventService.getEventById(id);
            if (existingEvent == null) return ResponseEntity.notFound().build();

            if (!isAuthorized(authentication, existingEvent)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Yetkiniz yok.");
            }

            // Hata veren kısım düzeltildi:
            existingEvent.setTitle(updatedEvent.getTitle());
            existingEvent.setDescription(updatedEvent.getDescription());
            existingEvent.setLocation(updatedEvent.getLocation());

            // getDate() yerine startTime ve endTime kullanıyoruz
            existingEvent.setStartTime(updatedEvent.getStartTime());
            existingEvent.setEndTime(updatedEvent.getEndTime());

            eventService.saveEvent(existingEvent);
            return ResponseEntity.ok(existingEvent);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean isAuthorized(Authentication authentication, Event event) {
        if (authentication == null) return false;

        String currentEmail = authentication.getName();

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

        boolean isOwner = event.getOrganizer() != null && event.getOrganizer().getEmail().equals(currentEmail);

        return isAdmin || isOwner;
    }

    @PostMapping("/{eventId}/join")
    public ResponseEntity<String> join(@PathVariable Long eventId, @RequestParam Long userId) {
        return ResponseEntity.ok(eventService.joinEvent(eventId, userId));
    }

    @DeleteMapping("/{eventId}/leave")
    public ResponseEntity<String> leave(@PathVariable Long eventId, @RequestParam Long userId) {
        return ResponseEntity.ok(eventService.leaveEvent(eventId, userId));
    }

    @GetMapping("/{eventId}/is-attending")
    public ResponseEntity<Boolean> isAttending(@PathVariable Long eventId, @RequestParam Long userId) {
        return ResponseEntity.ok(eventService.isAttending(eventId, userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EventParticipation>> getUserParticipations(@PathVariable Long userId) {
        return ResponseEntity.ok(eventService.getUserParticipations(userId));
    }
}