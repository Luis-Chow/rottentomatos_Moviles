// Géneros / categorías (nombres en español, tal como los devuelve TMDB con acentos).
export const GENRES: string[] = [
  'Acción',
  'Aventura',
  'Animación',
  'Comedia',
  'Crimen',
  'Documental',
  'Drama',
  'Familia',
  'Fantasía',
  'Historia',
  'Terror',
  'Música',
  'Misterio',
  'Romance',
  'Ciencia ficción',
  'Suspense',
  'Bélica',
  'Western',
];

// Normaliza un género para comparar sin importar acentos ni mayúsculas.
// Evita que un desajuste de acentos haga que el filtro no devuelva nada.
export function normalizeGenre(g: string): string {
  return g
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function genreMatches(movieGenres: string[], selected: string[]): boolean {
  if (selected.length === 0) return true;
  const norm = movieGenres.map(normalizeGenre);
  return selected.some((s) => norm.includes(normalizeGenre(s)));
}
