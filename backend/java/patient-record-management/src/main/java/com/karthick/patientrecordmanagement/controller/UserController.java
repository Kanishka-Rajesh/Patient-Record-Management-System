package com.karthick.patientrecordmanagement.controller;

import com.karthick.patientrecordmanagement.dto.ApiResponse;
import com.karthick.patientrecordmanagement.model.LoginRequest;
import com.karthick.patientrecordmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://127.0.0.1:5000")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        boolean success = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword(), request);

        if (success) {
            Map<String, String> data = new HashMap<>();
            data.put("role", userService.getUserRole(loginRequest.getEmail()));

            ApiResponse<Map<String, String>> response = new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Login successfully",
                    data
            );

            return ResponseEntity.ok(response);
        } else {
            ApiResponse<Map<String, String>> response = new ApiResponse<>(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Invalid credentials",
                    null
            );

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
