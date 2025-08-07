import { defineStore } from 'pinia';

export const useMessageStore = defineStore('messageStore', {
    state: () => ({
        messagesList: [],
        unReadCount: 0, // 未读消息计数
        broadcastList: [],
    }),
    getters: {
        getLatestMessages: (state) => (n = 10) => state.messagesList?.slice(0, n) || [],
    },
    actions: {
        setMessagesList(messages) {
            this.messagesList = messages;
        },
        setBroadcastList(broadcast) {
            this.broadcastList.push(broadcast);
        },
        addMessage(message) {
            this.messagesList.unshift(message);
        },
        clearMessages() {
            this.messagesList = [];
        }
    }
});    