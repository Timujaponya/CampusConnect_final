package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClubRepository extends JpaRepository<Club, Long> {
    // İleride isme göre kulüp arama vb. gerekirse buraya ekleyeceğiz
}