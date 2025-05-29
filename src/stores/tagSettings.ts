import { defineStore } from 'pinia';
import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

// 型定義
export interface ProcessSetting {
  process: number;
  mailNotify: boolean;
  todoMessages: string[];
}
export interface TagSetting {
  id: string;
  name: string;
  color: string;
  processSettings: ProcessSetting[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

// 初期タグ例（初期値は空配列に変更）
// const initialTagSettings: TagSetting[] = [ ... ];

const client = generateClient<Schema>();

export const useTagSettingsStore = defineStore('tagSettings', () => {
  const tagSettings = ref<TagSetting[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTags() {
    isLoading.value = true;
    error.value = null;
    try {
      const { data, errors } = await client.models.Tag.list({
        selectionSet: [
          'id',
          'name',
          'color',
          'createdBy',
          'createdAt',
          'updatedBy',
          'updatedAt',
          'processSettings',
        ],
      });
      if (errors) {
        throw new Error(errors[0].message);
      }
      tagSettings.value = data.map((tag) => ({
        id: tag.id || '',
        name: tag.name || '',
        color: tag.color || '#1976d2',
        processSettings: JSON.parse(tag.processSettings || '[]'),
        createdBy: tag.createdBy || '',
        createdAt: tag.createdAt || '',
        updatedBy: tag.updatedBy || '',
        updatedAt: tag.updatedAt || '',
      }));
    } catch (e) {
      console.error('タグの取得に失敗しました:', e);
      error.value = e instanceof Error ? e.message : 'タグの取得に失敗しました';
    } finally {
      isLoading.value = false;
    }
  }

  function setTagSettings(tags: TagSetting[]) {
    tagSettings.value = tags;
  }

  return {
    tagSettings,
    isLoading,
    error,
    fetchTags,
    setTagSettings,
  };
});
