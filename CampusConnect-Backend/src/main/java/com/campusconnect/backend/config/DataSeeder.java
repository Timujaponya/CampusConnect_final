package com.campusconnect.backend.config;

import com.campusconnect.backend.model.*;
import com.campusconnect.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder; // BU IMPORT ÖNEMLİ

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final EventParticipationRepository eventParticipationRepository;
    private final FollowRepository followRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;

    // ŞİFRELEME SERVİSİNİ ÇAĞIRIYORUZ
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // Veritabanı zaten doluysa ekleme yapma
        if (userRepository.count() > 0) {
            return;
        }

        System.out.println("--- SEED DATA YÜKLENİYOR (ŞİFRELİ) ---");

        // 1. KULLANICILAR (Şifreler Hashlenerek Kaydediliyor)
        User admin = createUser("System", "Admin", "admin@kampus.com", "ADMIN", "Rektörlük", "Yönetim", "Sistem Yöneticisi");
        User ali = createUser("Ali", "Yılmaz", "ali@kampus.com", "STUDENT", "Mühendislik", "Bilgisayar Müh.", "Full Stack Developer adayı.");
        User ayse = createUser("Ayşe", "Demir", "ayse@kampus.com", "STUDENT", "Sanat Tasarım", "Mimarlık", "Doğa ve sanat aşığı.");
        User mehmet = createUser("Mehmet", "Kaya", "mehmet@kampus.com", "STUDENT", "İşletme", "Uluslararası İlişkiler", "Girişimcilikle ilgileniyorum.");
        User zeynep = createUser("Zeynep", "Çelik", "zeynep@kampus.com", "STUDENT", "Fen Edebiyat", "Psikoloji", "Kitap kulübü üyesi.");

        userRepository.saveAll(Arrays.asList(admin, ali, ayse, mehmet, zeynep));

        // 2. KULÜPLER
        Club yazilim = createClub("Yazılım Kulübü", "Kodlama, Hackathon ve Teknoloji üzerine her şey.", ali);
        Club doga = createClub("Doğa Gezginleri", "Hafta sonu kampları ve trekking etkinlikleri.", ayse);
        Club sinema = createClub("Sinema Topluluğu", "Film analizleri ve yönetmen söyleşileri.", mehmet);

        clubRepository.saveAll(Arrays.asList(yazilim, doga, sinema));

        // 3. ÜYELİKLER
        joinClub(yazilim, ayse, "MEMBER");
        joinClub(yazilim, mehmet, "ADMIN");
        joinClub(doga, ali, "MEMBER");
        joinClub(doga, zeynep, "MEMBER");
        joinClub(sinema, ayse, "MEMBER");

        // 4. ETKİNLİKLER
        Event reactWorkshop = createEvent("React ile Frontend Atölyesi", "Sıfırdan React öğreniyoruz.", "Lab 203",
                LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(2).plusHours(3), ali, yazilim);

        Event kamp = createEvent("Sapanca Kampı", "Çadırını kap gel!", "Sapanca Gölü",
                LocalDateTime.now().plusDays(5), LocalDateTime.now().plusDays(7), ayse, doga);

        Event filmGecesi = createEvent("Yüzüklerin Efendisi Maratonu", "Extended version izliyoruz.", "Konferans Salonu",
                LocalDateTime.now().minusDays(1), LocalDateTime.now().minusDays(1).plusHours(4), mehmet, sinema);

        eventRepository.saveAll(Arrays.asList(reactWorkshop, kamp, filmGecesi));

        // 5. KATILIMLAR
        joinEvent(reactWorkshop, ayse);
        joinEvent(reactWorkshop, zeynep);
        joinEvent(kamp, ali);
        joinEvent(filmGecesi, ali);

        // 6. TAKİPLEŞMELER
        follow(ali, ayse);
        follow(ayse, ali);
        follow(mehmet, ali);
        follow(zeynep, ayse);

        // 7. MESAJLAR
        sendMessage(ayse, ali, "Selam Ali, React atölyesi saat kaçtaydı?");
        sendMessage(ali, ayse, "Selam, saat 14:00'te başlayacak. Bekliyorum!");
        sendMessage(mehmet, ali, "Hocam kulüp bütçesini ne yaptık?");

        // 8. BİLDİRİMLER
        createNotification(ali, "Ayşe Demir seni takip etmeye başladı.", NotificationType.FOLLOW);
        createNotification(ali, "Mehmet Kaya sana bir mesaj gönderdi.", NotificationType.MESSAGE);
        createNotification(ali, "Katıldığın 'Sapanca Kampı' etkinliği yarın başlıyor!", NotificationType.EVENT_JOIN);
        createNotification(ali, "Doğa Gezginleri yeni bir etkinlik oluşturdu: Şelale Gezisi", NotificationType.CLUB_EVENT);

        System.out.println("--- SEED DATA BAŞARIYLA YÜKLENDİ! ---");
    }

    // --- YARDIMCI METODLAR ---

    private User createUser(String name, String surname, String email, String roleStr, String faculty, String dept, String bio) {
        return User.builder()
                .fullName(name + " " + surname)
                .email(email)
                .passwordHash(passwordEncoder.encode("123456")) // ŞİFRELEME BURADA YAPILIYOR
                .role(Role.valueOf(roleStr))
                .faculty(faculty)
                .department(dept)
                .bio(bio)
                .phone("555-000-0000")
                .createdAt(LocalDateTime.now())
                .build();
    }

    // Diğer metodlar aynı kalıyor (kısaltıldı)
    private Club createClub(String name, String desc, User owner) {
        return Club.builder().name(name).description(desc).owner(owner).createdAt(LocalDateTime.now()).build();
    }
    private void joinClub(Club club, User user, String role) {
        clubMembershipRepository.save(ClubMembership.builder().club(club).user(user).roleInClub(role).status("ACTIVE").joinedAt(LocalDateTime.now()).build());
    }
    private Event createEvent(String title, String desc, String loc, LocalDateTime start, LocalDateTime end, User organizer, Club club) {
        return Event.builder().title(title).description(desc).location(loc).startTime(start).endTime(end).organizer(organizer).club(club).createdAt(LocalDateTime.now()).build();
    }
    private void joinEvent(Event event, User user) {
        eventParticipationRepository.save(EventParticipation.builder().event(event).user(user).status("GOING").joinedAt(LocalDateTime.now()).build());
    }
    private void follow(User follower, User following) {
        followRepository.save(Follow.builder().follower(follower).following(following).createdAt(LocalDateTime.now()).build());
    }
    private void sendMessage(User sender, User receiver, String content) {
        messageRepository.save(Message.builder().senderId(sender.getUserId()).receiverId(receiver.getUserId()).content(content).sentAt(LocalDateTime.now()).build());
    }
    private void createNotification(User user, String text, NotificationType type) {
        notificationRepository.save(Notification.builder().userId(user.getUserId()).text(text).type(type).isRead(false).createdAt(LocalDateTime.now()).build());
    }
}