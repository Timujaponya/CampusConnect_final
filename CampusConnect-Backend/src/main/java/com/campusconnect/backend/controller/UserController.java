package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.User;
import com.campusconnect.backend.service.UserService;
import com.campusconnect.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/search")
    public List<User> search(@RequestParam String query) {
        return userService.searchUsers(query);
    }

    // --- GÜNCELLENEN TAKİP ETME METODU (JWT Kullanır) ---
    @PostMapping("/{targetId}/follow")
    public ResponseEntity<String> follow(@PathVariable Long targetId, Authentication authentication) {
        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUsername)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        return ResponseEntity.ok(userService.toggleFollow(currentUser.getUserId(), targetId));
    }

    @GetMapping("/{userId}/mutuals")
    public List<User> getMutuals(@PathVariable Long userId) {
        return userService.getMutualFollows(userId);
    }

    // --- YENİ: KULLANICI SİLME (Sadece Admin veya Kendisi) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication authentication) {
        User requester = userRepository.findByEmail(authentication.getName()).orElseThrow();

        // Yetki Kontrolü: Admin mi veya kendi hesabını mı siliyor?
        if (!requester.getRole().name().equals("ADMIN") && !requester.getUserId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Yetkisiz işlem.");
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("Kullanıcı silindi.");
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @RequestBody User userDetails) {
        return userRepository.findById(userId).map(user -> {
            user.setFullName(userDetails.getFullName());
            user.setPhone(userDetails.getPhone());
            user.setFaculty(userDetails.getFaculty());
            user.setDepartment(userDetails.getDepartment());
            user.setBio(userDetails.getBio());

            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }).orElse(ResponseEntity.notFound().build());
    }
}