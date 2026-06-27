package com.karthick.patientrecordmanagement.model;

import com.karthick.patientrecordmanagement.constants.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class User {

    @Id
    @GeneratedValue
    private Long id;

    private String username;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

}
