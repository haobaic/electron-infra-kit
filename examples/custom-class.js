import { WindowManager } from '../dist/index.umd.js'

// 1. 自定义登录窗口类
// 继承 WindowManager 可以让你封装特定类型窗口的逻辑
class LoginWindow extends WindowManager {
  constructor() {
    super({
      defaultConfig: {
        width: 300,
        height: 400,
        frame: false, // 无边框
        resizable: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      }
    })
  }

  open() {
    return this.create({
      name: 'login-window',
      title: '用户登录'
    })
  }
}

// 2. 自定义播放器窗口类
class PlayerWindow extends WindowManager {
  constructor() {
    super({
      defaultConfig: {
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        darkTheme: true
      }
    })
  }

  play(videoId) {
    const id = this.create({
      name: 'player', // 保证只有一个播放器实例
      title: '正在播放'
    })
    
    // 这里可以添加具体的加载逻辑
    console.log(`开始播放视频: ${videoId} 在窗口 ${id}`)
    return id
  }
}

// 导出给主进程使用
export { LoginWindow, PlayerWindow }
