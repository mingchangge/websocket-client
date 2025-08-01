<template>
  <div id="app">
    <div v-if="isElectron">
      <!-- 未登录显示websocket-client和logo -->
      <div v-if="!isLogin" class="root">
        <div :class="['custom-titlebar', isMac ? 'mac' : 'win']">
          <div>
            <img :src="getAssetsFile('images/512x512.png')" />websocket-client
          </div>
        </div>
      </div>
      <!-- 登录显示Tab -->
      <div
        v-else
        class="tab-container"
        :style="{
          paddingLeft: isMac ? '100px' : '0',
          paddingRight: isWin ? (isDev ? '164px' : '100px') : isDev ? '24px' : 0
        }"
      >
        <ScrollPane ref="scrollPane" :key="tabKey">
          <ul class="tabs clearfix">
            <li
              v-for="tab in tabData"
              :key="tab.applicationKey"
              class="tab"
              :class="{ active: tab.isActive, previous: tab.isPrevious }"
              @click="changeTab(tab)"
            >
              <a href="#">
                <div class="tanIcons">
                  <img
                    :src="
                      tab.applicationIcon
                        ? getAssetsFile(tab.applicationIcon)
                        : getAssetsFile('icons/vite.svg')
                    "
                  />
                </div>
                {{ tab.applicationName }}</a
              >
              <div
                v-if="isDev"
                class="devTools"
                @click.stop="toggleDevTools(tab)"
              >
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="开发者模式"
                  placement="bottom-start"
                >
                  <img
                    :src="getAssetsFile('icons/devMode.svg')"
                    style="width: 16px; height: 16px"
                  />
                </el-tooltip>
              </div>
              <div
                v-if="tab.showClose"
                class="close"
                @click.stop="closeTab(tab)"
              ></div>
            </li>
          </ul>
        </ScrollPane>
        <div
          v-if="isDev"
          class="browserBox"
          :style="{ right: isWin ? '148px' : '10px' }"
          @click="openBrowser"
        >
          <img
            :src="getAssetsFile('icons/browser.svg')"
            style="width: 100%; height: 100%"
          />
        </div>
      </div>
    </div>
    <div v-show="activeKey === 'Home'" class="application-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { mapState, mapWritableState, mapActions } from 'pinia'
import { useUserStore, useElectronTabStore } from '@/store'
import ScrollPane from '@/components/ScrollPane'

export default {
  name: 'ElectronTab',
  components: {
    ScrollPane
  },
  data() {
    return {
      isElectron: false,
      isMac: false,
      isWin: false,
      isDev: false
    }
  },
  computed: {
    ...mapState(useUserStore, ['isLogin', 'useToken']),
    ...mapState(useElectronTabStore, [
      'applicationData',
      'tabKey',
      'activeKey'
    ]),
    ...mapWritableState(useElectronTabStore, ['tabData'])
  },
  watch: {
    isLogin: {
      handler(bool) {
        if (bool) {
          this.tabData = this.applicationData.filter(app => app.isVisible)
          this.openApplication(this.tabData[0])
        }
      },
      immediate: true
    }
  },
  created() {
    // 判断是否是mac系统
    this.isMac = /macintosh|mac os x/i.test(navigator.userAgent)
    this.isWin = /windows|win32/i.test(navigator.userAgent)
    this.isElectron = window.electronAPI
    if (!this.isElectron) return
    this.isDev = import.meta.env.MODE === 'dev'
  },
  methods: {
    ...mapActions(useElectronTabStore, [
      'openApplication',
      'changeTab',
      'closeTab',
      'toggleDevTools'
    ]),
    getAssetsFile(url) {
      return new URL(`../../assets/${url}`, import.meta.url).href
    },
    openBrowser() {
      const url = window.location.href
      if (url.includes('orders-manage/sign-contract'))
        return this.$message.warning('当前页面不支持浏览器打开')
      if (!this.isLogin) {
        return this.$message.warning('请先登录')
      }
      window.electronAPI.openBrowser({
        url,
        token: this.useToken
      })
    }
  }
}
</script>

<style lang="less" scoped>
@media print {
  .tab-container {
    display: none !important;
  }
}

* {
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.root {
  /* 使用 flex 来实现 */
  display: flex;
  flex-direction: column;
  height: 100%;

  .custom-titlebar {
    /* 标题栏始终在最顶层（避免后续被 Modal 之类的覆盖） */
    // z-index: 9999;
    display: flex;

    /* 避免被收缩 */
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 100%;

    /* 高度与 main.js 中 titleBarOverlay.height 一致  */
    height: 36px;
    padding-left: 12px;
    color: #1d2129;
    font-size: 14px;
    // background: #ecebeb;
    background: #d3e3fd;
    border-bottom: 1px solid #d3d4d6;
    user-select: none;

    /* 设置该属性表明这是可拖拽区域，用来移动窗口 */
    -webkit-app-region: drag;

    &.win {
      justify-content: start;
    }

    img {
      width: 16px;
      height: 16px;
      margin-right: 4px;
      vertical-align: top;
    }
  }

  .content {
    flex: 1;
    overflow: auto;
  }
}

.tab-container {
  position: relative;
  display: flex;
  align-content: center;
  max-height: 36px;
  margin: 0;
  padding: 0 100px;
  overflow: hidden;
  background: #d3e3fd;
  border-bottom: 1px solid #d3d4d6;
  user-select: none;
  -webkit-app-region: drag;

  .tabs {
    display: flex;
    flex: 1;
    height: 35px;
    margin: 0;
    padding-right: 20px;
    line-height: 35px;
    list-style-type: none;

    .tab {
      position: relative;
      box-sizing: content-box;
      min-width: 150px;
      height: 170px;
      margin: 5px -10px 0 0;
      padding: 0 30px 0 25px;
      background: #d3e3fd;
      border-top-left-radius: 20px 90px;
      border-top-right-radius: 25px 170px;
      box-shadow: 0 10px 20px rgb(211 227 253 / 50%);
      -webkit-app-region: no-drag;

      a {
        position: relative;
        display: block;
        box-sizing: border-box;
        width: 100%;
        height: 30px;
        padding-left: 25px;
        overflow: hidden;
        color: #3c3a3a;
        font-size: 14px;
        line-height: 30px;
        text-decoration: none;
        text-overflow: ellipsis;

        .tanIcons {
          position: absolute;
          top: 5px;
          left: 0;
          width: 20px;
          height: 20px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            vertical-align: top;
          }
        }
      }

      .devTools {
        position: absolute;
        top: 1px;
        right: 46px;
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      .close {
        position: absolute;
        top: 8px;
        right: 20px;
        z-index: 99;
        width: 16px;
        height: 15px;
        background: url('../../assets/images/close_tab.png') no-repeat center;
        cursor: pointer;
      }

      &::after {
        position: absolute;
        top: 6px;
        right: 10px;
        width: 2px;
        height: 16px;
        background: #fff;
        content: '';
      }
    }

    .previous {
      &::after {
        background: transparent;
      }
    }

    .active {
      //z-index: 2;
      background: #fff;

      &::before,
      &::after {
        position: absolute;
        top: 0;
        width: 20px;
        height: 20px;
        background: transparent;
        border-style: solid;
        border-width: 10px;
        border-radius: 100%;
        content: '';
      }

      &::before {
        left: -23px;
        border-color: transparent #fff transparent transparent;
        transform: rotate(48deg);
      }

      &::after {
        right: -17px;
        background: transparent;
        border-color: transparent transparent transparent #fff;
        transform: rotate(-48deg);
      }
    }
  }

  .browserBox {
    position: absolute;
    top: 50%;
    right: 4px;
    z-index: 99;
    width: 20px;
    height: 20px;
    transform: translateY(-50%);
    cursor: pointer;
    -webkit-app-region: no-drag;
  }
}

.application-container {
  height: 100%;
  overflow: auto;
}
</style>
