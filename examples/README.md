# 示例运行指南

这个目录包含了 `electron-window-manager-kit` 的使用示例。

由于本项目本身是一个库，示例代码直接引用了构建后的 `dist/index.umd.js` 文件。

## 如何运行示例？

你需要一个基本的 Electron 环境来运行这些代码。

1. **在你的 Electron 项目中**：
   将代码复制到你的 `main.js` 或相关文件中。

2. **在本仓库中测试**：
   你可以使用 `electron` 直接运行 `basic-usage.js`（需要确保已安装依赖并构建）。

   ```bash
   # 1. 构建库
   npm run build

   # 2. 运行示例 (确保你全局安装了 electron 或在项目中安装)
   # Windows
   .\node_modules\.bin\electron examples/basic-usage.js
   
   # Linux/Mac
   ./node_modules/.bin/electron examples/basic-usage.js
   ```

## 示例文件说明

- **`basic-usage.js`**: 
  - 包含完整的 Electron 主进程代码。
  - 演示了初始化、主窗口创建。
  - 演示了 IPC 通信（主进程 <-> 渲染进程）。
  - 演示了防止重复创建窗口（设置窗口）。
  - 演示了带参数的窗口创建（详情页）。
  - 内嵌了简单的 HTML，直接运行即可看到效果。

- **`custom-class.js`**:
  - 演示了如何通过继承 `WindowManager` 类来封装特定业务逻辑（如登录窗口、播放器窗口）。
  - 这是一种更高级、更整洁的代码组织方式。
