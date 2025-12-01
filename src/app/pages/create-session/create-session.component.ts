import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionsService, SessionDisplay } from '../../services/sessions.service';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../interfaces/patient.interface';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.css']
})
export class CreateSessionComponent implements OnInit {
  sessionForm: FormGroup;
  loading = false;
  success = false;
  error: string | null = null;
  recentSessions: SessionDisplay[] = [];
  patients: Patient[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sessionsService: SessionsService,
    private patientService: PatientService
  ) {
    this.sessionForm = this.fb.group({
      patientId: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      tipoSesion: ['', Validators.required],
      notas: [''],
      monto: ['', [Validators.required, Validators.min(1), Validators.max(1000000)]],
      pagado: [false]
    }, { validators: this.timeValidator });
  }

  ngOnInit(): void {
    this.loadRecentSessions();
    this.loadPatients();
  }

  timeValidator(group: FormGroup) {
    const startTime = group.get('horaInicio')?.value;
    const endTime = group.get('horaFin')?.value;
    
    if (startTime && endTime && startTime >= endTime) {
      return { invalidTime: true };
    }
    return null;
  }

  get f() {
    return this.sessionForm.controls;
  }

  getTimeError(): string {
    if (this.sessionForm.errors?.['invalidTime']) {
      return 'La hora de inicio debe ser anterior a la hora de término';
    }
    return '';
  }

  markFormGroupTouched() {
    Object.keys(this.sessionForm.controls).forEach(key => {
      const control = this.sessionForm.get(key);
      control?.markAsTouched();
    });
  }

  onSubmit(): void {
    if (this.sessionForm.invalid || this.loading) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = false;

    const formData = this.sessionForm.value;
    
    // Convertir patientId a número
    formData.patientId = Number(formData.patientId);
    
    console.log('Enviando datos de sesión:', formData);
    
    this.sessionsService.createSession(formData).subscribe({
      next: (newSession) => {
        console.log('Sesión creada exitosamente:', newSession);
        this.loading = false;
        this.success = true;
        this.resetForm();
        
        // Mostrar notificación de éxito
        this.showSuccessNotification();
        
        // Redirigir a la página de sesiones después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/sesiones']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error completo:', err);
        this.loading = false;
        
        // Mostrar error más específico
        if (err.error && err.error.message) {
          this.error = `Error: ${err.error.message}`;
        } else if (err.status === 400) {
          this.error = 'Datos inválidos. Verifica la información ingresada.';
        } else if (err.status === 404) {
          this.error = 'Paciente no encontrado.';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.error = `Error al crear la sesión (${err.status}). Inténtalo de nuevo.`;
        }
      }
    });
  }

  showSuccessNotification(): void {
    this.success = true;
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      this.success = false;
    }, 5000);
  }

  resetForm(): void {
    this.sessionForm.reset({
      pagado: false
    });
  }

  loadRecentSessions(): void {
    this.sessionsService.getSessionsForDisplay().subscribe({
      next: (sessions) => {
        this.recentSessions = sessions.slice(0, 5); // Mostrar solo las 5 más recientes
      },
      error: (err) => {
        console.error('Error loading recent sessions:', err);
      }
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: (err) => {
        console.error('Error loading patients:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5); // Remove seconds if present
  }

  getPaymentStatusIcon(pagado: boolean): string {
    return pagado ? 'check-circle' : 'clock';
  }

  getPaymentStatusColor(pagado: boolean): string {
    return pagado ? 'text-green-600' : 'text-gray-400';
  }

  getPaymentStatusText(pagado: boolean): string {
    return pagado ? 'Pagado' : 'Pendiente';
  }

  cancel(): void {
    this.router.navigate(['/sesiones']);
  }
} 