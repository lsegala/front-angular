import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Builds de produção e homologação: nenhum interceptor de mock.
 * No build `development` este arquivo é trocado por `mock-interceptors.development.ts`
 * (`fileReplacements` no angular.json), então o backend simulado e as credenciais de teste
 * não entram no bundle publicado.
 */
export const MOCK_INTERCEPTORS: readonly HttpInterceptorFn[] = [];
