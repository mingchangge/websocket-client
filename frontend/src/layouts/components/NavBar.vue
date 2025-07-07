<template>
  <div class="navbar">
    <div class="navbar-left">
      <p>
        <span>欢迎，{{ userInfo.username || '加载中...' }}</span>
        <span>邮箱: {{ userInfo.email || '加载中...' }}</span>
      </p>
    </div>
    <div class="navbar-right">
      <UserMessage />
      <el-button type="text" @click="logout">退出登录</el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useUserStore, useWebSocketStore } from '@/store'
import { common } from '../../api/common'
import UserMessage from './UserMessage.vue'

export default {
  name: 'NavBar',
  components: {
    UserMessage
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(useUserStore, ['userInfo'])
  },
  created() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
      return
    }
    this.initWebSocket(token)
    // this.fetchMessages()
  },
  beforeDestroy() {
    this.disconnect()
  },
  methods: {
    ...mapActions(useWebSocketStore, ['initWebSocket', 'disconnect']),
    logout() {
      common
        .logoutApi()
        .then(() => {
          this.$message.success('退出登录成功')
        })
        .catch(error => {
          console.error('退出登录失败:', error)
          this.$message.error('退出登录失败，即将强制退出')
        })
        .finally(() => {
          localStorage.removeItem('token')
          this.$router.push('/login')
          this.disconnect()
        })
      console.log('退出登录')
    }
  }
}
</script>

<style scoped lang="less">
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  &-left {
    flex: 1;
    text-align: left;
    p {
      margin: 0;
      span {
        margin-right: 10px;
      }
    }
  }
  &-right {
    flex: 1;
    text-align: right;
  }
}
</style>
