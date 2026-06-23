import { HttpErrorResponse } from '@angular/common/http';

// Extrae un mensaje legible de un error de HttpClient.
export function httpErrorMessage(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return 'No se pudo conectar con el servidor.';
    const body = e.error;
    if (body && typeof body === 'object' && typeof body.error === 'string') return body.error;
    if (typeof body === 'string' && body) return body;
    return e.message || `Error HTTP ${e.status}`;
  }
  if (e instanceof Error) return e.message;
  return 'Error desconocido.';
}
