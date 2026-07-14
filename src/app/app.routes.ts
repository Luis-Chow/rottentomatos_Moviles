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
  {
    // Perfil público de un usuario (sus reseñas)
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user-profile/user-profile.page').then((m) => m.UserProfilePage),
  },
  {
    // Perfil de un actor (?id=<tmdbPersonId>&name=<nombre>)
    path: 'person',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/person/person.page').then((m) => m.PersonPage),
  },
  { path: '', redirectTo: 'tabs/catalog', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/catalog' },
];
