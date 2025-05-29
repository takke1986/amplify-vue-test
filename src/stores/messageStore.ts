import { defineStore } from 'pinia';

export type MessageType = 'success' | 'error' | 'info';

export const useMessageStore = defineStore('message', {
  state: () => ({
    message: '' as string,
    type: 'info' as MessageType,
    visible: false as boolean,
  }),
  actions: {
    setMessage(message: string, type: MessageType = 'info') {
      this.message = message;
      this.type = type;
      this.visible = true;
    },
    clearMessage() {
      this.message = '';
      this.visible = false;
    },
  },
});
