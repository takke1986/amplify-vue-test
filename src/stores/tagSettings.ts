import { defineStore } from 'pinia';
import { ref } from 'vue';

// 型定義
export interface ProcessSetting {
  process: number;
  mailNotify: boolean;
  todoMessages: string[];
}
export interface TagSetting {
  name: string;
  color: string;
  processSettings: ProcessSetting[];
}

const PROCESS_COUNT = 15;

// 初期タグ例
const initialTagSettings: TagSetting[] = [
  {
    name: '重要',
    color: '#e53935',
    processSettings: Array.from({ length: PROCESS_COUNT }, (_, i) => ({
      process: i + 1,
      mailNotify: false,
      todoMessages: i === 0 ? ['至急対応してください'] : [],
    })),
  },
  {
    name: '連絡',
    color: '#1976d2',
    processSettings: Array.from({ length: PROCESS_COUNT }, (_, i) => ({
      process: i + 1,
      mailNotify: false,
      todoMessages: i === 1 ? ['ご確認ください'] : [],
    })),
  },
];

export const useTagSettingsStore = defineStore('tagSettings', () => {
  const tagSettings = ref<TagSetting[]>(initialTagSettings);

  function setTagSettings(newSettings: TagSetting[]) {
    tagSettings.value = newSettings;
  }

  return { tagSettings, setTagSettings };
});
