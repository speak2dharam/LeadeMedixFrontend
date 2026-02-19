import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { NotFound } from './core/pages/not-found/not-found';
import { Forbidden } from './core/pages/forbidden/forbidden';
import { ServerError } from './core/pages/server-error/server-error';
import { authGuard } from './core/guards/auth-guard';
import { loginGuard } from './core/guards/login-guard';
import { roleGuard } from './core/guards/role-guard-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'auth',
        redirectTo: 'auth/login',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        component:MainLayout,
        children: [
            {
                path: '',
                component:Dashboard
            }
        ]
    },
    {
        path:'auth',
        canActivate:[loginGuard],
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path:'users',
        canActivate: [authGuard, roleGuard],
        component:MainLayout,
        loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
        data: { breadcrumb: 'Users', roles: ['Admin'] }
    },
    
    { path: '404', component: NotFound },
    { path: '403', component: Forbidden },
    { path: '500', component: ServerError },
    { path: '**', redirectTo: '404'}
];
