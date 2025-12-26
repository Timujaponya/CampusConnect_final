package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.SendMessageRequest; // Bu import önemli
import com.campusconnect.backend.model.Message;
import com.campusconnect.backend.model.NotificationType;
import com.campusconnect.backend.model.User;
import com.campusconnect.backend.repository.MessageRepository;
import com.campusconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void sendMessage(Long senderId, Long receiverId, String content) {

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Gönderen kullanıcı bulunamadı"));

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());

        messageRepository.save(message);

        String notificationText = sender.getFullName() + " sana bir mesaj gönderdi.";

        notificationService.create(
                receiverId,
                notificationText,
                NotificationType.MESSAGE
        );
    }

    // GÜNCELLENMESİ GEREKEN KISIM BURASI:
    public List<Message> getConversation(Long currentUserId, Long otherUserId) {
        // Metot ismini Repository'deki yeni isimle (OrderBySentAtAsc) değiştirdik:
        return messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
                currentUserId, otherUserId,
                otherUserId, currentUserId
        );
    }
}