import { defineStore } from 'pinia';
import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

interface Tag {
  id: string;
  name: string;
  color: string;
}

export const useTagStore = defineStore('tag', {
  state: () => ({
    tags: [] as Tag[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getTags: (state) => state.tags,
    getTagById: (state) => (id: string) =>
      state.tags.find((tag) => tag.id === id),
  },

  actions: {
    async fetchTags() {
      this.isLoading = true;
      this.error = null;

      try {
        const client = generateClient<Schema>();
        const { data, errors } = await client.models.Tag.list({
          selectionSet: ['id', 'name', 'color'],
        });

        if (errors) {
          throw new Error(errors[0].message);
        }

        this.tags = data.map((tag) => ({
          id: tag.id || '',
          name: tag.name || '',
          color: tag.color || '#1976d2',
        }));
      } catch (error) {
        console.error('タグの取得に失敗しました:', error);
        this.error =
          error instanceof Error ? error.message : 'タグの取得に失敗しました';
      } finally {
        this.isLoading = false;
      }
    },

    clearTags() {
      this.tags = [];
      this.error = null;
    },

    // タグの更新後に呼び出すメソッド
    async refreshTags() {
      await this.fetchTags();
    },
  },
});
