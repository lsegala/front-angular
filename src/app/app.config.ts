import { HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { MOCK_INTERCEPTORS } from '../mocks/mock-interceptors';
import { APP_NAVIGATION } from './app.navigation';
import { routes } from './app.routes';
import { provideAccessibility } from './core/accessibility/accessibility.providers';
import { provideErrorHandling } from './core/error-handling/error-handling.providers';
import { httpErrorInterceptor } from './core/error-handling/http-error.interceptor';
import { NAVIGATION_ITEMS } from './core/layout/navigation';
import { provideLocalization } from './core/localization/localization.providers';
import { authInterceptor } from './features/auth/data-access/auth.interceptor';
import { provideAuth } from './features/auth/data-access/auth.providers';

/**
 * Ordem importa: a requisição passa de cima para baixo e a resposta volta de baixo para cima.
 * O mock fica por último porque substitui o backend real. Ele só existe no build `development`
 * (`MOCK_INTERCEPTORS` é vazio nos demais), e `features.mockBackend` liga/desliga em tempo de execução.
 */
const httpInterceptors: HttpInterceptorFn[] = [
  authInterceptor,
  httpErrorInterceptor,
  ...(environment.features.mockBackend ? MOCK_INTERCEPTORS : []),
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withFetch(), withInterceptors(httpInterceptors)),
    provideErrorHandling(),
    provideLocalization(),
    provideAccessibility(),
    provideAuth(),
    { provide: NAVIGATION_ITEMS, useValue: APP_NAVIGATION },
  ],
};
