package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.AnnouncementRequest;
import com.campusconnect.backend.model.Announcement;
import com.campusconnect.backend.service.AnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping("/create")
    public ResponseEntity<Announcement> create(@RequestBody AnnouncementRequest request) {
        return ResponseEntity.ok(announcementService.createAnnouncement(request));
    }

    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<Announcement>> getByClub(@PathVariable Long clubId) {
        return ResponseEntity.ok(announcementService.getAnnouncementsByClub(clubId));
    }
}