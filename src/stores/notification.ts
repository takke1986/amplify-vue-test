import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Notification {
  id: string;
  type: 'new' | 'approval' | 'rejection' | 'expired';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  circularId?: string;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);

  const fetchNotifications = async () => {
    try {
      // TODO: APIから通知を取得
      // 仮のデータ
      notifications.value = [
        {
          id: '1',
          type: 'new',
          title: '新規回覧箋',
          message: '「会議室の使用について」が回覧されました',
          createdAt: '2024-03-15T10:00:00',
          isRead: false,
          circularId: '1',
        },
        {
          id: '2',
          type: 'approval',
          title: '承認完了',
          message: '「社内イベントのご案内」が承認されました',
          createdAt: '2024-03-14T15:30:00',
          isRead: true,
          circularId: '2',
        },
        {
          id: '3',
          type: 'expired',
          title: '期限切れ',
          message: '「会議室の使用について」の期限が切れました',
          createdAt: '2024-03-13T09:15:00',
          isRead: false,
          circularId: '1',
        },
      ];
      updateUnreadCount();
    } catch (error) {
      console.error('通知の取得に失敗しました:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: APIを呼び出して既読にする
      const notification = notifications.value.find(
        (n) => n.id === notificationId
      );
      if (notification) {
        notification.isRead = true;
        updateUnreadCount();
      }
    } catch (error) {
      console.error('既読の更新に失敗しました:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: APIを呼び出してすべて既読にする
      notifications.value.forEach((notification) => {
        notification.isRead = true;
      });
      updateUnreadCount();
    } catch (error) {
      console.error('すべて既読の更新に失敗しました:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: APIを呼び出して通知を削除
      notifications.value = notifications.value.filter(
        (n) => n.id !== notificationId
      );
      updateUnreadCount();
    } catch (error) {
      console.error('通知の削除に失敗しました:', error);
    }
  };

  const addNotification = (notification: Notification) => {
    notifications.value.unshift(notification);
    updateUnreadCount();
  };

  const updateUnreadCount = () => {
    unreadCount.value = notifications.value.filter((n) => !n.isRead).length;
  };

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
});
