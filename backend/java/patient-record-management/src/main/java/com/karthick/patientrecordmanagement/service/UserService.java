package com.karthick.patientrecordmanagement.service;

import com.karthick.patientrecordmanagement.model.User;
import com.karthick.patientrecordmanagement.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    public boolean authenticate(String email, String password, HttpServletRequest request) {

        Optional<User> userOptional = userRepository.findByEmail(email);
        String userName = userOptional.get().getUsername();

        boolean isAuthenticated = userOptional
                .map(user -> user.getPassword().equals(password))
                .orElse(false);

//        if (isAuthenticated) {
//            sendLoginEmail(userName, email, request);
//        }
        return isAuthenticated;
    }

    public String getUserRole(String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getRole().name())
                .orElse("UNKNOWN");
    }

//    private void sendLoginEmail(String name, String email, HttpServletRequest request) {
//        String userName = name;
//        String accountEmail = email;
//
//        String loginTimestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy, hh:mm a"));
//
//        String device = request.getHeader("User-Agent");
//
//        String ip = getClientIP(request);
//
//        String messageText = String.format(
//                "Hi %s,\n\n" +
//                        "Your account %s was just signed in to the Patient Record Management System from a new device.\n\n" +
//                        "Login Time: %s\n" +
//                        "Device: %s\n" +
//                        "IP: %s\n\n" +
//                        "If this was you, then you don't need to do anything.",
//                userName, accountEmail, loginTimestamp, device, ip);
//
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(email);
//        message.setSubject("New Device Login Notification");
//        message.setText(messageText);
//        message.setFrom("karthick2410527@ssn.edu.in");
//
//        mailSender.send(message);
//    }
//
//    private String getClientIP(HttpServletRequest request) {
//        String remoteAddr = request.getRemoteAddr();
//        String xForwardedFor = request.getHeader("X-Forwarded-For");
//        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
//            remoteAddr = xForwardedFor.split(",")[0].trim();
//        }
//        return remoteAddr;
//    }
}