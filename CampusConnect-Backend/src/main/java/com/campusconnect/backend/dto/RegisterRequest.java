package com.campusconnect.backend.dto;

import com.campusconnect.backend.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private Role role;
}