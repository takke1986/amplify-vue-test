import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'storage', // バケット名（任意の英数字）
  access: (allow) => ({
    'public/*': [], // 誰もアクセス不可
    'protected/*': [allow.authenticated.to(['read', 'write', 'delete'])], // 認証ユーザーのみ
    'private/*': [allow.authenticated.to(['read', 'write', 'delete'])], // 認証ユーザーのみ
  }),
  triggers: {},
  // 必要に応じてバケット名やCORS設定も追加可能
});
