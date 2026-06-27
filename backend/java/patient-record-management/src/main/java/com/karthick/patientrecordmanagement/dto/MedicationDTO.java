package com.karthick.patientrecordmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationDTO {
    private String medicationName;
    private int dosage;      // in mg
    private int duration;    // in days
    private int frequency;   // times per day
}