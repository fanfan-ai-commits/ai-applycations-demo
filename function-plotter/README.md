# 🎯 函数图像工坊

> 初中/高中数学 - 交互式函数学习工具

一个基于 AI 的交互式函数图像学习工具，帮助学生通过可视化、交互式的方式理解各种函数类型的图像特点。

![函数图像工坊预览](preview.png)

## ✨ 功能特点

### 📚 支持多种函数类型
- **一次函数** `y = ax + b` - 斜率和截距的几何意义
- **二次函数** `y = ax² + bx + c` - 抛物线、顶点、对称轴
- **反比例函数** `y = k/x` - 双曲线、渐近线
- **正弦函数** `y = A·sin(ωx + φ)` - 振幅、周期、相位
- **指数函数** `y = a^x` - 指数增长、衰减

### 🎛️ 交互式参数调节
- 拖动滑块实时观察参数变化对图像的影响
- 自动显示关键点（顶点、截距、交点等）
- 可选的渐近线显示

### 🤖 AI 导师智能答疑
- 针对当前函数智能讲解
- 回答学生关于函数性质的问题
- 提供生活化的例子帮助理解
- 快捷提问功能，快速获取解答

### 🎨 现代化界面
- 深色主题，护眼设计
- 流畅的动画效果
- 响应式布局，支持各种屏幕尺寸

## 🚀 快速开始

### 方式一：直接打开
1. 双击 `index.html` 文件
2. 浏览器会自动打开项目

### 方式二：本地服务器（推荐）
```bash
# 进入项目目录
cd function-plotter

# 启动本地服务器
# Python 3
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 或使用 PHP
php -S localhost:8080
```

然后访问 http://localhost:8080

## 📖 使用指南

### 1. 选择函数类型
从左侧面板点击想要学习的函数类型。

### 2. 调节参数
拖动滑块调整参数值，观察图像实时变化：
- 一次函数：调节斜率 `a` 和截距 `b`
- 二次函数：调节 `a`（开口方向）、`b`、`c`（常数项）
- 反比例函数：调节比例系数 `k`
- 正弦函数：调节振幅 `A`、角频率 `ω`、初相 `φ`
- 指数函数：调节底数 `a`

### 3. 与 AI 对话
在右侧对话框输入问题，例如：
- "为什么二次函数是抛物线？"
- "参数 a 变化会怎样影响图像？"
- "这个函数在实际生活中有什么应用？"

### 4. 使用快捷示例
点击下方的快捷示例按钮，快速加载预设的参数配置。

### 5. 视图控制
- **放大/缩小**：调整坐标轴范围
- **鼠标滚轮**：以鼠标为中心缩放
- **鼠标移动**：查看任意点的坐标值

## 🏗️ 项目结构

```
function-plotter/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   ├── config.js      # 配置文件（API、函数定义等）
│   ├── canvas.js      # Canvas 绘图模块
│   ├── ai-chat.js     # AI 聊天模块
│   └── app.js         # 主应用逻辑
└── README.md          # 项目说明
```

## ⚙️ 配置说明

### API 配置
在 `js/config.js` 中修改：

```javascript
const API_CONFIG = {
    apiKey: 'your-api-key',      // 阿里云通义千问 API Key
    endpoint: 'https://your-endpoint',
    model: 'qwen3-max',
    timeout: 30000
};
```

### 添加新函数类型
在 `js/config.js` 中的 `FUNCTION_TYPES` 对象添加：

```javascript
newFunction: {
    id: 'newFunction',
    name: '新函数',
    formula: 'y = f(x)',
    params: [
        { key: 'a', name: 'a', min: -5, max: 5, step: 0.1, default: 1 }
    ],
    evaluate: (x, params) => params.a * x,
    color: '#颜色代码',
    properties: [
        { icon: '📍', text: '性质描述' }
    ],
    getKeyPoints: (params) => [],
    aiPrompts: {
        intro: '函数介绍...'
    },
    defaultRange: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 }
}
```

## 🎨 自定义主题

在 `css/style.css` 中可以修改：

### 颜色方案
```css
/* 背景渐变 */
body {
    background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
}

/* 函数曲线颜色 */
.linear { --curve-color: #22c55e; }
.quadratic { --curve-color: #ef4444; }
```

### 动画效果
```css
/* 滑块动画 */
.slider::-webkit-slider-thumb {
    background: linear-gradient(135deg, #22d3ee, #a78bfa);
}

/* 曲线绘制动画 */
@keyframes drawCurve {
    from { stroke-dashoffset: 1000; }
    to { stroke-dashoffset: 0; }
}
```

## 📱 响应式设计

项目已优化支持：
- 🖥️ 桌面电脑（1024px+）
- 📱 平板设备（768px - 1024px）
- 📱 手机设备（< 768px）

## 🔧 技术栈

- **HTML5** - 语义化标签
- **CSS3** - 动画、过渡、Flexbox/Grid
- **JavaScript ES6+** - 模块化、箭头函数、Promise
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Canvas 2D** - 高性能图形绑定
- **阿里云通义千问** - AI 对话能力

## 📝 浏览器支持

| 浏览器 | 版本 | 状态 |
|--------|------|------|
| Chrome | 80+ | ✅ 完全支持 |
| Firefox | 75+ | ✅ 完全支持 |
| Safari | 13+ | ✅ 完全支持 |
| Edge | 80+ | ✅ 完全支持 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [通义千问](https://tongyi.aliyun.com/) - AI 能力支持
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - 图形绑定

---

<p align="center">
  Made with ❤️ by <a href="https://github.com">fanfan.ai工作室</a>
</p>

