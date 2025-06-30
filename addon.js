function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
}

setInterval(updateClock, 1000);
updateClock(); // 初始调用


const avatar = document.getElementById('avatar');

// 👨‍🏫 头像 URL 列表（你可以换成自己的图片路径）
const avatars = [
    './avatars/djq.png',
    './avatars/zqf.png'
];

function updateAvatar() {
    const index = Math.floor(Math.random() * avatars.length);
    avatar.src = avatars[index];
}

// updateAvatar(); // 初始显示
// setTimeout(() =>{
//     document.getElementById('podium-wrapper').style.opacity = '0';
// }, 1000);

const swatches = document.querySelectorAll('.color-swatch');

swatches.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.dataset.color;

        // 设置画笔颜色
        canvas.freeDrawingBrush.color = color;

        // 更新颜色选择器（如果你保留原来的 input）
        if (colorPicker) colorPicker.value = color;

        // 设置当前工具状态
        currentTool = 'pencil';
        canvas.freeDrawingBrush.color = color;

        // 激活笔刷工具按钮（可选）
        setActiveTool('pencil');

        // 高亮当前色块
        swatches.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
