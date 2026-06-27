package com.karthick.patientrecordmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientPrescriptionsDTO {
    private Long patientId;
    private int prescriptionCount;
    private List<PrescriptionResponseDTO> prescriptions;
}
