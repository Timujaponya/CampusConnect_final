package com.campusconnect.backend.dto;

import lombok.Data;
// LocalDateTime importunu silebilirsin veya kalsın fark etmez

@Data
public class EventRequest {
    private String title;
    private String description;
    private String location;

    // Bunları LocalDateTime yerine String yapıyoruz:
    private String startTime;
    private String endTime;

    private Long organizerId;
    private Long clubId;
}