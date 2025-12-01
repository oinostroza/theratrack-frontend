import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { TranscriptionService, Transcription } from '../../../services/transcription.service';

@Component({
  selector: 'app-view-transcription',
  templateUrl: './view-transcription.component.html',
  styleUrls: ['./view-transcription.component.css']
})
export class ViewTranscriptionComponent implements OnInit {
  @Input() sessionId: number = 0;
  @Output() closeModal = new EventEmitter<void>();
  @Output() deleteTranscription = new EventEmitter<Transcription>();

  transcription: Transcription | null = null;
  loading = true;
  error: string | null = null;

  constructor(private transcriptionService: TranscriptionService) {}

  ngOnInit(): void {
    this.loadTranscription();
  }

  loadTranscription(): void {
    this.loading = true;
    this.error = null;

    this.transcriptionService.getTranscriptionBySessionId(this.sessionId).subscribe({
      next: (transcription) => {
        this.transcription = transcription;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar transcripción:', err);
        this.loading = false;
        
        if (err.status === 404) {
          this.error = 'No se encontró una transcripción para esta sesión.';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.error = `Error al cargar la transcripción (${err.status}). Inténtalo de nuevo.`;
        }
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onDeleteTranscription(): void {
    if (this.transcription) {
      this.deleteTranscription.emit(this.transcription);
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }
} 