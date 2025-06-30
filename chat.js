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
chatRef.limitToLast(100).on('child_added', snapshot => {
    const { user, text, timestamp } = snapshot.val();
    const time = new Date(timestamp).toLocaleTimeString();
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>${user}</strong> <small>${time}</small><br>${text}`;
    msg.className = `chatmsg`;
    messagesBox.appendChild(msg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
});
