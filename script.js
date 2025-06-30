
// 初始化Canvas
const canvas = new fabric.Canvas('canvas', {
    isDrawingMode: true,
    backgroundColor: '#1a1f2b'
});

// 设置初始画笔
canvas.freeDrawingBrush.color = '#FF0000';
canvas.freeDrawingBrush.width = 5;
canvas.freeDrawingBrush.shadow = new fabric.Shadow({
    blur: 3,
    offsetX: 0,
    offsetY: 0,
    color: 'rgba(0,0,0,0.5)'
});

// DOM元素
const pencilTool = document.getElementById('pencil-tool');
const eraserTool = document.getElementById('eraser-tool');
const brushSize = document.getElementById('brush-size');
const brushSizeDisplay = document.getElementById('brush-size-display');
const colorPicker = document.getElementById('color-picker');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const inviteBtn = document.getElementById('invite-btn');

// 工具状态
let currentTool = 'pencil';

// 初始化工具按钮状态
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
        canvas.freeDrawingBrush.color = '#1a1f2b';
        currentTool = 'eraser';
    }
}

// 事件监听
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
        canvas.backgroundColor = '#1a1f2b';

        // 添加清除提示
        const text = new fabric.Text('画布已清除，重新开始创作吧！', {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fontSize: 24,
            fill: '#ffd700',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            shadow: 'rgba(0,0,0,0.8) 2px 2px 4px'
        });

        canvas.add(text);
        setTimeout(() => canvas.remove(text), 3000);
    }
});

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = '黑板重聚-创作作品.png';
    link.href = canvas.toDataURL({
        format: 'png',
        quality: 0.95
    });
    link.click();
});

inviteBtn.addEventListener('click', () => {
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({
            title: '加入我的共享画板！',
            text: '来一起在黑板前创作吧！',
            url: url
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(url);
        alert('链接已复制到剪贴板！\n\n' + url);
    }
});

// 添加初始欢迎信息
setTimeout(() => {
    const welcomeText = new fabric.Text('欢迎来到黑板重聚！', {
        left: canvas.width / 2,
        top: canvas.height / 2 - 40,
        fontSize: 36,
        fill: '#ffd700',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        fontFamily: 'Arial',
        shadow: 'rgba(0,0,0,0.8) 3px 3px 6px'
    });

    const instructionText = new fabric.Text('选择工具开始创作或邀请朋友加入', {
        left: canvas.width / 2,
        top: canvas.height / 2 + 20,
        fontSize: 24,
        fill: '#4ecdc4',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        shadow: 'rgba(0,0,0,0.8) 2px 2px 4px'
    });

    canvas.add(welcomeText, instructionText);

    // 5秒后淡出
    setTimeout(() => {
        welcomeText.animate('opacity', 0, {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: () => canvas.remove(welcomeText)
        });

        instructionText.animate('opacity', 0, {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: () => canvas.remove(instructionText)
        });
    }, 5000);
}, 1000);

// 添加一些初始涂鸦作为示例
setTimeout(() => {
    const circle = new fabric.Circle({
        radius: 40,
        fill: '#FF6384',
        left: 150,
        top: 120,
        stroke: '#fff',
        strokeWidth: 2,
        shadow: 'rgba(0,0,0,0.5) 3px 3px 8px'
    });

    const heart = new fabric.Text('❤️', {
        left: 250,
        top: 100,
        fontSize: 60,
        shadow: 'rgba(0,0,0,0.5) 2px 2px 6px'
    });

    const text = new fabric.Text('一起创作吧!', {
        left: 400,
        top: 130,
        fontSize: 32,
        fill: '#36A2EB',
        fontFamily: 'Comic Sans MS',
        shadow: 'rgba(0,0,0,0.5) 2px 2px 5px'
    });

    canvas.add(circle, heart, text);
}, 7000);

// 窗口大小调整处理
window.addEventListener('resize', () => {
    canvas.setDimensions({
        width: Math.min(900, window.innerWidth - 40),
        height: 500
    });
});

// 初始化画布尺寸
window.dispatchEvent(new Event('resize'));