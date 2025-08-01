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
function getLocation() {
    // 3. 使用浏览器的 Geolocation API 获取用户位置
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // 成功回调：latitude 和 longitude 在这里被定义
                const { latitude, longitude } = position.coords;
                
                // 4. 获取成功，在这里处理数据并上传
                // 确保依赖于位置的逻辑都在这个回调函数内
                const userLocation = {
                    latitude: latitude,
                    longitude: longitude,
                    timestamp: firebase.database.ServerValue.TIMESTAMP // 自动生成服务器时间戳
                };

                // 在 'locations' 节点下创建一个新的唯一子节点来存储位置信息
                database.ref("locations").push(userLocation)
                    .then(() => {
                        console.log("位置信息上传成功！");
                        // 假设你有一个 statusElement
                        // statusElement.textContent = "位置上传成功！";
                    })
                    .catch((error) => {
                        console.error("上传位置信息失败: ", error);
                        // statusElement.textContent = "位置上传失败，请检查控制台。";
                    });
            },
            (error) => {
                // 5. 获取位置失败
                console.error("获取地理位置失败:", error);
                let errorMessage = "获取地理位置失败。";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "用户拒绝了位置请求。";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "位置信息不可用。";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "请求超时。";
                        break;
                }
                console.log(errorMessage); // 注意：这里应该是 console.log 而不是 consolelog
            }
        );
    } else {
        // 浏览器不支持地理位置API
        // statusElement.textContent = "你的浏览器不支持地理位置API。";
        console.log("你的浏览器不支持地理位置API。");
    }
    
    // **注意：这里不应再有任何依赖于位置的同步代码**
}

// 调用函数
getLocation();