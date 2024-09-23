import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component'),
        children: [
            {
                path: 'tasks',
                loadComponent: () => import('./dashboard/pages/tasks/tasks.component')
            },
            {
                path: '', 
                redirectTo: 'tasks',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '', 
        redirectTo: 'dashboard',
        pathMatch: 'full'
    }
];
