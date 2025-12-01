import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { CalendarViewComponent } from '../pages/calendar-view/calendar-view.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'usuarios',
        loadChildren: () => import('../pages/home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'pacientes',
        loadChildren: () => import('../pages/patients/patients.module').then(m => m.PatientsModule)
      },
      {
        path: 'sesiones',
        loadChildren: () => import('../pages/sessions/sessions.module').then(m => m.SessionsModule)
      },
      {
        path: 'crear-sesion',
        loadChildren: () => import('../pages/create-session/create-session.module').then(m => m.CreateSessionModule)
      },
      {
        path: 'analisis-ia',
        loadChildren: () => import('../pages/ai-analysis/ai-analysis.module').then(m => m.AiAnalysisModule)
      },
      {
        path: 'configuracion',
        loadChildren: () => import('../pages/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'calendario',
        component: CalendarViewComponent
      },
      {
        path: '',
        redirectTo: 'usuarios',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LayoutModule { } 