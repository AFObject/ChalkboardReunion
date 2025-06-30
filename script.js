// 📁 shared_canvas_fixed.js
// 🎨 初始化 Fabric 画布
const canvas = new fabric.Canvas('canvas', {
    isDrawingMode: true,
    backgroundColor: '#ffffff'
});

// 🧩 Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyCh-lIY-4CVMkQF9VU7PVedHacrxJAmSHk",
    authDomain: "chalkboard-reunion.firebaseapp.com",
    databaseURL: "https://chalkboard-reunion-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ 加这一行
    projectId: "chalkboard-reunion",
    storageBucket: "chalkboard-reunion.firebasestorage.app",
    messagingSenderId: "24328206483",
    appId: "1:24328206483:web:cf233ec87c1ac9289f7566",
    measurementId: "G-HBHVPSL761"
};


firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const drawingRef = database.ref('drawing');

// 🖌️ 当前工具状态
let currentTool = 'pencil';
let isSyncing = false; // 防止递归同步

// 📏 初始化画笔
canvas.freeDrawingBrush.color = '#000000';
canvas.freeDrawingBrush.width = 4;

// 🧰 工具按钮
const pencilTool = document.getElementById('pencil-tool');
const eraserTool = document.getElementById('eraser-tool');
const brushSize = document.getElementById('brush-size');
const brushSizeDisplay = document.getElementById('brush-size-display');
const colorPicker = document.getElementById('color-picker');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const inviteBtn = document.getElementById('invite-btn');

function setActiveTool(tool) {
    pencilTool.classList.remove('active');
    eraserTool.classList.remove('active');

    if (tool === 'pencil') {
        pencilTool.classList.add('active');
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = colorPicker.value;
        currentTool = 'pencil';
    } else {
        eraserTool.classList.add('active');
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = '#ffffff';
        currentTool = 'eraser';
    }
}

// 🖱️ 工具栏事件绑定
pencilTool.addEventListener('click', () => setActiveTool('pencil'));
eraserTool.addEventListener('click', () => setActiveTool('eraser'));

brushSize.addEventListener('input', () => {
    const size = brushSize.value;
    brushSizeDisplay.textContent = size;
    canvas.freeDrawingBrush.width = parseInt(size);
});

colorPicker.addEventListener('input', () => {
    if (currentTool === 'pencil') {
        canvas.freeDrawingBrush.color = colorPicker.value;
    }
});

clearBtn.addEventListener('click', () => {
    if (confirm('确定要清除整个画布吗？所有参与者的内容都会被清除！')) {
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        drawingRef.set(JSON.stringify(canvas));
    }
});

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = '黑板重聚-创作作品.png';
    link.href = canvas.toDataURL({ format: 'png', quality: 0.95 });
    link.click();
});

inviteBtn.addEventListener('click', () => {
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({ title: '加入我的共享画板！', text: '来一起在黑板前创作吧！', url })
            .catch(console.error);
    } else {
        navigator.clipboard.writeText(url);
        alert('链接已复制到剪贴板！\n\n' + url);
    }
});

// 🌐 同步：监听 Firebase 更新画布
function syncToFirebase() {
    if (isSyncing) return;
    drawingRef.set(JSON.stringify(canvas));
}

canvas.on('object:added', (e) => {
    if (!isSyncing) syncToFirebase();
});
canvas.on('object:modified', (e) => {
    if (!isSyncing) syncToFirebase();
});
canvas.on('object:removed', (e) => {
    if (!isSyncing) syncToFirebase();
});

drawingRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        isSyncing = true;
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        canvas.loadFromJSON(data, () => {
            canvas.renderAll();
            isSyncing = false;
        });
    }
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

// 📐 画布尺寸自适应
function resizeCanvas() {
    canvas.setDimensions({
        width: Math.min(900, window.innerWidth - 40),
        height: 700
    });
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();