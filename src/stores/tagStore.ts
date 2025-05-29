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

    async fetchTagsWithCache() {
      this.isLoading = true;
      this.error = null;
      const DB_NAME = 'circular_cache_db';
      const DB_VERSION = 1;
      const TAGS_STORE = 'tags';
      const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24時間
      // IndexedDBの初期化
      const initDB = () => {
        return new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open(DB_NAME, DB_VERSION);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
          request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(TAGS_STORE)) {
              db.createObjectStore(TAGS_STORE, { keyPath: 'id' });
            }
          };
        });
      };
      // キャッシュから全タグを取得
      const getAllTagsFromCache = async () => {
        try {
          const db = await initDB();
          return new Promise<Tag[]>((resolve, reject) => {
            const transaction = db.transaction(TAGS_STORE, 'readonly');
            const store = transaction.objectStore(TAGS_STORE);
            const request = store.getAll();
            request.onsuccess = () => {
              const data = request.result;
              if (data && data.length > 0) {
                // 有効期限切れのデータをフィルタリング
                const validData = data.filter(
                  (item: any) => Date.now() - item.timestamp < CACHE_EXPIRY
                );
                resolve(validData.map((item: any) => item.data));
              } else {
                resolve([]);
              }
            };
            request.onerror = () => reject(request.error);
            transaction.oncomplete = () => db.close();
          });
        } catch (error) {
          console.error('キャッシュの取得に失敗しました:', error);
          return [];
        }
      };
      // キャッシュに保存
      const saveTagsToCache = async (tags: Tag[]) => {
        try {
          const db = await initDB();
          return new Promise<boolean>((resolve, reject) => {
            const transaction = db.transaction(TAGS_STORE, 'readwrite');
            const store = transaction.objectStore(TAGS_STORE);
            store.clear();
            tags.forEach((tag) => {
              store.put({ id: tag.id, data: tag, timestamp: Date.now() });
            });
            transaction.oncomplete = () => {
              db.close();
              resolve(true);
            };
            transaction.onerror = () => reject(transaction.error);
          });
        } catch (error) {
          console.error('キャッシュの保存に失敗しました:', error);
          return false;
        }
      };
      // まずキャッシュから取得
      const cachedTags = await getAllTagsFromCache();
      if (cachedTags.length > 0) {
        this.tags = cachedTags;
        this.isLoading = false;
        return;
      }
      // なければAPIから取得
      try {
        const client = generateClient<Schema>();
        const { data, errors } = await client.models.Tag.list({
          selectionSet: ['id', 'name', 'color'],
        });
        if (errors) throw new Error(errors[0].message);
        const tags = data.map((tag) => ({
          id: tag.id || '',
          name: tag.name || '',
          color: tag.color || '#1976d2',
        }));
        this.tags = tags;
        await saveTagsToCache(tags);
      } catch (error) {
        console.error('タグの取得に失敗しました:', error);
        this.error =
          error instanceof Error ? error.message : 'タグの取得に失敗しました';
      } finally {
        this.isLoading = false;
      }
    },
  },
});
