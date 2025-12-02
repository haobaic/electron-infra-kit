const { app, BrowserWindow, ipcMain } = require('electron')
const { WindowManager, WindowStore } = require('../dist/index.umd.js')
const path = require('path')

// 1. 初始化窗口管理器
const windowManager = new WindowManager({
  isDevelopment: !app.isPackaged,
  defaultConfig: {
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  }
})

// 2. 定义一些简单的 HTML 内容用于演示
const MAIN_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>主窗口</title>
  <style>body { font-family: sans-serif; padding: 20px; }</style>
</head>
<body>
  <h1>主窗口</h1>
  <p>这是应用的主入口。</p>
  <button onclick="require('electron').ipcRenderer.invoke('open-settings')">打开设置窗口</button>
  <button onclick="require('electron').ipcRenderer.invoke('open-detail', { id: 123 })">打开详情页 (ID: 123)</button>
  <div id="msg"></div>
  <script>
    require('electron').ipcRenderer.on('update-status', (e, data) => {
      document.getElementById('msg').innerText = '收到消息: ' + JSON.stringify(data)
    })
  </script>
</body>
</html>
`

const SETTINGS_HTML = `
<!DOCTYPE html>
<html>
<head><title>设置</title></head>
<body>
  <h1>设置窗口</h1>
  <p>这里是设置页面。尝试再次点击主窗口的"打开设置"，你会发现只会聚焦这里，不会新建。</p>
</body>
</html>
`

const DETAIL_HTML = `
<!DOCTYPE html>
<html>
<head><title>详情页</title></head>
<body>
  <h1>详情页</h1>
  <p id="info"></p>
  <script>
    // 获取 URL 参数 (实际项目中通常通过 preload 传递)
    const params = new URLSearchParams(window.location.search);
    document.getElementById('info').innerText = '正在查看 ID: ' + params.get('id');
  </script>
</body>
</html>
`

// 3. 应用生命周期
app.whenReady().then(() => {
  // 创建主窗口
  const mainId = windowManager.create({
    name: 'main',
    title: '示例应用 - 主窗口'
  })

  // 加载内容
  const mainWin = WindowStore.get(mainId)
  if (mainWin) {
    mainWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(MAIN_HTML)}`)

    // 演示：3秒后给主窗口发消息
    setTimeout(() => {
      windowManager.send(mainId, 'update-status', { status: '系统正常', time: new Date().toLocaleTimeString() })
    }, 3000)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 4. 处理 IPC 请求，演示 WindowCreator 和防重复创建
ipcMain.handle('open-settings', () => {
  // 方式一：直接使用 windowManager.create
  // 如果 name 为 'settings' 的窗口已存在，会自动聚焦，不会重复创建
  const id = windowManager.create({
    name: 'settings',
    title: '设置',
    width: 400,
    height: 300,
    resizable: false
  })

  const win = WindowStore.get(id)
  win?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(SETTINGS_HTML)}`)
})

ipcMain.handle('open-detail', (event, data) => {
  // 方式二：使用 WindowCreator (适合更复杂的场景)
  // 这里演示如何创建一个带有特定 ID 的详情页
  // 如果你想允许打开多个详情页（比如详情A、详情B），可以在 name 里加上 ID
  const detailName = `detail-${data.id}`

  const id = windowManager.create({
    name: detailName,
    title: `详情 - ${data.id}`
  })

  const win = WindowStore.get(id)
  win?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(DETAIL_HTML)}?id=${data.id}`)
})
