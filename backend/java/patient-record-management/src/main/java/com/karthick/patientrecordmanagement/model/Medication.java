package com.karthick.patientrecordmanagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Medication {
    private String medicationName;
    private int dosage;
    private int frequency;
    private int duration;
}
