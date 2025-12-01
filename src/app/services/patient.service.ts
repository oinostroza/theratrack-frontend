import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '../interfaces/patient.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  createPatient(data: CreatePatientRequest): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, data);
  }

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  updatePatient(id: number, data: UpdatePatientRequest): Observable<Patient> {
    return this.http.patch<Patient>(`${this.apiUrl}/${id}`, data);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  seedPatients(): Observable<Patient[]> {
    return this.http.post<Patient[]>(`${this.apiUrl}/seed`, {});
  }
} 