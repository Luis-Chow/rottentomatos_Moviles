import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'catalog',
        loadComponent: () => import('./pages/catalog/catalog.page').then((m) => m.CatalogPage),
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'reviews',
        loadComponent: () => import('./pages/my-reviews/my-reviews.page').then((m) => m.MyReviewsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: '', redirectTo: 'catalog', pathMatch: 'full' },
    ],
  },
  {
    path: 'movies/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/movie-detail/movie-detail.page').then((m) => m.MovieDetailPage),
  },
  {
    path: 'review/:movieId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/review-form/review-form.page').then((m) => m.ReviewFormPage),
  },
  { path: '', redirectTo: 'tabs/catalog', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/catalog' },
];
