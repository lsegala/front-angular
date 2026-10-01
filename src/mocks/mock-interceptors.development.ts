import { HttpInterceptorFn } from '@angular/common/http';
import { mockBackendInterceptor } from './mock-backend.interceptor';

/** Build `development`: substitui `mock-interceptors.ts` (ver `fileReplacements` no angular.json). */
export const MOCK_INTERCEPTORS: readonly HttpInterceptorFn[] = [mockBackendInterceptor];
