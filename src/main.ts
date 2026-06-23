import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { addIcons } from 'ionicons';
import {
  star, starHalf, starOutline,
  search, searchOutline, film, filmOutline,
  person, personOutline, personCircleOutline,
  trashOutline, createOutline, addOutline, add,
  logOutOutline, cameraOutline, closeOutline, close,
  arrowBackOutline, funnelOutline, calendarOutline, timeOutline,
  peopleOutline, ribbonOutline, sadOutline, checkmarkCircle,
  imagesOutline, sendOutline,
} from 'ionicons/icons';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/services/auth.interceptor';

addIcons({
  star, 'star-half': starHalf, 'star-outline': starOutline,
  search, 'search-outline': searchOutline, film, 'film-outline': filmOutline,
  person, 'person-outline': personOutline, 'person-circle-outline': personCircleOutline,
  'trash-outline': trashOutline, 'create-outline': createOutline,
  'add-outline': addOutline, add,
  'log-out-outline': logOutOutline, 'camera-outline': cameraOutline,
  'close-outline': closeOutline, close,
  'arrow-back-outline': arrowBackOutline, 'funnel-outline': funnelOutline,
  'calendar-outline': calendarOutline, 'time-outline': timeOutline,
  'people-outline': peopleOutline, 'ribbon-outline': ribbonOutline,
  'sad-outline': sadOutline, 'checkmark-circle': checkmarkCircle,
  'images-outline': imagesOutline, 'send-outline': sendOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
}).catch((err) => console.error(err));
