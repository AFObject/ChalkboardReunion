// 📁 shared_canvas_fixed.js
// 🎨 初始化原生 Canvas 替代 Fabric
const canvasEl = document.getElementById('canvas');
const ctx = canvasEl.getContext('2d');
const canvasWidth = 1200;
const canvasHeight = 900;
canvasEl.width = canvasWidth;
canvasEl.height = canvasHeight;

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
let drawing = false;
let currentTool = 'pencil';
let currentColor = '#000000';
let currentWidth = 4;
let lastX = 0;
let lastY = 0;
let strokeBuffer = [];

const pencilTool = document.getElementById('pencil-tool');
const eraserTool = document.getElementById('eraser-tool');
const brushSize = document.getElementById('brush-size');
const brushSizeDisplay = document.getElementById('brush-size-display');
const colorPicker = document.getElementById('color-picker');
const saveBtn = document.getElementById('save-btn');

function setActiveTool(tool) {
    pencilTool.classList.remove('active');
    eraserTool.classList.remove('active');

    if (tool === 'pencil') {
        pencilTool.classList.add('active');
        currentTool = 'pencil';
    } else if (tool === 'eraser') {
        eraserTool.classList.add('active');
        currentTool = 'eraser';
    }
}

pencilTool.addEventListener('click', () => setActiveTool('pencil'));
eraserTool.addEventListener('click', () => setActiveTool('eraser'));

brushSize.addEventListener('input', () => {
    currentWidth = parseInt(brushSize.value);
    brushSizeDisplay.textContent = currentWidth;
});

colorPicker.addEventListener('input', () => {
    currentColor = colorPicker.value;
});

canvasEl.addEventListener('mousedown', (e) => {
    drawing = true;
    const rect = canvasEl.getBoundingClientRect();
    lastX = (e.clientX - rect.left) * (canvasWidth / rect.width);
    lastY = (e.clientY - rect.top) * (canvasHeight / rect.height);
    strokeBuffer = [[lastX, lastY]];
});

canvasEl.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const rect = canvasEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasWidth / rect.width);
    const y = (e.clientY - rect.top) * (canvasHeight / rect.height);
    ctx.beginPath();
    ctx.lineWidth = currentWidth;
    ctx.lineCap = 'round';

    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
    }

    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
    strokeBuffer.push([x, y]);
});

canvasEl.addEventListener('mouseup', () => {
    drawing = false;
    if (strokeBuffer.length > 1) {
        const strokeData = {
            tool: currentTool,
            color: currentColor,
            width: currentWidth,
            points: strokeBuffer,
            timestamp: Date.now()
        };
        strokesRef.push(strokeData);
    }
});

strokesRef.limitToLast(200).on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!data || !data.points) return;
    ctx.beginPath();
    ctx.lineWidth = data.width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = data.tool === 'eraser' ? 'rgba(0,0,0,1)' : data.color;
    ctx.globalCompositeOperation = data.tool === 'eraser' ? 'destination-out' : 'source-over';
    const [first, ...rest] = data.points;
    ctx.moveTo(first[0], first[1]);
    for (let [x, y] of rest) ctx.lineTo(x, y);
    ctx.stroke();
});

setInterval(() => {
    const dataUrl = canvasEl.toDataURL('image/png');
    baseImageRef.set(dataUrl).then(() => {
        strokesRef.remove(); // ✅ 只在上传成功后清除笔迹
    });
}, 5000);

baseImageRef.once('value').then(snapshot => {
    const url = snapshot.val();
    if (!url) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = url;
});

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = '黑板重聚-创作作品.png';
    link.href = canvasEl.toDataURL('image/png');
    link.click();
});

// 👥 在线用户统计
const presenceRef = database.ref('presence');
const userId = Math.random().toString(36).substring(2, 15);
presenceRef.child(userId).set(true);
presenceRef.child(userId).onDisconnect().remove();
presenceRef.on('value', (snapshot) => {
    const count = snapshot.numChildren();
    const counter = document.getElementById('user-count');
    if (counter) counter.textContent = count;
});

// 📐 缩放逻辑保留
function resizeCanvasDisplay() {
    const fatherCanvas = document.getElementById('father-canvas');

    const containerWidth = fatherCanvas.clientWidth;
    const scale = containerWidth / canvasWidth;

    canvasEl.style.transformOrigin = 'top left';
    canvasEl.style.transform = `scale(${scale})`;

    // 保持逻辑大小不变，设置宽度高度供缩放使用
    canvasEl.style.width = `${canvasWidth}px`;
    canvasEl.style.height = `${canvasHeight}px`;
}

window.addEventListener('resize', resizeCanvasDisplay);
resizeCanvasDisplay();
