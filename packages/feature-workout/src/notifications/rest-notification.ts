import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const REST_CHANNEL_ID = 'descanso';
const VIBRATION_PATTERN = [0, 300, 150, 300];

/**
 * Chame uma vez na raiz do app. Com o app aberto o próprio timer vibra,
 * então a notificação só aparece quando o app está em segundo plano.
 */
export const configureRestNotifications = async (): Promise<void> => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REST_CHANNEL_ID, {
      name: 'Fim do descanso',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: VIBRATION_PATTERN,
    });
  }
};

/** Pede permissão só quando o usuário começa um treino, nunca na abertura do app. */
export const ensureRestNotificationPermission = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

export const scheduleRestEnd = (seconds: number, exerciseName: string): Promise<string> =>
  Notifications.scheduleNotificationAsync({
    content: {
      title: 'Descanso encerrado',
      body: `Hora da próxima série de ${exerciseName}.`,
      sound: 'default',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: REST_CHANNEL_ID },
  });

export const cancelRestEnd = (notificationId: string): Promise<void> =>
  Notifications.cancelScheduledNotificationAsync(notificationId);
