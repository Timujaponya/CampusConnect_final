package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.ClubRequest;
import com.campusconnect.backend.model.Club;
import com.campusconnect.backend.model.ClubMembership;
import com.campusconnect.backend.service.ClubService;
import com.campusconnect.backend.repository.UserRepository;
import com.campusconnect.backend.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;
    private final UserRepository userRepository; // Yetki kontrolü için

    public ClubController(ClubService clubService, UserRepository userRepository) {
        this.clubService = clubService;
        this.userRepository = userRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<Club> createClub(@RequestBody ClubRequest request) {
        Club createdClub = clubService.createClub(request);
        return ResponseEntity.ok(createdClub);
    }

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    // --- YENİ: KULÜP SİLME (Admin Only) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClub(@PathVariable Long id, Authentication authentication) {
        User requester = userRepository.findByEmail(authentication.getName()).orElseThrow();

        // Sadece ADMIN veya Kulüp Sahibi silebilir (Basitlik için şimdilik sadece ADMIN ekledik)
        if (!requester.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bunu yapmaya yetkiniz yok.");
        }

        clubService.deleteClub(id); // Service'de bu metodu oluşturacağız
        return ResponseEntity.ok("Kulüp silindi.");
    }

    @PostMapping("/{clubId}/join")
    public ResponseEntity<String> joinClub(@PathVariable Long clubId, @RequestParam Long userId) {
        return ResponseEntity.ok(clubService.joinClub(clubId, userId));
    }

    @GetMapping("/{clubId}/is-member")
    public ResponseEntity<Boolean> isMember(@PathVariable Long clubId, @RequestParam Long userId) {
        return ResponseEntity.ok(clubService.isMember(clubId, userId));
    }

    @DeleteMapping("/{clubId}/leave")
    public ResponseEntity<String> leaveClub(@PathVariable Long clubId, @RequestParam Long userId) {
        return ResponseEntity.ok(clubService.leaveClub(clubId, userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClubMembership>> getUserMemberships(@PathVariable Long userId) {
        return ResponseEntity.ok(clubService.getUserMemberships(userId));
    }

    @GetMapping("/{clubId}/members")
    public ResponseEntity<List<ClubMembership>> getClubMembers(@PathVariable Long clubId) {
        return ResponseEntity.ok(clubService.getClubMembers(clubId));
    }
}