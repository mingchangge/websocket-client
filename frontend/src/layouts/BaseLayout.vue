<template>
  <div :class="!isBrowser ? 'layout' : 'browser-layout'">
    <el-container>
      <el-header>
        <NavBar />
      </el-header>
      <el-container class="layout-container">
        <el-aside
          width="200px"
          style="
            background-color: rgb(238, 241, 246);
            border-right: solid 1px #e6e6e6;
          "
        >
          <el-menu
            :default-active="activeMenu"
            class="el-menu-vertical-demo"
            background-color="#f5f7fa"
            text-color="#333"
            active-text-color="#409eff"
          >
            <div v-for="menu in menuList" :key="menu.name">
              <el-submenu :index="menu.name" v-if="menu.children">
                <template slot="title">{{ menu.name }}</template>
                <div v-for="item in menu.children" :key="item.name">
                  <el-menu-item
                    :index="item.path"
                    :key="item.name"
                    @click="getPath(item)"
                    >{{ item.name }}</el-menu-item
                  >
                </div>
              </el-submenu>
              <el-menu-item
                v-else
                :index="menu.path"
                :key="menu.name"
                @click="getPath(menu)"
                >{{ menu.name }}</el-menu-item
              >
            </div>
            <!-- <el-menu-item
              v-for="menu in menuList"
              :index="menu.path"
              :key="menu.name"
              @click="getPath(menu)"
              >{{ menu.name }}</el-menu-item
            > -->
            <el-menu-item
              v-for="menu in sites"
              :index="menu.url"
              :key="menu.name"
              @click="goOther(menu)"
              >{{ menu.name }}</el-menu-item
            >
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
</template>
<script>
import { useElectronTabStore } from '@/store'
import { mapActions } from 'pinia'
import NavBar from '@/layouts/components/NavBar.vue'

export default {
  name: 'BaseLayout',
  components: {
    NavBar
  },
  data() {
    return {
      activeMenu: '/home',
      menuList: [
        { name: 'Home', path: '/home' },
        { name: '元编程', path: '/meta-programming' },
        {
          name: 'word preview',
          children: [
            { name: 'docx-preview', path: '/word-preview' },
            { name: 'mammoth-preview', path: '/mammoth-preview' },
            { name: 'word编辑器-quill', path: '/word-editor' }
          ]
        }
      ],
      sites: [
        { name: 'Baidu', url: 'https://www.baidu.com' },
        { name: 'Google', url: 'https://www.google.com' },
        { name: 'GitHub', url: 'https://github.com' }
      ],
      isBrowser: !window.electronAPI
    }
  },
  created() {
    this.activeMenu = this.$route.path
  },
  methods: {
    ...mapActions(useElectronTabStore, ['openApplication']),
    getPath(menu) {
      this.activeMenu = menu.path
      this.$router.push({ path: menu.path })
    },
    goOther(site) {
      const siteInfo = this.sites.find(
        s => s.name.toLowerCase() === site.name.toLowerCase()
      )
      if (siteInfo) {
        this.activeMenu = siteInfo.url
        if (!window.electronAPI) {
          window.open(siteInfo.url, '_blank')
          return
        }
        let urlObject = {
          applicationUrl: siteInfo.url,
          applicationKey: siteInfo.name,
          applicationName: siteInfo.name,
          applicationIcon: 'icons/vite.svg',
          isActive: true,
          isVisible: true,
          showClose: true
        }
        this.openApplication(urlObject)
      } else {
        console.error('Site not found:', site)
      }
    }
  }
}
</script>
<style lang="less" scoped>
.layout {
  height: calc(100vh - 37px);
  &-container {
    height: calc(100vh - 37px - 60px - 60px);
    .el-menu {
      height: 100%;
      border-right: none;
      text-align: left;
    }
  }
  .el-header,
  .el-footer {
    text-align: center;
    line-height: 60px;
    background-color: #eef1f6;
    color: #333;
  }
}
.browser-layout {
  height: 100%;
  .layout-container {
    height: calc(100vh - 61px - 60px);
    .el-menu {
      height: 100%;
      border-right: none;
      text-align: left;
    }
  }
  .el-header,
  .el-footer {
    text-align: center;
    line-height: 60px;
    background-color: #eef1f6;
    color: #333;
  }
}
</style>
