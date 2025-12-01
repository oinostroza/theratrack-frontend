import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../interfaces/patient.interface';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit, OnChanges {
  @Input() patientId?: number;
  @Input() patient?: Patient | null;
  @Output() closeModal = new EventEmitter<void>();

  loading = true;
  error: string | null = null;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    if (this.patient) {
      this.loading = false;
    } else if (this.patientId) {
      this.loadPatient(this.patientId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patientId'] && this.patientId) {
      this.loadPatient(this.patientId);
    }
    if (changes['patient'] && this.patient) {
      this.loading = false;
    }
  }

  loadPatient(id: number): void {
    this.loading = true;
    this.error = null;
    this.patientService.getPatient(id).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del paciente';
        this.loading = false;
      }
    });
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }
} 