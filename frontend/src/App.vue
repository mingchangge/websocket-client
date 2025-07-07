<template>
  <div id="app" style="height: 100%">
    <ElectronTab>
      <router-view></router-view>
    </ElectronTab>
  </div>
</template>

<script>
import ElectronTab from '@/layouts/components/ElectronTab'
export default {
  name: 'App',
  components: {
    ElectronTab
  },
  data() {
    return {
      isLogin: localStorage.getItem('token') ? true : false
    }
  },
  watch: {
    isLogin: {
      handler(bool) {
        if (bool) {
          this.$router.push('/home')
        } else {
          this.$router.push('/login')
        }
      },
      immediate: true
    }
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
