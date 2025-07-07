import { defineStore } from 'pinia';

export const useUserStore = defineStore('userStore', {
    state: () => ({
        userInfo: {}
    }),
    actions: {
        setUserInfo(info) {
            this.userInfo = info;
        }
    }
});