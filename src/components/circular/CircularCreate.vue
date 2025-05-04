<template>
  <div class="circular-create">
    <h2>回覧箋の作成</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">タイトル</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="content">本文</label>
        <textarea
          id="content"
          v-model="form.content"
          required
          class="form-control"
          rows="5"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="deadline">期限</label>
        <input
          id="deadline"
          v-model="form.deadline"
          type="date"
          required
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label>添付ファイル</label>
        <input
          type="file"
          @change="handleFileChange"
          multiple
          class="form-control"
        />
        <div v-if="form.files.length > 0" class="file-list">
          <div
            v-for="(file, index) in form.files"
            :key="index"
            class="file-item"
          >
            {{ file.name }}
            <button @click="removeFile(index)" class="btn-remove">×</button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>回覧先（部署）</label>
        <div class="department-list">
          <div
            v-for="dept in departments"
            :key="dept.id"
            class="department-item"
          >
            <input
              type="checkbox"
              :id="'dept-' + dept.id"
              :value="dept.id"
              v-model="form.departments"
            />
            <label :for="'dept-' + dept.id">{{ dept.name }}</label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit" :disabled="isSubmitting">
          {{ isSubmitting ? '作成中...' : '作成' }}
        </button>
        <button type="button" class="btn-cancel" @click="handleCancel">
          キャンセル
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

interface Department {
  id: string;
  name: string;
}

interface CircularForm {
  title: string;
  content: string;
  deadline: string;
  files: File[];
  departments: string[];
}

const router = useRouter();
const isSubmitting = ref(false);

// 仮の部署データ（後でAPIから取得するように変更）
const departments = ref<Department[]>([
  { id: 'dept1', name: '総務部' },
  { id: 'dept2', name: '人事部' },
  { id: 'dept3', name: '経理部' },
]);

const form = reactive<CircularForm>({
  title: '',
  content: '',
  deadline: '',
  files: [],
  departments: [],
});

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    form.files = Array.from(input.files);
  }
};

const removeFile = (index: number) => {
  form.files.splice(index, 1);
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    // TODO: APIを呼び出して回覧箋を作成
    console.log('フォームデータ:', form);
    // 成功したら一覧ページにリダイレクト
    router.push('/circulars');
  } catch (error) {
    console.error('回覧箋の作成に失敗しました:', error);
    // TODO: エラーメッセージを表示
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push('/circulars');
};
</script>

<style scoped>
.circular-create {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.file-list {
  margin-top: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 5px;
}

.btn-remove {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 1.2em;
}

.department-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.department-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-submit,
.btn-cancel {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  background-color: #4caf50;
  color: white;
  border: none;
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}
</style>
