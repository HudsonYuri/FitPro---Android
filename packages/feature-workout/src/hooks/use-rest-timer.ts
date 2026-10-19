import { useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cancelRestEnd, scheduleRestEnd } from '../notifications/rest-notification';

const TICK_MS = 250;
const END_VIBRATION_PATTERN = [0, 300, 150, 300];

export type RestTimerState = { status: 'idle' } | { status: 'resting'; endsAt: number; totalSeconds: number };

/**
 * Timer baseado em horário de término (não em contagem de ticks), então continua
 * correto em segundo plano. Uma notificação local avisa o fim do descanso quando
 * o app não está na tela; com o app aberto, quem avisa é a vibração.
 */
export const useRestTimer = ({ notify }: { notify: boolean }) => {
  const [state, setState] = useState<RestTimerState>({ status: 'idle' });
  const [now, setNow] = useState(() => Date.now());
  const notificationId = useRef<string | undefined>(undefined);

  const cancelNotification = (): void => {
    if (notificationId.current) void cancelRestEnd(notificationId.current).catch(() => undefined);
    notificationId.current = undefined;
  };

  useEffect(() => cancelNotification, []);

  useEffect(() => {
    if (state.status !== 'resting') return;
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= state.endsAt) {
        Vibration.vibrate(END_VIBRATION_PATTERN);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        notificationId.current = undefined;
        setState({ status: 'idle' });
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [state]);

  const start = (seconds: number, exerciseName: string): void => {
    const startedAt = Date.now();
    cancelNotification();
    setNow(startedAt);
    setState({ status: 'resting', endsAt: startedAt + seconds * 1000, totalSeconds: seconds });
    if (notify) {
      scheduleRestEnd(seconds, exerciseName)
        .then((id) => {
          notificationId.current = id;
        })
        .catch(() => undefined);
    }
  };

  const skip = (): void => {
    cancelNotification();
    setState({ status: 'idle' });
  };

  const remainingSeconds = state.status === 'resting' ? Math.max(0, Math.ceil((state.endsAt - now) / 1000)) : 0;

  return { state, remainingSeconds, start, skip };
};

export const formatClock = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
