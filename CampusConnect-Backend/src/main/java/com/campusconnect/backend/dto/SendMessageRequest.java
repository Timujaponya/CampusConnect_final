package com.campusconnect.backend.dto;

import lombok.Data;

@Data
public class SendMessageRequest {
    private Long receiverId; // Mesajı kime atıyoruz? (User ID)
    private String content;  // Mesajın içeriği ne?
}