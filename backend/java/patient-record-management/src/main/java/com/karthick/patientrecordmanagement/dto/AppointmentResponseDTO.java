package com.karthick.patientrecordmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDTO {
    private Long patientId;
    private String name;
    private String mobileNumber;  // This replaces the "mobile" field
    private String dateOfBirth;   // This replaces the "dob" field
    private Double weight;
    private String appointmentDate;  // This replaces the "date" field
    private String appointmentTime;  // This replaces the "time" field
    private String appointmentType;  // This replaces the "type" field
    private String token;
}