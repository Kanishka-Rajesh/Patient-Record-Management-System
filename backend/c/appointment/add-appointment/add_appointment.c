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
} AppointmentQueue;

// Initialize queue
void initQueue(AppointmentQueue *queue) {
    queue->front = NULL;
    queue->rear = NULL;
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
}

// Process the queue - save all appointments to file
void processQueue(AppointmentQueue *queue) {
    // Set the folder path
    const char *folder = "E:\\Final-SDP-Project\\backend\\c\\appointment\\appointment-files";
    
    // Create the folder if it doesn't exist
    struct stat st = {0};
    if (stat(folder, &st) == -1) {
        if (mkdir(folder) != 0) {
            perror("mkdir failed");
            exit(1);
        }
    }
    
    // Define the appointments file path
    char filename[512];
    snprintf(filename, sizeof(filename), "%s\\current_day_appointment.txt", folder);
    
    // Process each appointment in the queue
    AppointmentNode *current = queue->front;
    while (current != NULL) {
        // Open file in append mode
        FILE *f = fopen(filename, "a");
        if (!f) {
            perror("fopen failed");
            exit(1);
        }
        
        // Write appointment details into the file in readable format
        fprintf(f, "------------------------------\n");
        fprintf(f, "Patient ID: %ld\n", current->data.patientId);
        fprintf(f, "Name: %s\n", current->data.name);
        fprintf(f, "Mobile Number: %s\n", current->data.mobileNumber);
        fprintf(f, "Date of Birth: %s\n", current->data.dateOfBirth);
        fprintf(f, "Weight: %.2f\n", current->data.weight);
        fprintf(f, "Appointment Date: %s\n", current->data.appointmentDate);
        fprintf(f, "Appointment Time: %s\n", current->data.appointmentTime);
        fprintf(f, "Appointment Type: %s\n", current->data.appointmentType);
        fprintf(f, "Token: %s\n", current->data.token);
        fprintf(f, "------------------------------\n\n");
        
        fclose(f);
        
        printf("Appointment for patient ID %ld added successfully.\n", current->data.patientId);
        
        // Print appointment details for Java parsing
        printf("APPOINTMENT_ADDED|%ld|%s|%s|%s|%.2f|%s|%s|%s|%s\n",
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
}

int main(int argc, char *argv[]) {
    if (argc != 10) {
        fprintf(stderr, "Usage: %s <patientId> <name> <mobileNumber> <dateOfBirth> <weight> <appointmentDate> <appointmentTime> <appointmentType> <token>\n", argv[0]);
        return 1;
    }
    
    // Initialize queue
    AppointmentQueue queue;
    initQueue(&queue);
    
    // Populate the Appointment struct
    Appointment apt = {0};
    apt.patientId = atol(argv[1]);
    
    strncpy(apt.name, argv[2], MAX_NAME - 1);
    // Replace underscores with spaces
    for (char *p = apt.name; *p; p++) {
        if (*p == '_') *p = ' ';
    }
    
    strncpy(apt.mobileNumber, argv[3], MAX_MOBILE_NUMBER - 1);
    strncpy(apt.dateOfBirth, argv[4], MAX_DATE_OF_BIRTH - 1);
    apt.weight = atof(argv[5]);
    strncpy(apt.appointmentDate, argv[6], MAX_APPOINTMENT_DATE - 1);
    strncpy(apt.appointmentTime, argv[7], MAX_APPOINTMENT_TIME - 1);
    
    strncpy(apt.appointmentType, argv[8], MAX_APPOINTMENT_TYPE - 1);
    // Replace underscores with spaces in type
    for (char *p = apt.appointmentType; *p; p++) {
        if (*p == '_') *p = ' ';
    }
    
    strncpy(apt.token, argv[9], MAX_TOKEN - 1);
    
    // Add appointment to queue
    enqueue(&queue, &apt);
    
    // Process queue (save and print)
    processQueue(&queue);
    
    // Free queue memory
    freeQueue(&queue);
    
    return 0;
}