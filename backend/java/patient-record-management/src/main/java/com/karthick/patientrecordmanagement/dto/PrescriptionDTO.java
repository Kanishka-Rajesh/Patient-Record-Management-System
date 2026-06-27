package com.karthick.patientrecordmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {
    private String symptoms;
    private String findings;
    private String diagnosis;
    private List<MedicationDTO> medications;
}