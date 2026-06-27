package com.karthick.patientrecordmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ApiResponse<T> {
    private int statusCode;
    private String message;
    private T data;
}
