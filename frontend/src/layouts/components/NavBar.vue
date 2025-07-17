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
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          <i class="el-icon-s-tools" />
        </span>
        <el-dropdown-menu>
          <el-dropdown-item @click.native="newLoginWindow"
            >新建登录</el-dropdown-item
          >
          <el-dropdown-item divided @click.native="logout"
            >退出登录</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useUserStore, useWebSocketStore } from '@/store'
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
    ...mapState(useUserStore, ['userInfo', 'isLogin', 'useToken'])
  },
  created() {
    this.initWebSocket(this.useToken)
  },
  beforeDestroy() {
    this.disconnect()
  },
  methods: {
    ...mapActions(useWebSocketStore, ['initWebSocket', 'disconnect']),
    ...mapActions(useUserStore, ['logout']),
    newLoginWindow() {
      if (!window.electronAPI) {
        return this.$message.warning('请在客户端中打开')
      }
      window.electronAPI.NewLoginWindow()
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
    .el-dropdown-link {
      cursor: pointer;
      color: #409eff;
    }
    .el-icon-s-tools {
      font-size: 18px;
    }
  }
}
</style>
