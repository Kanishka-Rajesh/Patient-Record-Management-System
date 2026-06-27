#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>  
#include <sys/stat.h>  // For mkdir
#include <sys/types.h>
#include <errno.h>
#include "../patient.h"

// BST Node structure
typedef struct BSTNode {
    Patient patient;           // Patient data
    struct BSTNode *left;      // Left child
    struct BSTNode *right;     // Right child
} BSTNode;

// Global root of the BST
BSTNode *root = NULL;

// Function to create a new BST node
BSTNode* create_node(const Patient *p) {
    BSTNode *new_node = (BSTNode*)malloc(sizeof(BSTNode));
    if (!new_node) {
        perror("Memory allocation failed");
        exit(1);
    }
    
    memcpy(&new_node->patient, p, sizeof(Patient));
    new_node->left = NULL;
    new_node->right = NULL;
    
    return new_node;
}

// Function to insert a patient into the BST
BSTNode* insert_node(BSTNode *root, const Patient *p) {
    // If tree is empty, create a new node
    if (root == NULL) {
        return create_node(p);
    }
    
    // Otherwise, recursively insert in the appropriate subtree
    if (p->id < root->patient.id) {
        root->left = insert_node(root->left, p);
    } else if (p->id > root->patient.id) {
        root->right = insert_node(root->right, p);
    }
    // If ID already exists, don't insert (assuming ID is unique)
    
    return root;
}

// Function to find a patient by ID
BSTNode* search_patient(BSTNode *root, long id) {
    // Base cases: root is NULL or the patient is at root
    if (root == NULL || root->patient.id == id) {
        return root;
    }
    
    // ID is greater than root's key, search right subtree
    if (root->patient.id < id) {
        return search_patient(root->right, id);
    }
    
    // ID is smaller than root's key, search left subtree
    return search_patient(root->left, id);
}

// Function to find the minimum value node in a BST
BSTNode* find_min_node(BSTNode* node) {
    BSTNode* current = node;
    
    // Loop to find the leftmost leaf
    while (current && current->left != NULL) {
        current = current->left;
    }
    
    return current;
}

// Function to delete a node with given ID
BSTNode* delete_node(BSTNode *root, long id) {
    // Base case
    if (root == NULL) {
        return root;
    }
    
    // Recursive calls for ancestors of node to be deleted
    if (id < root->patient.id) {
        root->left = delete_node(root->left, id);
    } else if (id > root->patient.id) {
        root->right = delete_node(root->right, id);
    } else {
        // Node with only one child or no child
        if (root->left == NULL) {
            BSTNode *temp = root->right;
            free(root);
            return temp;
        } else if (root->right == NULL) {
            BSTNode *temp = root->left;
            free(root);
            return temp;
        }
        
        // Node with two children: Get the inorder successor
        BSTNode *temp = find_min_node(root->right);
        
        // Copy the inorder successor's content to this node
        memcpy(&root->patient, &temp->patient, sizeof(Patient));
        
        // Delete the inorder successor
        root->right = delete_node(root->right, temp->patient.id);
    }
    return root;
}

// Inorder traversal to print all patients
void inorder_traversal(BSTNode *root) {
    if (root != NULL) {
        inorder_traversal(root->left);
        printf("ID: %ld, Name: %s\n", root->patient.id, root->patient.name);
        inorder_traversal(root->right);
    }
}

// Function to save the patient to a new text file inside a folder
void save_patient(const Patient *p) {
    // Set the folder path
    const char *folder = "E:/Final-SDP-Project/backend/c/patient/all-patient-files";

    // Create the folder if it doesn't exist
    struct stat st = {0};
    if (stat(folder, &st) == -1) {
        if (mkdir(folder) != 0) {
            perror("mkdir failed");
            exit(1);
        }
    }

    // Full path with filename (.txt extension now)
    char filename[512];
    snprintf(filename, sizeof(filename), "%s/%ld.txt", folder, p->id);

    // Check if the file already exists
    FILE *f = fopen(filename, "r");
    if (f) {
        // File already exists, print a message and do not overwrite
        printf("Patient file for ID %ld already exists. Aborting creation.\n", p->id);
        fclose(f);
        return;
    }

    // Open file in write mode (text)
    f = fopen(filename, "w");
    if (!f) {
        perror("fopen failed");
        exit(1);
    }

    // Write patient details into the file in readable format
    fprintf(f, "ID: %ld\n", p->id);
    fprintf(f, "Name: %s\n", p->name);
    fprintf(f, "Date of Birth: %s\n", p->dateOfBirth);
    fprintf(f, "Weight: %.2f\n", p->weight);
    fprintf(f, "Mobile Number: %s\n", p->mobileNumber);
    fprintf(f, "Prescription Count: %d\n", p->prescriptionCount);

    fclose(f);

    printf("Patient file for ID %ld created successfully.\n", p->id);
}

// Function to print patient details for Java parsing (unchanged)
void print_patient(const Patient *p) {
    printf("CREATED|%ld|%s|%s|%.2f|%s\n",
           p->id, p->name, p->dateOfBirth, p->weight, p->mobileNumber);
}

// Function to clean up the BST (free memory)
void free_bst(BSTNode *root) {
    if (root != NULL) {
        free_bst(root->left);
        free_bst(root->right);
        free(root);
    }
}

int main(int argc, char *argv[]) {
    if (argc != 6) {
        fprintf(stderr, "Usage: %s <id> <name> <dob> <weight> <phone>\n", argv[0]);
        return 1;
    }

    // Populate the Patient struct
    Patient p = {0};
    p.id = atol(argv[1]);
    strncpy(p.name, argv[2], MAX_PATIENT_NAME - 1);
    strncpy(p.dateOfBirth, argv[3], MAX_DATE_OF_BIRTH - 1);
    p.weight = atof(argv[4]);
    strncpy(p.mobileNumber, argv[5], MAX_PATIENT_MOBILE_NUMBER - 1);
    p.prescriptionCount = 0;

    // Insert the patient into BST
    root = insert_node(root, &p);

    // Save and print
    save_patient(&p);
    print_patient(&p);

    // In a real application, you might want to persist the BST to disk here
    // For now, we'll just free the memory
    free_bst(root);

    return 0;
}