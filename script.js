// 📁 shared_canvas_fabric.js
// 🎨 使用 Fabric.js 初始化画布
const canvasWidth = 1200;
const canvasHeight = 900;
const MAX_STROKES_TO_KEEP = 200;
let canvasFullySynced = false;
let lastSyncTime = 0;
let isTabActive = true;

const loadedStrokeKeys = new Set();
let latestUpdatedStrokeKey = null;

const fabricCanvas = new fabric.Canvas('canvas', {
    isDrawingMode: true,
    width: canvasWidth,
    height: canvasHeight,
});

// 🧩 Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyCh-lIY-4CVMkQF9VU7PVedHacrxJAmSHk",
    authDomain: "chalkboard-reunion.firebaseapp.com",
    databaseURL: "https://chalkboard-reunion-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chalkboard-reunion",
    storageBucket: "chalkboard-reunion.firebasestorage.app",
    messagingSenderId: "24328206483",
    appId: "1:24328206483:web:cf233ec87c1ac9289f7566",
    measurementId: "G-HBHVPSL761"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const strokesRef = database.ref('drawing/strokes');
const baseImageRef = database.ref('drawing/baseImage');

// 📌 当前状态
let currentTool = 'pencil';
let currentColor = '#000000';
let currentWidth = 4;

// 🎨 工具栏 DOM
const pencilTool = document.getElementById('pencil-tool');
const eraserTool = document.getElementById('eraser-tool');
const brushSize = document.getElementById('brush-size');
const brushSizeDisplay = document.getElementById('brush-size-display');
const colorPicker = document.getElementById('color-picker');
const saveBtn = document.getElementById('save-btn');

// 🎨 工具栏逻辑
function setActiveTool(tool) {
    pencilTool.classList.remove('active');
    eraserTool.classList.remove('active');

    if (tool === 'pencil') {
        pencilTool.classList.add('active');
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.color = currentColor;
        fabricCanvas.freeDrawingBrush.width = currentWidth;
        currentTool = 'pencil';
    } else if (tool === 'eraser') {
        eraserTool.classList.add('active');
        // 模拟橡皮：使用白色或 destination-out（根据需要）
        const eraser = new fabric.PencilBrush(fabricCanvas);
        eraser.color = '#ffffff';
        eraser.width = currentWidth + 4; // 橡皮稍大一点
        fabricCanvas.freeDrawingBrush = eraser;
        currentTool = 'eraser';
    }
}
setActiveTool('pencil'); // 默认选中铅笔工具

pencilTool.addEventListener('click', () => setActiveTool('pencil'));
eraserTool.addEventListener('click', () => setActiveTool('eraser'));

brushSize.addEventListener('input', () => {
    currentWidth = parseInt(brushSize.value);
    fabricCanvas.freeDrawingBrush.width = currentWidth;
    brushSizeDisplay.textContent = currentWidth;
});

colorPicker.addEventListener('input', () => {
    currentColor = colorPicker.value;
    if (currentTool === 'pencil') {
        fabricCanvas.freeDrawingBrush.color = currentColor;
    }
});

// 🎨 色板选择器
const swatches = document.querySelectorAll('.color-swatch');
swatches.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        currentColor = color;
        if (colorPicker) colorPicker.value = color;
        setActiveTool('pencil');
    });
});

// ✍️ 每次绘制完成上传笔迹
fabricCanvas.on('path:created', (e) => {
    const path = e.path;

    // 移除末尾闭合命令（如有）
    const lastSeg = path.path[path.path.length - 1];
    if (lastSeg && lastSeg[0] === 'Z') {
        path.path.pop();
    }

    // 强制设置为线条，不填充
    path.set({
        fill: null,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        selectable: false,
        evented: false,
    });

    // 上传 JSON 数据
    const pathData = path.toObject([
        'path', 'stroke', 'strokeWidth', 'fill',
        'strokeLineCap', 'strokeLineJoin'
    ]);

    strokesRef.push({
        object: pathData,
        timestamp: Date.now(),
        author: userId
    });
});

// 📥 Firebase 实时同步：还原历史笔迹
strokesRef.limitToLast(200).on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!data || !data.object) return;

    loadedStrokeKeys.add(snapshot.key);
    latestUpdatedStrokeKey = snapshot.key;

    fabric.util.enlivenObjects([data.object], (objects) => {
        const path = objects[0];
        path.set({
            selectable: false,
            evented: false,
            fill: null, // 保证不闭合
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
        });
        fabricCanvas.add(path);
    });
});

// ⏳ 每 5 秒上传图像并清空矢量笔迹
function updateBaseImageToFirebase() {
    if (!canvasFullySynced) return;
    if (!isTabActive) return; // 页面非激活状态，禁止上传
    const uploadTime = Date.now();
    if (uploadTime - lastSyncTime < 15000) return; // 初次进入至少等 15 秒
    if (uploadTime - lastSyncTime > 600000) {
        loadBaseImage(); // 超过 10 分钟未同步，重新加载背景图
        return;
    }

    strokesRef.once('value').then(snapshot => {
        let safeToUpload = true;
        snapshot.forEach(child => {
            const data = child.val();
            if (data.author !== userId && !loadedStrokeKeys.has(child.key)) {
                safeToUpload = false;
            }
        });
        if (!safeToUpload) return; // 有未同步 stroke，不上传

        const dataUrl = fabricCanvas.toDataURL('image/png');

        // 上传 baseImage
        baseImageRef.set({
            data: dataUrl,
            timestamp: uploadTime
        });

        // 🔁 清理旧 strokes，只保留最近 MAX_STROKES_TO_KEEP 条
        strokesRef.once('value').then(snapshot => {
            const children = [];
            snapshot.forEach(child => {
                const data = child.val();
                children.push({
                    key: child.key,
                    timestamp: data.timestamp || 0
                });
            });

            // 时间从新到旧排序
            children.sort((a, b) => b.timestamp - a.timestamp);

            // 删除多余部分
            const toDelete = children.slice(MAX_STROKES_TO_KEEP);
            toDelete.forEach(entry => {
                strokesRef.child(entry.key).remove();
            });
        });
    });
}
setInterval(updateBaseImageToFirebase, 20000); // 每 20 秒执行

window.addEventListener('beforeunload', updateBaseImageToFirebase); // 页面关闭时也上传

// 🔄 初次加载 baseImage
function loadBaseImage() {
    baseImageRef.once('value').then(snapshot => {
        const imageData = snapshot.val();
        if (!imageData || !imageData.data) return;
        lastSyncTime = Date.now(); // 更新最后同步时间

        fabric.Image.fromURL(imageData.data, function(img) {
            img.selectable = false;
            fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));

            // ⬇ 加载全部 strokes
            strokesRef.once('value').then(snapshot => {
                const pending = [];
                snapshot.forEach(child => {
                    const data = child.val();
                    if (data && data.object) {
                        pending.push(new Promise(resolve => {
                            fabric.util.enlivenObjects([data.object], (objects) => {
                                const path = objects[0];
                                path.set({ selectable: false, evented: false, fill: null });
                                fabricCanvas.add(path);
                                resolve();
                            });
                        }));
                    }
                });

                // ✅ 所有 strokes 加载完成后，设置同步标志
                Promise.all(pending).then(() => {
                    canvasFullySynced = true;
                });
            });
        });
    });
}
loadBaseImage(); // 页面加载时调用

// 💾 保存按钮：下载 PNG
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = '作品.png';
    link.href = fabricCanvas.toDataURL({ format: 'png' });
    link.click();
});

// 👥 在线用户统计
const presenceRef = database.ref('presence');
const userId = Math.random().toString(36).substring(2, 15);
function goOnline() {
    presenceRef.child(userId).set(true);
    presenceRef.child(userId).onDisconnect().remove();
}
goOnline(); // 初次上线
let previouslyConnected = false;
firebase.database().ref('.info/connected').on('value', (snapshot) => {
    console.log(`Connection status changed: ${snapshot.val()}, previously connected: ${previouslyConnected}`);
    const isConnected = snapshot.val() === true;
    if (isConnected && !previouslyConnected) {
        loadBaseImage(); // 断线 → 联网后重新加载背景图
        goOnline();      // 同时更新 presence
    }
    previouslyConnected = isConnected;
});
presenceRef.on('value', (snapshot) => {
    const count = snapshot.numChildren();
    const counter = document.getElementById('user-count');
    if (counter) counter.textContent = count;
});

// 📐 缩放逻辑保留
function resizeCanvasDisplay() {
    const fatherCanvas = document.getElementById('father-canvas'); // 新的父容器
    const canvasWrapper = fabricCanvas.wrapperEl; // 就是 .canvas-container
    // const container = document.getElementById('canvas-container');
    const containerWidth = fatherCanvas.clientWidth;
    const scale = containerWidth / 1200;

    // 缩放整个画布容器（不是 canvas 本体）
    canvasWrapper.style.transformOrigin = 'top left';
    canvasWrapper.style.transform = `scale(${scale})`;

    // 设置容器尺寸，使其能撑出正确显示区域
    canvasWrapper.style.width = '1200px';
    canvasWrapper.style.height = '900px';

    const visibleHeight = 900 * scale;
    fatherCanvas.style.height = `${visibleHeight}px`;

    const chatPanel = document.getElementById('chat-panel');
    const container = document.getElementById('container');
    chatPanel.style.height = container.clientHeight + 'px';
    // console.log(`${chatPanel}, ${container}`)
    // console.log(`chat panel height set to: ${chatPanel.clientHeight}, ${container.clientHeight}`);
}

window.addEventListener('resize', resizeCanvasDisplay);
resizeCanvasDisplay();

const connectedRef = firebase.database().ref('.info/connected');

connectedRef.on('value', (snap) => {
    const isConnected = snap.val() === true;

    const statusEl = document.getElementById('connection-status-text');
    const statusIndicator = document.getElementById('status-indicator');
    if (statusEl) {
        if (isConnected) {
            statusEl.textContent = '实时同步已连接';
            statusIndicator.style.background = '#4CAF50';
        } else {
            statusEl.textContent = '连接已断开';
            statusIndicator.style.background = 'rgb(240, 149, 115)';
        }
    }
});

document.addEventListener('visibilitychange', () => {
    isTabActive = document.visibilityState === 'visible';
    if (isTabActive) {
        console.log('Tab is active, resuming sync...');
        loadBaseImage(); // 页面恢复后主动同步
    }
});