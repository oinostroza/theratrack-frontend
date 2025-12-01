import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Transcription {
  id: number;
  sessionId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTranscriptionRequest {
  sessionId: number;
  content: string;
}

export interface UpdateTranscriptionRequest {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {
  private apiUrl = `${environment.apiUrl}/transcriptions`;

  constructor(private http: HttpClient) {}

  createTranscription(data: CreateTranscriptionRequest): Observable<Transcription> {
    return this.http.post<Transcription>(this.apiUrl, data);
  }

  getTranscription(id: number): Observable<Transcription> {
    return this.http.get<Transcription>(`${this.apiUrl}/${id}`);
  }

  getTranscriptionBySessionId(sessionId: number): Observable<Transcription> {
    return this.http.get<Transcription>(`${this.apiUrl}/session/${sessionId}`);
  }

  updateTranscription(id: number, data: UpdateTranscriptionRequest): Observable<Transcription> {
    return this.http.patch<Transcription>(`${this.apiUrl}/${id}`, data);
  }

  deleteTranscription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 