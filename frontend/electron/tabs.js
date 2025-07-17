import {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  session,
  shell
} from 'electron'

import path from 'path'
import log from 'electron-log'

// 记录每个窗口的BrowserView
//  key: BrowserWindow.id
//  value:  map{app_key1: browserView1, app_key2: browserView2, ...}
let browserViewMap = {}

// home窗口的最大高度
let homeMaxHeight = 36

let viewArguments = undefined

// 根据event以及args获取窗口和BrowserView
function getWindowAndBrowserView(event, args) {
  let window = BrowserWindow.fromWebContents(event.sender)
  if (window) {
    const browserViewList = browserViewMap[window.id]
    if (args && browserViewList) {
      const browserView = browserViewList[args.applicationKey]
      return {
        window,
        browserView
      }
    } else {
      return {
        window
      }
    }
  }
}

// 由event以及args创建BrowserView
function createBrowserView(event, arg) {
  viewArguments = arg
  let { window } = getWindowAndBrowserView(event)
  if (!window) {
    log.error('window not found for event')
    return
  }
  const [width, height] = window.getSize()
  const browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'spinner.js')
    }
  })
  browserView.setAutoResize({
    width: true,
    height: true
  })

  browserView.webContents.on('did-start-loading', () => {
    browserView.webContents.send('loading-show')
    log.info('did-start-loading')
  })
  browserView.webContents.loadURL(arg.applicationUrl).then(() => {
    log.info('loadURL success')
  })
  //did-stop-loading比dom-ready结束的晚一些，因为dom-ready结束后，页面还有可能在加载
  //did-stop-loading比did-finish-load结束的晚一些，did-finish-load导航完成时触发，即选项卡的旋转器将停止旋转，并指派onload事件后
  //did-stop-loading是页面加载完成后触发的
  browserView.webContents.on('did-stop-loading', () => {
    browserView.webContents.send('loading-hide')
    log.info('did-stop-loading')
    //在did-stop-loading中设置BrowserView的位置，以防出现交易中心质检服务页面出现大量空白区域
    browserView.setBounds({
      x: 0,
      y: homeMaxHeight,
      width,
      height: height - homeMaxHeight
    })
  })
  browserView.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      browserView.webContents.send(
        'fail-load',
        JSON.stringify({
          errorCode,
          errorDescription,
          validatedURL,
          isMainFrame
        })
      )
    }
  )
  window.addBrowserView(browserView)
  browserViewMap[window.id] = browserViewMap[window.id] || {}
  browserViewMap[window.id][arg.applicationKey] = browserView
}
/**
 * 打开或关闭开发者工具
 * @param {BrowserView} browserView--[browserView.webContents, event.sender]
 * @returns {void}
 */
function toggleDevTools(browserView) {
  const isOpen = browserView.isDevToolsOpened()
  if (isOpen) {
    browserView.closeDevTools()
  } else {
    browserView.openDevTools({ mode: 'bottom' })
  }
}
export function destroyBrowserView(window) {
  if (browserViewMap[window.id]) {
    for (let key in browserViewMap[window.id]) {
      let browserView = browserViewMap[window.id][key]
      window.removeBrowserView(browserView)
      browserView.webContents.destroy()
    }
    delete browserViewMap[window.id]
  }
}

function installCFCAExtension() {
  const extensionPath = __dirname.split('app.asar')[0] + 'static/cfca'
  const url = app.isPackaged
    ? extensionPath
    : path.join(__dirname, '../public/cfca')
  session.defaultSession
    .loadExtension(url)
    .then(({ id }) => {
      log.info('load extension 成功!', url, id)
    })
    .catch(err => log.error('load extension 失败!', url, err))
}

export function initTab() {
  ipcMain.on('changeTab-browser-view', (event, arg) => {
    viewArguments = arg
    let { window, browserView } = getWindowAndBrowserView(event, arg)
    if (browserView) {
      log.info(`changeTab-browser-view ${window.id} ${arg.applicationKey}`)
      // 移除其他的BrowserView
      for (let key in browserViewMap[window.id]) {
        let view = browserViewMap[window.id][key]
        if (view !== browserView) {
          window.removeBrowserView(view)
        }
      }
      // 新增BrowserView
      window.addBrowserView(browserView)
    }
  })

  ipcMain.on('home-browser-view', event => {
    viewArguments = undefined
    let { window } = getWindowAndBrowserView(event)
    if (window) {
      log.info(`home-browser-view, window: ${window.id}`)
      window.setBrowserView(null)
    }
  })

  ipcMain.on('create-browser-view', (event, arg) => {
    createBrowserView(event, arg)
    installCFCAExtension()
  })
  ipcMain.on('toggle-dev-tools', (event, arg) => {
    // window窗口的开发者工具
    if (!arg || arg.applicationKey === 'Home') {
      toggleDevTools(event.sender)
      return
    }
    // browserView的开发者工具
    let { window, browserView } = getWindowAndBrowserView(event, arg)
    if (browserView) {
      log.info(`toggle-dev-tools ${window.id} ${arg.applicationKey}`)
      toggleDevTools(browserView.webContents)
    }
  })
  ipcMain.on('close-browser-view', (event, arg) => {
    let { window, browserView } = getWindowAndBrowserView(event, arg)
    if (browserView) {
      log.info(`close-browser-view ${window.id} ${arg.applicationKey}`)
      window.removeBrowserView(browserView)
      browserView.webContents.destroy()
      delete browserViewMap[window.id][arg.applicationKey]
    }
  })
}
// 客户端当前页面用浏览器打开
ipcMain.on('open-browser', (event, options) => {
  if (!viewArguments || viewArguments.applicationKey === 'Home') {
    // 生成带 token 的特殊 URL
    const targetUrl = new URL(options.url);
    targetUrl.searchParams.set('electron_token', options.token);
    targetUrl.searchParams.set('expire', Date.now() + 3600 * 1000); // 1小时有效期
    // window窗口的的浏览器打开
    shell.openExternal(
      `${!options.token
        ? options.url
        : targetUrl.toString()
      }`
    )
    return
  }
  // browserView的浏览器打开
  shell.openExternal(`${viewArguments.applicationUrl}`)
})
