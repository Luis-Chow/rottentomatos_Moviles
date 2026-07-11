// Entorno de producción (build para APK / release).
// Para la APK en un teléfono real, el celular NO ve "localhost" del PC:
// se usa la IP LAN del PC (mismo WiFi) donde corre el backend.
// Si tu IP cambia, actualiza esta línea y recompila la APK.
// Si despliegas el backend (Railway/Render), pon aquí esa URL https.
export const environment = {
  production: true,
  apiUrl: 'http://192.168.100.90:4000',
};
