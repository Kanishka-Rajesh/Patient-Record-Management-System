#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <errno.h>
#include "../appointment.h"

// Queue node structure
typedef struct AppointmentNode {
    Appointment data;
    struct AppointmentNode *next;
} AppointmentNode;

// Queue structure
typedef struct {
    AppointmentNode *front;
    AppointmentNode *rear;
    int size;
} AppointmentQueue;

// Initialize queue
void initQueue(AppointmentQueue *queue) {
    queue->front = NULL;
    queue->rear = NULL;
    queue->size = 0;
}

// Enqueue an appointment
void enqueue(AppointmentQueue *queue, const Appointment *apt) {
    // Create a new node
    AppointmentNode *newNode = (AppointmentNode *)malloc(sizeof(AppointmentNode));
    if (!newNode) {
        perror("Memory allocation failed");
        exit(1);
    }
    
    // Copy the appointment data
    memcpy(&(newNode->data), apt, sizeof(Appointment));
    newNode->next = NULL;
    
    // If queue is empty, set front and rear to the new node
    if (queue->rear == NULL) {
        queue->front = newNode;
        queue->rear = newNode;
    } else {
        // Otherwise, add the new node to the rear
        queue->rear->next = newNode;
        queue->rear = newNode;
    }
    
    queue->size++;
}

// Process all appointments in the queue
void processQueue(AppointmentQueue *queue) {
    if (queue->size == 0) {
        printf("NO_APPOINTMENTS|No appointments found\n");
        return;
    }
    
    // Process each appointment in the queue
    AppointmentNode *current = queue->front;
    while (current != NULL) {
        // Print the appointment in the format required by Java
        printf("APPOINTMENT|%ld|%s|%s|%s|%.2f|%s|%s|%s|%s\n",
            current->data.patientId, current->data.name, current->data.mobileNumber, 
            current->data.dateOfBirth, current->data.weight, current->data.appointmentDate, 
            current->data.appointmentTime, current->data.appointmentType, current->data.token);
        
        current = current->next;
    }
}

// Free the queue memory
void freeQueue(AppointmentQueue *queue) {
    AppointmentNode *current = queue->front;
    AppointmentNode *next;
    
    while (current != NULL) {
        next = current->next;
        free(current);
        current = next;
    }
    
    queue->front = NULL;
    queue->rear = NULL;
    queue->size = 0;
}

// Function to read and display all appointments
void find_all_appointments() {
    // Set the folder and file path
    const char *folder = "E:\\Final-SDP-Project\\backend\\c\\appointment\\appointment-files";
    char filename[512];
    snprintf(filename, sizeof(filename), "%s\\current_day_appointment.txt", folder);
    
    // Initialize the queue
    AppointmentQueue queue;
    initQueue(&queue);
    
    // Check if the file exists
    FILE *f = fopen(filename, "r");
    if (!f) {
        if (errno == ENOENT) {
            // File does not exist - no appointments
            printf("NO_APPOINTMENTS|No appointments found\n");
        } else {
            // Some other error
            perror("fopen failed");
            printf("ERROR_READING_APPOINTMENTS|Error opening appointments file\n");
        }
        return;
    }
    
    // Variables to store parsed appointment data
    Appointment apt;
    
    // Temporary variables for parsing
    char line[256];
    char value[256];
    char *key, *val;
    
    // Initialize appointment to zeros
    memset(&apt, 0, sizeof(Appointment));
    
    // Read the file line by line
    while (fgets(line, sizeof(line), f)) {
        // Remove newline character
        line[strcspn(line, "\n")] = 0;
        
        // Skip separator lines or empty lines
        if (strstr(line, "-------") != NULL || strlen(line) == 0) {
            // If we've processed at least one field and found a separator,
            // it might indicate end of a record
            if (apt.patientId > 0 && strstr(line, "-------") != NULL) {
                // Enqueue the completed appointment
                enqueue(&queue, &apt);
                
                // Reset for next appointment
                memset(&apt, 0, sizeof(Appointment));
            }
            continue;
        }
        
        // Try to split the line into key and value
        if ((key = strtok(line, ":")) != NULL) {
            val = strtok(NULL, "");
            if (val != NULL) {
                // Remove leading whitespace
                while (*val == ' ') val++;
                strcpy(value, val);
                
                // Parse fields based on key
                if (strstr(key, "Patient ID") != NULL) {
                    apt.patientId = atol(value);
                } else if (strstr(key, "Name") != NULL) {
                    strncpy(apt.name, value, MAX_NAME - 1);
                } else if (strstr(key, "Mobile Number") != NULL) {
                    strncpy(apt.mobileNumber, value, MAX_MOBILE_NUMBER - 1);
                } else if (strstr(key, "Date of Birth") != NULL) {
                    strncpy(apt.dateOfBirth, value, MAX_DATE_OF_BIRTH - 1);
                } else if (strstr(key, "Weight") != NULL) {
                    apt.weight = atof(value);
                } else if (strstr(key, "Appointment Date") != NULL) {
                    strncpy(apt.appointmentDate, value, MAX_APPOINTMENT_DATE - 1);
                } else if (strstr(key, "Appointment Time") != NULL) {
                    strncpy(apt.appointmentTime, value, MAX_APPOINTMENT_TIME - 1);
                } else if (strstr(key, "Appointment Type") != NULL) {
                    strncpy(apt.appointmentType, value, MAX_APPOINTMENT_TYPE - 1);
                } else if (strstr(key, "Token") != NULL) {
                    strncpy(apt.token, value, MAX_TOKEN - 1);
                }
            }
        }
    }
    
    // Handle the last appointment if not already processed
    if (apt.patientId > 0) {
        enqueue(&queue, &apt);
    }
    
    fclose(f);
    
    // Process all appointments in the queue
    processQueue(&queue);
    
    // Free the queue memory
    freeQueue(&queue);
}

int main() {
    find_all_appointments();
    return 0;
}