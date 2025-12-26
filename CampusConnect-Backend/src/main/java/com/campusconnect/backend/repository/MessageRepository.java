package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // HATA BURADAYDI: "Timestamp" yerine "SentAt" kullanmalısın.
    // Çünkü Message.java dosyasında değişkenin adı "sentAt".
    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
            Long senderId1, Long receiverId1,
            Long senderId2, Long receiverId2
    );
}