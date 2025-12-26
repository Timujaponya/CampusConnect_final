package com.campusconnect.backend.dto;

import lombok.Data;

@Data
public class ClubRequest {
    private String name;
    private String description;
    private Long ownerId; // Kulübü kuran kişinin ID'si
}