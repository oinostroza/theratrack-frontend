import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('access_token');
    
    // Si hay token, agregarlo al header Authorization
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    console.log('=== HTTP REQUEST ===');
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    console.log('Headers:', request.headers);
    console.log('Body:', request.body);
    console.log('===================');
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('=== HTTP ERROR ===');
        console.error('URL:', request.url);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error:', error.error);
        console.error('==================');
        return throwError(() => error);
      })
    );
  }
} 