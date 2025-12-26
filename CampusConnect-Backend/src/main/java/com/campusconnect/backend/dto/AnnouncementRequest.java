package com.campusconnect.backend.dto;

import lombok.Data;

@Data
public class AnnouncementRequest {
    private String title;
    private String content;
    private Long clubId;     // Hangi kulüp yayınlıyor?
    private Long createdBy;  // Kim yazdı?
}