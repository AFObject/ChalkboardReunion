const chatRef = database.ref('chat/messages');
const usernameInput = document.getElementById('username');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const messagesBox = document.getElementById('chat-messages');

// 监听发送按钮
sendBtn.addEventListener('click', () => {
    const user = usernameInput.value.trim();
    const text = chatInput.value.trim();
    if (!user || user.length > 20) {
        alert('请输入 1-20 字符的用户名');
        return;
    }
    if (!text) return;

    const message = {
        user,
        text,
        timestamp: Date.now()
    };

    chatRef.push(message);
    chatInput.value = '';
});

// 监听新消息
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
}

// 使用示例 
chatRef.limitToLast(100).on('child_added', snapshot => {
    const { user, text, timestamp } = snapshot.val();
    const formattedTime = formatTime(timestamp); 
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>${user}</strong> <small>${formattedTime}</small><br>${text}`;
    msg.className = `chatmsg`;
    messagesBox.appendChild(msg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
});
