<template>
  <div id="app" style="height: 100%">
    <ElectronTab>
      <router-view></router-view>
    </ElectronTab>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useUserStore } from '@/store'
import ElectronTab from '@/layouts/components/ElectronTab'

export default {
  name: 'App',
  components: {
    ElectronTab
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(useUserStore, ['isLogin'])
  },
  created() {
    const urlParams = new URLSearchParams(location.search)
    if (urlParams.has('electron_token')) {
      // 验证 URL 有效期（防止重放攻击）
      if (Number(urlParams.get('expire')) > Date.now()) {
        this.setToken(urlParams.get('electron_token'))
        if (this.isLogin) {
          // 立即跳转清除 URL 参数
          history.replaceState(null, '', location.pathname)
        }
      }
    }
  },
  methods: {
    ...mapActions(useUserStore, ['setToken'])
  }
}
</script>

<style lang="less" scoped>
@media screen {
  body {
    &.dark-theme {
      filter: invert(0.94) hue-rotate(180deg);
      img {
        filter: invert(1) hue-rotate(180deg);
      }
      .invert-restore,
      .table-button {
        filter: none;
        /* // 反转回去的，里面的东西，在去除反转 */
        img {
          filter: none;
        }
      }
    }
  }
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.logo.electron:hover {
  filter: drop-shadow(0 0 2em #9feaf9);
}
</style>
