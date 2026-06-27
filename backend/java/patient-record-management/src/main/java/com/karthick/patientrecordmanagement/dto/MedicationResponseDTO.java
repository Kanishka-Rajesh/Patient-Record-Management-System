package com.karthick.patientrecordmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicationResponseDTO {
    private String name;
    private String dosage;
    private String duration;
    private String notes;
}