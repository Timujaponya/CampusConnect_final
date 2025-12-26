package com.campusconnect.backend.controller;

import com.campusconnect.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Eğer DTO kullanıyorsan onu import et, yoksa Map veya kendi sınıfını kullan
import com.campusconnect.backend.dto.SendMessageRequest;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    // Artık Repository değil, Service kullanıyoruz
    private final MessageService messageService;

    // TODO: Gerçek projede ID'yi token'dan (SecurityContext) almalısın.
    private Long getCurrentUserId() {
        return 1L; // Test için sabit ID
    }

    @PostMapping("/send")
    public ResponseEntity<Void> sendMessage(@RequestBody SendMessageRequest request) {
        Long senderId = getCurrentUserId();

        // Service'i 3 parametre ile çağırıyoruz, Service'i buna uygun hale getirdik.
        messageService.sendMessage(senderId, request.getReceiverId(), request.getContent());

        return ResponseEntity.ok().build();
    }
}