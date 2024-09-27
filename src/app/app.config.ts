import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyCvpM_N55Y0qnMbi9Ta2FWAdrcMAlTCVIQ',
        authDomain: 'task-list-middle.firebaseapp.com',
        projectId: 'task-list-middle',
        storageBucket: 'task-list-middle.appspot.com',
        messagingSenderId: '836640276682',
        appId: '1:836640276682:web:4f69729f0359ba2a33b433',
      }),
    ),
    provideFirestore(() => getFirestore()),
  ],
};
