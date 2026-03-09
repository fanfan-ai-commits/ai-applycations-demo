# 阿里云 DashScope API 配置说明

## 获取 API Key

1. 访问阿里云百炼控制台：https://bailian.console.aliyun.com/
2. 登录后进入"API-KEY"管理页面
3. 创建新的 API Key 并复制

## 配置方式

由于前端直接调用API存在安全风险，建议采用以下两种方式之一：

### 方式一：临时测试配置（当前方式）
直接在代码中替换 API Key：
- 打开 `src/components/GamePlayPage.vue`
- 找到第 314 行的 `apiKey` 变量
- 将 `'sk-c51602d13aab444e873e04e5099cedc5'` 替换为你的新 API Key

### 方式二：使用环境变量（推荐）
1. 创建 `.env.local` 文件（不会被提交到 git）
2. 添加以下内容：
```
VITE_DASHSCOPE_API_KEY=你的API Key
VITE_DASHSCOPE_MODEL=qwen-plus-latest
VITE_DASHSCOPE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

## 模型说明

当前使用的模型是 **Qwen-Plus**，这是阿里云通义千问的中等参数模型：
- 优点：性价比高，响应速度快
- 适合：游戏对话、快速决策等场景
- 文档：https://help.aliyun.com/zh/dashscope/

## 计费说明

DashScope API 按 Token 计费，Qwen-Plus 的价格约为：
- 输入：$0.005/1K tokens
- 输出：$0.01/1K tokens

每次游戏调用约消耗 100-200 tokens，成本极低。

