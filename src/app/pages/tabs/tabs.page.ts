import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="catalog">
          <ion-icon name="film-outline"></ion-icon>
          <ion-label>Catálogo</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="search">
          <ion-icon name="search-outline"></ion-icon>
          <ion-label>Buscar</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="reviews">
          <ion-icon name="star-outline"></ion-icon>
          <ion-label>Mis Reseñas</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {}
