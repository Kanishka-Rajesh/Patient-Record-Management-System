package com.karthick.patientrecordmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDTO {
    private String date;
    private String symptoms;
    private String findings;
    private String diagnosis;
    private int medicationCount;
    private List<MedicationResponseDTO> medications;
}
