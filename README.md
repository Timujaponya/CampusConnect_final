# CampusConnect

CampusConnect, üniversite öğrencileri için kulüpler, etkinlikler, mesajlaşma ve bildirim yönetimi sunan modern bir kampüs sosyal platformudur. Hem backend (Spring Boot) hem frontend (React + Vite) ile geliştirilmiştir.

## Özellikler

- **Kulüpler:** Öğrenciler kulüplere katılabilir, yeni kulüp oluşturabilir, üyeliklerini yönetebilir.
- **Etkinlikler:** Kampüs etkinliklerini görüntüleyebilir, katılım sağlayabilir, kendi etkinliğini oluşturabilir.
- **Mesajlaşma:** Kullanıcılar birbirleriyle birebir mesajlaşabilir.
- **Bildirimler:** Takip, mesaj, etkinlik ve kulüp aktiviteleri için gerçek zamanlı bildirimler.
- **Profil Yönetimi:** Kişisel bilgiler, biyografi, bölüm/fakülte ve rol (öğrenci/admin) yönetimi.
- **Admin Paneli:** Kullanıcı, kulüp ve etkinlik yönetimi, silme işlemleri.

## Teknolojiler

- **Backend:** Java 17, Spring Boot, Spring Security, JWT, Hibernate, MySQL
- **Frontend:** React 19, Vite, Axios, React Router, React Toastify, Bootstrap

## Kurulum

### Backend

1. `CampusConnect-Backend` klasöründe `application.properties` dosyasındaki veritabanı ayarlarını kendi ortamınıza göre düzenleyin.
2. Maven ile bağımlılıkları yükleyin ve Spring Boot uygulamasını başlatın:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend

1. `CampusConnect-Frontend` klasöründe bağımlılıkları yükleyin:
   ```bash
   npm install
   npm run dev
   ```

## Kullanım

- Giriş/Kayıt: Kullanıcılar e-posta ve şifre ile kayıt olabilir, giriş yapabilir.
- Dashboard: Etkinlikler, kulüpler ve kullanıcı arama.
- Kulüpler/Etkinlikler: Katılım, oluşturma, ayrılma işlemleri.
- Mesajlar: Birebir sohbet ve geçmiş görüntüleme.
- Bildirimler: Okundu/okunmadı, silme ve toplu yönetim.
- Profil: Kişisel bilgiler ve üyelikler.
- Admin Paneli: Tüm verileri yönetme ve silme.

## API Endpoints (Örnekler)

- `/api/auth/register` - Kayıt
- `/api/auth/login` - Giriş
- `/api/clubs` - Kulüpler
- `/api/events` - Etkinlikler
- `/api/messages` - Mesajlar
- `/api/notifications` - Bildirimler
- `/api/users` - Kullanıcılar

## Katkı ve Lisans

Katkı sağlamak için pull request gönderebilirsiniz. Proje MIT lisansı ile sunulmaktadır.

---

CampusConnect ile kampüs hayatını dijitalleştir!
