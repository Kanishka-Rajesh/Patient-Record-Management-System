package com.karthick.patientrecordmanagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    private String symptoms;
    private String findings;
    private String diagnosis;
    private List<Medication> medications;
}
