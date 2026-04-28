# 李志 · 档案 / Li Zhi Archive

一个收录李志（Li Zhi）全部公开发行作品的网页播放器。

样张式排版、墨黑铅字、烟草琥珀点缀。把唱片目录当作一份手工编订的小开本看待，而不是流媒体应用。

> **在线**：https://lizhi-player.vercel.app

## 特性

- 24 张专辑、250+ 单曲，按年代陈列
- 「唱片目录 / 档案 / 题记」三栏档案视图
- 搜索（`/` 或 `⌘K` 聚焦，`Esc` 清除），结果高亮匹配字
- 转场动效：黑胶旋转、播放条 EQ、滑入抽屉
- 键盘控制：`Space` 播放/暂停、`←/→` 后退/前进 5s、`⌘+←/→` 上一首/下一首
- 「专注模式」隐藏侧栏与 chrome，只留唱片与曲目
- 移动端适配：左右抽屉、紧凑播放条、圆角图标
- **PWA**：可安装到桌面/主屏幕，支持离线壳缓存

## 技术栈

- React 18（UMD）+ Babel Standalone（运行时编译 JSX，无构建步骤）
- 原生 CSS（`styles/player.css`，paper / ink / amber 配色变量）
- Service Worker（`sw.js`）：壳走 cache-first，封面/字体/CDN 走 stale-while-revalidate，音频不缓存（体积过大）
- 静态站，部署在 Vercel
- 音频与封面流式来自 [`nj-lizhi/song`](https://github.com/nj-lizhi/song) via jsDelivr CDN

## 本地运行

无需安装依赖。在项目根目录起任意静态服务即可：

```bash
python3 -m http.server 8000
# 或
npx serve .
```

打开 `http://localhost:8000`。

> Service Worker 需要 HTTPS 或 `localhost`，`file://` 直接打开 SW 不会注册。

## PWA 安装

- **桌面 Chrome / Edge**：地址栏右侧出现安装图标，点一下即可
- **iOS Safari**：分享 → 添加到主屏幕（iOS 不会主动弹安装提示，必须手动）
- **Android Chrome**：菜单 → 添加到主屏幕

离线时 UI 与已浏览过的封面可继续访问，音频流式播放需要联网。

## 部署

已链接到 Vercel：

```bash
git push origin main   # 自动构建 + 发布到生产
```

## 致谢

本项目站在两位前人的肩膀上：

- **[turkyden/lizhi](https://github.com/turkyden/lizhi)** — 最早的开箱即用李志播放器，证明了「把全档案作为一个网页应用」这件事可行，并梳理出标准化的 URL 索引（`list.js`）
- **[nj-lizhi/song](https://github.com/nj-lizhi/song)**（由 GoldSubmarine 发起）— 全部音频与封面的资源仓库；本项目通过 jsDelivr 直接加载

本仓库只重做了视觉与交互（samizdat 排版、移动端、PWA），数据完全沿用上述资源。

## 免责声明

本档案仅作收藏与欣赏之用。所有音频与封面版权归李志与原始唱片公司所有。如版权方提出移除请求，请通过 Issue 联系。
