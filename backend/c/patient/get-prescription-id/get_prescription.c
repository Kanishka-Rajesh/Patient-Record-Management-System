#include "../patient.h"
#include "../prescription.h"
#include "../medication.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <errno.h>

#define MAX_STACK_SIZE 100

// Stack structure for prescriptions
typedef struct {
    Prescription items[MAX_STACK_SIZE];
    int top;
} PrescriptionStack;

// Initialize a new stack
void stack_init(PrescriptionStack *stack) {
    stack->top = -1;
}

// Check if stack is empty
int stack_is_empty(PrescriptionStack *stack) {
    return stack->top == -1;
}

// Check if stack is full
int stack_is_full(PrescriptionStack *stack) {
    return stack->top == MAX_STACK_SIZE - 1;
}

// Push a prescription onto the stack
int stack_push(PrescriptionStack *stack, Prescription prescription) {
    if (stack_is_full(stack)) {
        fprintf(stderr, "Stack overflow: Cannot add more prescriptions\n");
        return -1;
    }
    stack->items[++(stack->top)] = prescription;
    return 0;
}

// Pop a prescription from the stack
int stack_pop(PrescriptionStack *stack, Prescription *prescription) {
    if (stack_is_empty(stack)) {
        fprintf(stderr, "Stack underflow: No prescriptions to remove\n");
        return -1;
    }
    *prescription = stack->items[(stack->top)--];
    return 0;
}

// Peek at the top prescription without removing it
int stack_peek(PrescriptionStack *stack, Prescription *prescription) {
    if (stack_is_empty(stack)) {
        fprintf(stderr, "Stack is empty: No prescriptions to peek\n");
        return -1;
    }
    *prescription = stack->items[stack->top];
    return 0;
}

// Helper function to replace all occurrences of a character in a string
void replace_char(char *str, char find, char replace) {
    if (!str) return;
    for (int i = 0; str[i]; i++) {
        if (str[i] == find) str[i] = replace;
    }
}

void get_prescriptions_by_patient_id(long patientId) {
    const char *folder = "E:/Final-SDP-Project/backend/c/patient/all-patient-files";
    char filename[512];
    snprintf(filename, sizeof(filename), "%s/%ld.txt", folder, patientId);

    fprintf(stderr, "Attempting to open patient file: %s\n", filename);

    FILE *f = fopen(filename, "r");
    if (!f) {
        fprintf(stderr, "Failed to open patient file: %s (Error: %s)\n", filename, strerror(errno));
        printf("PATIENT_NOT_FOUND|%ld\n", patientId);
        return;
    }

    char line[1024];
    int prescriptionCount = 0;
    int currentPrescriptionIndex = -1;
    int inPrescriptionSection = 0;

    // Create a stack for prescriptions
    PrescriptionStack prescriptionStack;
    stack_init(&prescriptionStack);

    // Patient info
    long id = 0;
    char name[MAX_PATIENT_NAME] = {0};
    char dateOfBirth[MAX_DATE_OF_BIRTH] = {0};
    double weight = 0.0;
    char mobileNumber[MAX_PATIENT_MOBILE_NUMBER] = {0};

    while (fgets(line, sizeof(line), f) != NULL) {
        char *newline = strchr(line, '\n');
        if (newline) *newline = '\0';

        if (strlen(line) == 0) {
            continue;
        }

        if (strncmp(line, "ID: ", 4) == 0) {
            id = atol(line + 4);
        } else if (strncmp(line, "Name: ", 6) == 0) {
            strncpy(name, line + 6, MAX_PATIENT_NAME - 1);
        } else if (strncmp(line, "Date of Birth: ", 15) == 0) {
            strncpy(dateOfBirth, line + 15, MAX_DATE_OF_BIRTH - 1);
        } else if (strncmp(line, "Weight: ", 8) == 0) {
            weight = atof(line + 8);
        } else if (strncmp(line, "Mobile Number: ", 15) == 0) {
            strncpy(mobileNumber, line + 15, MAX_PATIENT_MOBILE_NUMBER - 1);
        } else if (strncmp(line, "Prescription Count: ", 20) == 0) {
            prescriptionCount = atoi(line + 20);
            
            fprintf(stderr, "Patient ID: %ld, Prescription Count: %d\n", id, prescriptionCount);
            
            if (prescriptionCount <= 0) {
                printf("NO_PRESCRIPTIONS|%ld\n", patientId);
                fclose(f);
                return;
            }
            
            printf("PRESCRIPTIONS_FOUND|%ld|%d\n", patientId, prescriptionCount);
        } 
        else if (strncmp(line, "=== PRESCRIPTION ", 17) == 0) {
            inPrescriptionSection = 1;
            currentPrescriptionIndex++;
            
            // Initialize a new prescription
            Prescription currentPrescription;
            memset(&currentPrescription, 0, sizeof(Prescription));
            currentPrescription.medicationCount = 0;
            
            // Store the index for later reference
            int prescriptionIdx = currentPrescriptionIndex;
            
            char date[MAX_DATE] = {0};
            char symptoms[MAX_PRESCRIPTION_SYMPTOMS] = {0};
            char findings[MAX_PRESCRIPTION_FINDINGS] = {0};
            char diagnosis[MAX_PRESCRIPTION_DIAGNOSIS] = {0};
            int medicationCount = 0;
            
            while (fgets(line, sizeof(line), f) != NULL) {
                newline = strchr(line, '\n');
                if (newline) *newline = '\0';
                
                if (strlen(line) == 0 && medicationCount > 0) {
                    break; 
                }
                
                if (strncmp(line, "Date: ", 6) == 0) {
                    strncpy(date, line + 6, MAX_DATE - 1);
                    strncpy(currentPrescription.date, date, MAX_DATE - 1);
                } else if (strncmp(line, "Symptoms: ", 10) == 0) {
                    strncpy(symptoms, line + 10, MAX_PRESCRIPTION_SYMPTOMS - 1);
                    strncpy(currentPrescription.symptoms, symptoms, MAX_PRESCRIPTION_SYMPTOMS - 1);
                } else if (strncmp(line, "Findings: ", 10) == 0) {
                    strncpy(findings, line + 10, MAX_PRESCRIPTION_FINDINGS - 1);
                    strncpy(currentPrescription.findings, findings, MAX_PRESCRIPTION_FINDINGS - 1);
                } else if (strncmp(line, "Diagnosis: ", 11) == 0) {
                    strncpy(diagnosis, line + 11, MAX_PRESCRIPTION_DIAGNOSIS - 1);
                    strncpy(currentPrescription.diagnosis, diagnosis, MAX_PRESCRIPTION_DIAGNOSIS - 1);
                } else if (strncmp(line, "Medications: ", 13) == 0) {
                    medicationCount = atoi(line + 13);
                    currentPrescription.medicationCount = medicationCount;
                } 
                else if (strncmp(line, "  Medication ", 13) == 0) {
                    int medicationIndex;
                    sscanf(line + 13, "%d", &medicationIndex);
                    medicationIndex--; // 0-based indexing for array
                    
                    // Make sure we don't exceed the array bounds
                    if (medicationIndex >= 0 && medicationIndex < MAX_MEDICATIONS) {
                        char med_name[MAX_MED_NAME] = {0};
                        char med_dosage[MAX_MED_DOSAGE] = {0};
                        char med_duration[MAX_MED_DURATION] = {0};
                        char med_notes[MAX_MED_NOTES] = {0};
                        
                        for (int i = 0; i < 4; i++) {
                            if (fgets(line, sizeof(line), f) == NULL) break;
                            newline = strchr(line, '\n');
                            if (newline) *newline = '\0';
                            
                            if (strncmp(line, "    Name: ", 10) == 0) {
                                strncpy(med_name, line + 10, MAX_MED_NAME - 1);
                                strncpy(currentPrescription.medications[medicationIndex].name, med_name, MAX_MED_NAME - 1);
                            } else if (strncmp(line, "    Dosage: ", 12) == 0) {
                                strncpy(med_dosage, line + 12, MAX_MED_DOSAGE - 1);
                                strncpy(currentPrescription.medications[medicationIndex].dosage, med_dosage, MAX_MED_DOSAGE - 1);
                            } else if (strncmp(line, "    Duration: ", 14) == 0) {
                                strncpy(med_duration, line + 14, MAX_MED_DURATION - 1);
                                strncpy(currentPrescription.medications[medicationIndex].duration, med_duration, MAX_MED_DURATION - 1);
                            } else if (strncmp(line, "    Notes: ", 11) == 0) {
                                strncpy(med_notes, line + 11, MAX_MED_NOTES - 1);
                                strncpy(currentPrescription.medications[medicationIndex].notes, med_notes, MAX_MED_NOTES - 1);
                            }
                        }
                    }
                }
            }
            
            // Store the prescription index in the unused field
            currentPrescription.medicationCount = prescriptionIdx; 
            
            // Push the prescription onto the stack
            stack_push(&prescriptionStack, currentPrescription);
        }
    }

    fclose(f);
    
    // Now output prescriptions in stack order (most recent first)
    if (!stack_is_empty(&prescriptionStack)) {
        fprintf(stderr, "Stack contains %d prescriptions\n", prescriptionStack.top + 1);
        
        // Create temporary stack to preserve the original
        PrescriptionStack tempStack;
        stack_init(&tempStack);
        
        // Process each prescription from the stack (in reverse order)
        int stackSize = prescriptionStack.top + 1;
        for (int i = 0; i < stackSize; i++) {
            Prescription current;
            stack_pop(&prescriptionStack, &current);
            
            // Get the original index
            int originalIndex = current.medicationCount;
            
            // Output prescription information
            char symptoms_fixed[MAX_PRESCRIPTION_SYMPTOMS] = {0};
            char findings_fixed[MAX_PRESCRIPTION_FINDINGS] = {0};
            char diagnosis_fixed[MAX_PRESCRIPTION_DIAGNOSIS] = {0};
            
            strncpy(symptoms_fixed, current.symptoms, MAX_PRESCRIPTION_SYMPTOMS - 1);
            strncpy(findings_fixed, current.findings, MAX_PRESCRIPTION_FINDINGS - 1);
            strncpy(diagnosis_fixed, current.diagnosis, MAX_PRESCRIPTION_DIAGNOSIS - 1);
            
            replace_char(symptoms_fixed, '_', ' ');
            replace_char(findings_fixed, '_', ' ');
            replace_char(diagnosis_fixed, '_', ' ');
            
            printf("PRESCRIPTION|%d|%s|%s|%s|%s|%d\n", 
                  stackSize - i - 1, current.date, symptoms_fixed, 
                  findings_fixed, diagnosis_fixed, current.medicationCount);
            
            // Output medication information
            for (int j = 0; j < MAX_MEDICATIONS; j++) {
                // Skip empty medications
                if (strlen(current.medications[j].name) == 0) {
                    continue;
                }
                
                char name_fixed[MAX_MED_NAME] = {0};
                char dosage_fixed[MAX_MED_DOSAGE] = {0};
                char duration_fixed[MAX_MED_DURATION] = {0};
                char notes_fixed[MAX_MED_NOTES] = {0};
                
                strncpy(name_fixed, current.medications[j].name, MAX_MED_NAME - 1);
                strncpy(dosage_fixed, current.medications[j].dosage, MAX_MED_DOSAGE - 1);
                strncpy(duration_fixed, current.medications[j].duration, MAX_MED_DURATION - 1);
                strncpy(notes_fixed, current.medications[j].notes, MAX_MED_NOTES - 1);
                
                replace_char(name_fixed, '_', ' ');
                replace_char(dosage_fixed, '_', ' ');
                replace_char(duration_fixed, '_', ' ');
                replace_char(notes_fixed, '_', ' ');
                
                fprintf(stderr, "Processing medication: %s for prescription %d\n", name_fixed, originalIndex);
                printf("MEDICATION|%d|%d|%s|%s|%s|%s\n", 
                       stackSize - i - 1, j, 
                       name_fixed, dosage_fixed, 
                       duration_fixed, notes_fixed);
            }
            
            // Push to temporary stack if needed for later use
            stack_push(&tempStack, current);
        }
    }
    
    fprintf(stderr, "Successfully completed reading patient prescriptions\n");
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <patientId>\n", argv[0]);
        return 1;
    }

    char *endptr;
    long patientId = strtol(argv[1], &endptr, 10);
    if (*endptr != '\0') {
        fprintf(stderr, "Invalid patient ID: %s\n", argv[1]);
        return 1;
    }

    fprintf(stderr, "Starting get_prescriptions for patient ID: %ld\n", patientId);
    get_prescriptions_by_patient_id(patientId);
    return 0;
}