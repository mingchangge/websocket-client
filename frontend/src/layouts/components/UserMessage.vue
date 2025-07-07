<template>
  <div class="messageBox">
    <el-dropdown trigger="click">
      <i class="el-icon-bell" />
      <div v-if="parseInt(unReadCount) > 0" class="messageNumBox">
        <span>{{ calNum(unReadCount) }}</span>
      </div>
      <el-dropdown-menu slot="dropdown">
        <div v-if="noData">
          <el-empty description="暂无消息" />
        </div>
        <div class="list" v-else>
          <el-dropdown-item
            v-for="(item, index) in latestMessages"
            :key="index"
          >
            <div class="list-item">
              <p>{{ item.content }}</p>
              <span class="messageTime">{{ formatTime(item.timestamp) }}</span>
            </div>
          </el-dropdown-item>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useMessageStore } from '@/store'

export default {
  name: 'UserMessage',
  computed: {
    ...mapState(useMessageStore, {
      latestMessages: state => state.getLatestMessages(4),
      unReadCount: state => state.unReadCount
    }),
    noData() {
      return this.latestMessages.length === 0
    }
  },
  methods: {
    handleClick() {
      // 处理点击事件
      console.log('Dropdown clicked')
    },
    //返回未读消息数量，大于99显示99+
    calNum(count) {
      if (count > 0) {
        if (count < 100) {
          return count
        }
        return '99+'
      }
      return undefined
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleString() // 格式化为本地时间字符串
    }
  },
  mounted() {
    // 可以在这里添加初始化逻辑
    console.log('UserMessage component mounted')
  }
}
</script>

<style scoped lang="less">
// 消息通知dropdown组件样式
.el-dropdown-menu {
  padding-bottom: 15px;
  li:nth-last-child(1) .list-item {
    border-bottom: none;
  }
}
.messageBox {
  position: relative;
  display: inline-flex;
  margin-right: 10px;
  cursor: pointer;

  i {
    color: #333;
    font-size: 18px;
  }

  .messageNumBox {
    position: absolute;
    top: -13px;
    right: -8px;
    width: 20px;
    height: 20px;
    color: #fff;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    background: red;
    border-radius: 100%;
  }
}
.list {
  width: 250px;
  &-item {
    border-bottom: 1px solid #ebeef5;
    line-height: 18px;
    padding: 28px 0 6px;
    position: relative;
    p {
      margin: 0;
    }
    .messageTime {
      color: #999;
      font-size: 12px;
      position: absolute;
      top: 4px;
      right: 0;
    }
  }
}
</style>
