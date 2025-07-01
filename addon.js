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
