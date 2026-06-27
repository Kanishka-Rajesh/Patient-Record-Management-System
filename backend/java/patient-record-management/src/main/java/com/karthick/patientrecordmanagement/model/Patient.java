package com.karthick.patientrecordmanagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@ToString
public class Patient {
    private Long id;
    private String name;
    private String dateOfBirth;
    private double weight;
    private String mobileNumber;
    private List<Prescription> prescriptions;
}

