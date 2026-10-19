import type { Exercise, UserProfile, WorkoutItem, WorkoutPlan, WorkoutSession } from '@fitpro/core-types';
import { nameKey } from './familiarity';
import { estimateMinutes, prescribe } from './prescription';
import { selectExercise } from './selection';
import { buildSessionTemplates, chooseSplit, type SessionTemplate } from './split';

const WARM_UP_MINUTES = 5;
const MIN_ITEMS_PER_SESSION = 3;

const sessionMinutes = (items: readonly WorkoutItem[]): number =>
  WARM_UP_MINUTES + items.reduce((total, item) => total + estimateMinutes(item.prescription), 0);

/** Corta acessórios do fim até a sessão caber no tempo disponível. Principais ficam. */
export const fitToTime = (items: readonly WorkoutItem[], minutes: number): WorkoutItem[] => {
  const kept = [...items];
  while (sessionMinutes(kept) > minutes && kept.length > MIN_ITEMS_PER_SESSION) {
    const lastAccessory = kept.findLastIndex((item) => item.role === 'acessorio');
    if (lastAccessory === -1) break;
    kept.splice(lastAccessory, 1);
  }
  return kept;
};

const buildSession = (template: SessionTemplate, profile: UserProfile, catalog: readonly Exercise[]): WorkoutSession => {
  const usedIds = new Set<string>();
  const items: WorkoutItem[] = [];

  template.slots.forEach((slot, slotIndex) => {
    const selection = selectExercise({
      catalog,
      target: slot.target,
      role: slot.role,
      context: profile,
      excludeIds: usedIds,
      variant: template.variant,
    });
    if (!selection) return;
    // Bloqueia também os IDs com o mesmo nome: no catálogo real há duplicatas.
    const chosenName = nameKey(selection.exercise);
    for (const exercise of catalog) if (nameKey(exercise) === chosenName) usedIds.add(exercise.id);
    items.push({
      slotId: `${template.id}:${slotIndex}`,
      target: slot.target,
      role: slot.role,
      reason: selection.reason,
      prescription: prescribe({
        exerciseId: selection.exercise.id,
        goal: profile.goal,
        level: profile.level,
        role: slot.role,
      }),
    });
  });

  return { id: template.id, title: template.title, items: fitToTime(items, profile.minutesPerSession) };
};

export const buildPlan = (profile: UserProfile, catalog: readonly Exercise[]): WorkoutPlan => ({
  split: chooseSplit(profile.daysPerWeek),
  sessions: buildSessionTemplates(profile.daysPerWeek).map((template) => buildSession(template, profile, catalog)),
});

export const estimateSessionMinutes = (session: WorkoutSession): number => Math.round(sessionMinutes(session.items));
