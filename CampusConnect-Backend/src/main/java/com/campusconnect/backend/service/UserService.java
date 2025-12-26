package com.campusconnect.backend.service;

import com.campusconnect.backend.model.Follow;
import com.campusconnect.backend.model.NotificationType;
import com.campusconnect.backend.model.User;
import com.campusconnect.backend.repository.FollowRepository;
import com.campusconnect.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final NotificationService notificationService; // Bildirim Servisi

    // Constructor Injection
    public UserService(UserRepository userRepository, FollowRepository followRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.notificationService = notificationService;
    }

    public List<User> searchUsers(String query) {
        if (query == null || query.isBlank()) {
            return userRepository.findAll();
        }
        return userRepository.findAll().stream()
                .filter(u -> u.getFullName().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }

    @Transactional
    public String toggleFollow(Long currentUserId, Long targetUserId) {
        // Validasyonlar
        if (currentUserId.equals(targetUserId)) throw new RuntimeException("Kendini takip edemezsin.");

        boolean isFollowing = followRepository.existsByFollower_UserIdAndFollowing_UserId(currentUserId, targetUserId);

        if (isFollowing) {
            // TAKİPTEN ÇIKMA
            Follow follow = followRepository.findByFollower_UserIdAndFollowing_UserId(currentUserId, targetUserId).get();
            followRepository.delete(follow);
            return "Takipten çıkıldı.";
        } else {
            // TAKİP ETME
            User follower = userRepository.findById(currentUserId).orElseThrow(); // Takip Eden (Ali)
            User targetUser = userRepository.findById(targetUserId).orElseThrow(); // Takip Edilen (SysAdmin)

            Follow newFollow = Follow.builder()
                    .follower(follower)
                    .following(targetUser)
                    .build();

            followRepository.save(newFollow);

            // --- KRİTİK NOKTA: BİLDİRİM KİME GİDECEK? ---

            // Yanlış Olan: follower.getUserId() (Ali'ye geri döner)
            // Doğru Olan: targetUser.getUserId() (SysAdmin'e gider)

            String notificationText = follower.getFullName() + " seni takip etmeye başladı.";

            System.out.println("LOG: Bildirim Gönderiliyor -> KİMDEN: " + follower.getFullName() + " KİME: " + targetUser.getFullName());

            notificationService.create(
                    targetUser.getUserId(),  // <--- BURASI targetUser OLMALI
                    notificationText,
                    NotificationType.FOLLOW
            );

            return "Takip edildi.";
        }
    }

    public List<User> getMutualFollows(Long userId) {
        List<Long> followingIds = followRepository.findByFollower_UserId(userId).stream()
                .map(f -> f.getFollowing().getUserId())
                .collect(Collectors.toList());

        List<Long> followerIds = followRepository.findByFollowing_UserId(userId).stream()
                .map(f -> f.getFollower().getUserId())
                .collect(Collectors.toList());

        followingIds.retainAll(followerIds);
        return userRepository.findAllById(followingIds);
    }

    public boolean isFollowing(Long currentUserId, Long targetUserId) {
        return followRepository.existsByFollower_UserIdAndFollowing_UserId(currentUserId, targetUserId);
    }
}