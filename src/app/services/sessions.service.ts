import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../interfaces/patient.interface';
import { environment } from '../../environments/environment';

export interface Session {
  id: number;
  patientId: number;
  patient?: Patient;
  fechaInicio: string;
  fechaFin: string;
  conceptoPrincipal: string;
  notasDelTerapeuta?: string;
  precio: number;
  pagado: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para el frontend con campos transformados
export interface SessionDisplay {
  id: number;
  patientId: number;
  patient?: Patient;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tipoSesion: string;
  notas?: string;
  monto: number;
  pagado: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
  }

  getSession(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  createSession(session: {
    patientId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    tipoSesion: string;
    notas?: string;
    monto: number;
    pagado?: boolean;
  }): Observable<Session> {
    // Mapear los campos del frontend a los que espera el backend
    const backendSession = {
      patientId: session.patientId,
      fechaInicio: `${session.fecha}T${session.horaInicio}:00`,
      fechaFin: `${session.fecha}T${session.horaFin}:00`,
      conceptoPrincipal: session.tipoSesion,
      notasDelTerapeuta: session.notas || '',
      precio: session.monto,
      pagado: session.pagado || false
    };
    
    console.log('=== DEBUG CREATE SESSION ===');
    console.log('Datos originales del frontend:', session);
    console.log('Datos transformados para el backend:', backendSession);
    console.log('URL de la API:', this.apiUrl);
    console.log('Token de autenticación:', localStorage.getItem('access_token'));
    console.log('================================');
    
    return this.http.post<Session>(this.apiUrl, backendSession);
  }

  updateSession(id: number, session: Partial<Session>): Observable<Session> {
    return this.http.patch<Session>(`${this.apiUrl}/${id}`, session);
  }

  updateSessionStatus(id: number, pagado: boolean): Observable<Session> {
    return this.http.patch<Session>(`${this.apiUrl}/${id}/estado`, { pagado });
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPendingPayments(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/pending-payments`);
  }

  // Transformar datos del backend al formato del frontend
  transformSessionForDisplay(session: Session): SessionDisplay {
    const fechaInicio = new Date(session.fechaInicio);
    const fechaFin = new Date(session.fechaFin);
    
    const transformedSession = {
      id: session.id,
      patientId: session.patientId,
      patient: session.patient,
      fecha: fechaInicio.toISOString().split('T')[0], // YYYY-MM-DD
      horaInicio: fechaInicio.toTimeString().slice(0, 5), // HH:MM
      horaFin: fechaFin.toTimeString().slice(0, 5), // HH:MM
      tipoSesion: session.conceptoPrincipal || '',
      notas: session.notasDelTerapeuta || '',
      monto: Number(session.precio), // Convertir a número
      pagado: session.pagado,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };
    
    console.log('=== TRANSFORM SESSION ===');
    console.log('Session original:', { id: session.id, precio: session.precio, tipo: typeof session.precio, pagado: session.pagado });
    console.log('Session transformada:', { id: transformedSession.id, monto: transformedSession.monto, tipo: typeof transformedSession.monto, pagado: transformedSession.pagado });
    console.log('========================');
    
    return transformedSession;
  }

  getSessionsForDisplay(): Observable<SessionDisplay[]> {
    return new Observable(observer => {
      this.getSessions().subscribe({
        next: (sessions) => {
          const transformedSessions = sessions.map(session => this.transformSessionForDisplay(session));
          observer.next(transformedSessions);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
} 