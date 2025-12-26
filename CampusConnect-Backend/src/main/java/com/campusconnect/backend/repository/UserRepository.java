package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Email ile kullanıcı bulma (Login işlemi için gerekli)
    Optional<User> findByEmail(String email);
}