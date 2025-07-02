# ChalkboardReunion 赛博黑板！ - 多人协作画板

![](https://p.ipic.vip/hhi7ua.png)

（以下内容为 AI 生成）

基于 Javascript、HTML、CSS 的简易实时多人协作画板网站，用户可以在共享画布上实时绘画、聊天，共同创作艺术作品。

Designed for 2610 的同学们，欢迎在暑假延续黑板上创作的传统！

## 功能特点

- 🎨 **实时协作绘画**：多人同时在同一画布上创作
- ✏️ **多种工具**：画笔、橡皮擦、颜色选择
- 💬 **聊天功能 - ガセウ**：与其他创作者实时交流
- 📱 **响应式设计**：基于网页，适配各种设备
- 🌐 **实时同步**：所有操作即时同步给所有参与者

## 技术栈

- **前端**: HTML5 Canvas, Fabric.js, JavaScript (ES6+)
- **后端**: Firebase Realtime Database
- **部署**: Vercel
- **UI 框架**: 纯 CSS（无外部框架）
- **实时通信**: WebSockets (通过 Firebase 实现)

## 运作原理

云端保存一张画布底图（1200×900）以及最近新加入的笔画，定期合并。

## 贡献指南

欢迎贡献（提交 Issue 或 Pull Request）！

## 致谢

- [Fabric.js](http://fabricjs.com/) - 强大的 Canvas 库
- [Firebase](https://firebase.google.com/) - 实时数据库服务
- [Vercel](https://vercel.com/) - 无服务器部署平台

---

**ChalkboardReunion** © 2025 - 让创意跨越距离