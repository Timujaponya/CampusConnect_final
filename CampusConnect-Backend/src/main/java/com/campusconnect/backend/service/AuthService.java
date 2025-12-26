package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.LoginRequest;
import com.campusconnect.backend.dto.RegisterRequest;
import com.campusconnect.backend.model.Role;
import com.campusconnect.backend.model.User;
import com.campusconnect.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // KAYIT OLMA METODU
    public User register(RegisterRequest request) {
        // 1. Email kontrolü: Zaten var mı?
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Bu email adresi zaten kullanımda.");
        }

        // 2. Yeni kullanıcı oluştur
        User newUser = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(request.getPassword()) // Not: İleride burayı şifreleyeceğiz (BCrypt)
                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                .build();

        // 3. Veritabanına kaydet
        return userRepository.save(newUser);
    }

    // GİRİŞ YAPMA METODU
    public User login(LoginRequest request) {
        // 1. Kullanıcıyı bul
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        // 2. Şifreyi kontrol et (Şimdilik düz metin karşılaştırma)
        if (!user.getPasswordHash().equals(request.getPassword())) {
            throw new RuntimeException("Hatalı şifre!");
        }

        return user;
    }
}