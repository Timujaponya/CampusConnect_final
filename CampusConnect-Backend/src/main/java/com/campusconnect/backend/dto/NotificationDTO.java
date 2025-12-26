package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String text;   // "Ali seni takip etti"
    private String type;   // "FOLLOW", "MESSAGE" vs.
    private boolean isRead;
    private String time;   // "2 dk önce", "Şimdi" vs.
}