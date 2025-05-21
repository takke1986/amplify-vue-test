import { defineStore } from 'pinia';

export interface DepartmentPermission {
  departmentId: string; // 部署ID
  departmentName: string; // 部署名
  role: '一般' | '管理者'; // 権限
  editable: boolean; // 編集権限の有無
  notificationEmails: string[]; // 通知先メールアドレス
}

const initialPermissions: DepartmentPermission[] = [
  {
    departmentId: '2001',
    departmentName: '2部署（営業）',
    role: '管理者',
    editable: true,
    notificationEmails: ['admin@example.com'],
  },
  {
    departmentId: '1002',
    departmentName: '1部署（配電）',
    role: '一般',
    editable: false,
    notificationEmails: ['user@example.com'],
  },
];

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: initialPermissions as DepartmentPermission[],
  }),
  actions: {
    setPermissions(newPermissions: DepartmentPermission[]) {
      this.permissions = newPermissions;
    },
    updatePermission(
      departmentId: string,
      update: Partial<DepartmentPermission>
    ) {
      const idx = this.permissions.findIndex(
        (p) => p.departmentId === departmentId
      );
      if (idx !== -1) {
        this.permissions[idx] = { ...this.permissions[idx], ...update };
      }
    },
  },
});
