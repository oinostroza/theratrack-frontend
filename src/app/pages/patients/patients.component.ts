import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient, CreatePatientRequest } from '../../interfaces/patient.interface';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  loading = true;
  submitting = false;
  error: string | null = null;
  success: string | null = null;
  showAddPatientModal = false;
  newPatient: CreatePatientRequest = {
    fullName: '',
    email: '',
    age: 0,
    gender: '',
    contactInfo: '',
    notes: ''
  };
  showPatientDetailModal = false;
  selectedPatient: Patient | null = null;

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = null;
    
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pacientes';
        this.loading = false;
        console.error('Error loading patients:', err);
      }
    });
  }

  openAddPatientModal(): void {
    this.showAddPatientModal = true;
    this.resetNewPatient();
    this.clearMessages();
  }

  closeAddPatientModal(): void {
    this.showAddPatientModal = false;
    this.resetNewPatient();
    this.clearMessages();
  }

  resetNewPatient(): void {
    this.newPatient = {
      fullName: '',
      email: '',
      age: 0,
      gender: '',
      contactInfo: '',
      notes: ''
    };
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  onSubmit(): void {
    if (this.submitting) return;

    // Validación básica
    if (!this.newPatient.fullName?.trim()) {
      this.error = 'El nombre completo es obligatorio';
      return;
    }

    if (!this.newPatient.email?.trim()) {
      this.error = 'El email es obligatorio';
      return;
    }

    if (!this.newPatient.age || this.newPatient.age <= 0) {
      this.error = 'La edad debe ser mayor a 0';
      return;
    }

    if (!this.newPatient.gender?.trim()) {
      this.error = 'El género es obligatorio';
      return;
    }

    this.submitting = true;
    this.clearMessages();

    this.patientService.createPatient(this.newPatient).subscribe({
      next: (patient) => {
        this.submitting = false;
        this.success = `Paciente ${patient.fullName} creado exitosamente`;
        this.closeAddPatientModal();
        this.loadPatients();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.success = null;
        }, 5000);
      },
      error: (err) => {
        this.submitting = false;
        this.error = 'Error al crear el paciente. Inténtalo de nuevo.';
        console.error('Error creating patient:', err);
      }
    });
  }

  viewPatientDetails(patientId: number): void {
    this.selectedPatient = this.patients.find(p => p.id === patientId) || null;
    this.showPatientDetailModal = true;
    document.body.classList.add('modal-open');
  }

  closePatientDetailModal(): void {
    this.showPatientDetailModal = false;
    this.selectedPatient = null;
    document.body.classList.remove('modal-open');
  }

  getGenderLabel(gender: string): string {
    const genderLabels: { [key: string]: string } = {
      'male': 'Masculino',
      'female': 'Femenino',
      'other': 'Otro',
      'masculino': 'Masculino',
      'femenino': 'Femenino',
      'otro': 'Otro'
    };
    return genderLabels[gender.toLowerCase()] || gender;
  }

  getGenderIcon(gender: string): string {
    const genderIcons: { [key: string]: string } = {
      'male': 'mars',
      'female': 'venus',
      'other': 'genderless',
      'masculino': 'mars',
      'femenino': 'venus',
      'otro': 'genderless'
    };
    return genderIcons[gender.toLowerCase()] || 'user';
  }

  getGenderColor(gender: string): string {
    const genderColors: { [key: string]: string } = {
      'male': 'text-blue-600',
      'female': 'text-pink-600',
      'other': 'text-purple-600',
      'masculino': 'text-blue-600',
      'femenino': 'text-pink-600',
      'otro': 'text-purple-600'
    };
    return genderColors[gender.toLowerCase()] || 'text-gray-600';
  }

  trackByPatientId(index: number, patient: Patient): number {
    return patient.id;
  }
} 