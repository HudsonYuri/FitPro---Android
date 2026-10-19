import { describe, expect, it } from 'vitest';
import { parseExternalCatalog } from '../../api/to-exercise';
import snapshot from '../catalog-snapshot.json';

describe('catálogo embutido no app', () => {
  const { exercises } = parseExternalCatalog(snapshot);

  it('passa pela validação e cobre todos os grupos musculares', () => {
    expect(exercises.length).toBeGreaterThan(1000);
    expect(new Set(exercises.map((exercise) => exercise.target)).size).toBe(10);
  });

  it('aponta os GIFs para URLs públicas (funciona sem o backend)', () => {
    expect(exercises.every((exercise) => exercise.gifUrl.startsWith('https://'))).toBe(true);
  });
});
