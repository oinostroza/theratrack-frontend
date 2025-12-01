import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AiAnalysisResponse {
  primaryEmotion: string;
  confidence: number;
  analysisData: {
    reasoning: string;
    intensity: 'low' | 'medium' | 'high';
    timestamp: string;
    model: string;
    text: string;
  };
  analysisId: number;
}

@Injectable({ providedIn: 'root' })
export class AiAnalysisService {
  private apiUrl = `${environment.apiUrl}/ai-analysis`;

  constructor(private http: HttpClient) {}

  analyzeText(text: string): Observable<AiAnalysisResponse> {
    return this.http.post<AiAnalysisResponse>(`${this.apiUrl}`, { text }).pipe(
      map(res => res),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'Ocurrió un error inesperado.';
    if (error.error instanceof ErrorEvent) {
      errorMsg = `Error de red: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      errorMsg = error.error.message;
    }
    return throwError(() => new Error(errorMsg));
  }
} 