import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine plusieurs classes CSS en une seule chaîne, en gérant les conflits avec Tailwind CSS
 * @param inputs - Les classes CSS à combiner
 * @returns Une chaîne de classes CSS optimisée
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date au format JJ/MM/AAAA
 * @param date - La date à formater (Date ou chaîne de caractères)
 * @returns La date formatée en chaîne de caractères
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
