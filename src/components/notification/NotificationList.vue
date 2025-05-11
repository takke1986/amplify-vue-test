<template>
  <div class="notification-list">
    <div class="notification-header">
      <h3>通知</h3>
      <button
        v-if="unreadCount > 0"
        @click="markAllAsRead"
        class="mark-all-read"
      >
        すべて既読にする
      </button>
    </div>
    <div v-if="notifications.length > 0" class="notification-items">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification-item', { unread: !notification.isRead }]"
      >
        <div
          class="notification-content"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon" :class="notification.type">
            <i class="fas" :class="getIconClass(notification.type)"></i>
          </div>
          <div class="notification-details">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">
              {{ formatTime(notification.createdAt) }}
            </div>
          </div>
        </div>
        <button
          @click.stop="handleDelete(notification.id)"
          class="delete-button"
          title="通知を削除"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div v-else class="no-notifications">通知はありません</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';

const router = useRouter();
const notificationStore = useNotificationStore();
const { notifications, unreadCount } = storeToRefs(notificationStore);

onMounted(() => {
  notificationStore.fetchNotifications();
});

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getIconClass = (type: string) => {
  switch (type) {
    case 'new':
      return 'fa-bell';
    case 'approval':
      return 'fa-check-circle';
    case 'rejection':
      return 'fa-times-circle';
    case 'expired':
      return 'fa-clock';
    default:
      return 'fa-info-circle';
  }
};

const handleNotificationClick = async (notification: any) => {
  if (!notification.isRead) {
    await notificationStore.markAsRead(notification.id);
  }
  if (notification.circularId) {
    router.push(`/circulars/${notification.circularId}`);
  }
};

const handleDelete = async (notificationId: string) => {
  if (confirm('この通知を削除してもよろしいですか？')) {
    await notificationStore.deleteNotification(notificationId);
  }
};

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};
</script>

<style scoped>
.notification-list {
  width: 400px;
  max-height: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.1em;
  color: #333;
}

.mark-all-read {
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  font-size: 0.9em;
  padding: 4px 8px;
}

.mark-all-read:hover {
  text-decoration: underline;
}

.notification-items {
  max-height: 500px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-content {
  display: flex;
  flex: 1;
  cursor: pointer;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-icon.new {
  background-color: #e3f2fd;
  color: #1976d2;
}

.notification-icon.approval {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.notification-icon.rejection {
  background-color: #ffebee;
  color: #c62828;
}

.notification-icon.expired {
  background-color: #fff3e0;
  color: #ef6c00;
}

.notification-details {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.notification-message {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 0.8em;
  color: #999;
}

.delete-button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 8px;
  margin-left: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.delete-button:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.no-notifications {
  padding: 32px;
  text-align: center;
  color: #666;
}
</style>
