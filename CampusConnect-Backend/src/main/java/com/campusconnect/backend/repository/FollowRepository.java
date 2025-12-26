package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    // Takip ediyor muyum? (Doğru JPA isimlendirmesi: follower içindeki userId'ye bak)
    boolean existsByFollower_UserIdAndFollowing_UserId(Long followerId, Long followingId);

    // Takipten çıkmak için kaydı bul
    Optional<Follow> findByFollower_UserIdAndFollowing_UserId(Long followerId, Long followingId);

    // Takip ettiklerim
    List<Follow> findByFollower_UserId(Long followerId);

    // Beni takip edenler
    List<Follow> findByFollowing_UserId(Long followingId);
}