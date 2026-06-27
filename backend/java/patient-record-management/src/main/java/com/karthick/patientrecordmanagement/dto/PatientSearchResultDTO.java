package com.karthick.patientrecordmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientSearchResultDTO {
    private Long id;
    private String name;
    private String dateOfBirth;
    private double weight;
    private String mobileNumber;
}