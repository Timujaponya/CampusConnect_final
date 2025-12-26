package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "follows", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"follower_id", "following_id"}) // Aynı kişiyi 2 kere takip edemezsin
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower; // Takip eden

    @ManyToOne
    @JoinColumn(name = "following_id", nullable = false)
    private User following; // Takip edilen

    @CreationTimestamp
    private LocalDateTime createdAt;
}