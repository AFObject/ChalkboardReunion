// chat.js

// *** 新增的部分 - 开始 ***
const TIEBA_EMOJIS_MAP = {
    "tieba1":"image_emoticon.png",
    "tieba2":"image_emoticon2.png",
    "tieba3":"image_emoticon3.png",
    "tieba4":"image_emoticon4.png",
    "tieba5":"image_emoticon5.png",
    "tieba6":"image_emoticon6.png",
    "tieba7":"image_emoticon7.png",
    "tieba8":"image_emoticon8.png",
    "tieba9":"image_emoticon9.png",
    "tieba10":"image_emoticon10.png",
    "tieba11":"image_emoticon11.png",
    "tieba12":"image_emoticon12.png",
    "tieba13":"image_emoticon13.png",
    "tieba14":"image_emoticon14.png",
    "tieba15":"image_emoticon15.png",
    "tieba16":"image_emoticon16.png",
    "tieba17":"image_emoticon17.png",
    "tieba18":"image_emoticon18.png",
    "tieba19":"image_emoticon19.png",
    "tieba20":"image_emoticon20.png",
    "tieba21":"image_emoticon21.png",
    "tieba22":"image_emoticon22.png",
    "tieba23":"image_emoticon23.png",
    "tieba24":"image_emoticon24.png",
    "tieba25":"image_emoticon25.png",
    "tieba26":"image_emoticon26.png",
    "tieba27":"image_emoticon27.png",
    "tieba28":"image_emoticon28.png",
    "tieba29":"image_emoticon29.png",
    "tieba30":"image_emoticon30.png",
    "tieba31":"image_emoticon31.png",
    "tieba32":"image_emoticon32.png",
    "tieba33":"image_emoticon33.png",
    "tieba34":"image_emoticon34.png",
    "tieba35":"image_emoticon35.png",
    "tieba36":"image_emoticon36.png",
    "tieba37":"image_emoticon37.png",
    "tieba38":"image_emoticon38.png",
    "tieba39":"image_emoticon39.png",
    "tieba40":"image_emoticon40.png",
    "tieba41":"image_emoticon41.png",
    "tieba42":"image_emoticon42.png",
    "tieba43":"image_emoticon43.png",
    "tieba44":"image_emoticon44.png",
    "tieba45":"image_emoticon45.png",
    "tieba46":"image_emoticon46.png",
    "tieba47":"image_emoticon47.png",
    "tieba48":"image_emoticon48.png",
    "tieba49":"image_emoticon49.png",
    "tieba50":"image_emoticon50.png",
    "tieba62":"image_emoticon62.png",
    "tieba63":"image_emoticon63.png",
    "tieba64":"image_emoticon64.png",
    "tieba65":"image_emoticon65.png",
    "tieba66":"image_emoticon66.png",
    "tieba67":"image_emoticon67.png",
    "tieba68":"image_emoticon68.png",
    "tieba69":"image_emoticon69.png",
    "tieba70":"image_emoticon70.png",
    "tieba71":"image_emoticon71.png",
    "tieba72":"image_emoticon72.png",
    "tieba73":"image_emoticon73.png",
    "tieba74":"image_emoticon74.png",
    "tieba75":"image_emoticon75.png",
    "tieba76":"image_emoticon76.png",
    "tieba77":"image_emoticon77.png",
    "tieba78":"image_emoticon78.png",
    "tieba79":"image_emoticon79.png",
    "tieba80":"image_emoticon80.png",
    "tieba81":"image_emoticon81.png",
    "tieba82":"image_emoticon82.png",
    "tieba83":"image_emoticon83.png",
    "tieba84":"image_emoticon84.png",
    "tieba85":"image_emoticon85.png",
    "tieba86":"image_emoticon86.png",
    "tieba87":"image_emoticon87.png",
    "tieba88":"image_emoticon88.png",
    "tieba89":"image_emoticon89.png",
    "tieba90":"image_emoticon90.png",
    "tieba91":"image_emoticon91.png",
    "tieba92":"image_emoticon92.png",
    "tieba93":"image_emoticon93.png",
    "tieba94":"image_emoticon94.png",
    "tieba95":"image_emoticon95.png",
    "tieba96":"image_emoticon96.png",
    "tieba97":"image_emoticon97.png",
    "tieba98":"image_emoticon98.png",
    "tieba99":"image_emoticon99.png",
    "tieba100":"image_emoticon100.png",
    "tieba101":"image_emoticon101.png",
    "tieba102":"image_emoticon102.png",
    "tieba103":"image_emoticon103.png",
    "tieba104":"image_emoticon104.png",
    "tieba105":"image_emoticon105.png",
    "tieba106":"image_emoticon106.png",
    "tieba107":"image_emoticon107.png",
    "tieba108":"image_emoticon108.png",
    "tieba109":"image_emoticon109.png",
    "tieba110":"image_emoticon110.png",
    "tieba111":"image_emoticon111.png",
    "tieba112":"image_emoticon112.png",
    "tieba113":"image_emoticon113.png",
    "tieba114":"image_emoticon114.png",
    "tieba115":"image_emoticon115.png",
    "tieba116":"image_emoticon116.png",
    "tieba117":"image_emoticon117.png",
    "tieba118":"image_emoticon118.png",
    "tieba119":"image_emoticon119.png",
    "tieba120":"image_emoticon120.png",
    "tieba121":"image_emoticon121.png",
    "tieba122":"image_emoticon122.png",
    "tieba123":"image_emoticon123.png",
    "tieba124":"image_emoticon124.png"
};
const EMOJI_PATH = './emojis/';

/**
 * 解析文本中的表情标记并替换为 img 标签
 * @param {string} text 原始消息文本
 * @returns {string} 替换后的 HTML 字符串
 */
function parseTextToEmojis(text) {
    // 使用正则表达式匹配所有形如 [贴吧_xxx] 的标记
    const regex = /\[贴吧_([^\]]+)\]/g;

    return text.replace(regex, (match, emojiName) => {
        const filename = TIEBA_EMOJIS_MAP[emojiName];
        if (filename) {
            // 如果找到了对应的表情，则替换为 img 标签
            return `<img src="${EMOJI_PATH}${filename}" alt="${emojiName}" class="chat-emoji">`;
        } else {
            // 如果没找到（比如用户手动输入了一个不存在的表情名），则原样返回标记
            return match;
        }
    });
}
// *** 新增的部分 - 结束 ***

const chatRef = database.ref('chat/messages');
const usernameInput = document.getElementById('username');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const messagesBox = document.getElementById('message-container');
const messagesBoxContainer = document.getElementById('chat-messages');

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
    const processedText = parseTextToEmojis(text); // 1. 先解析文本
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>${user}</strong> <small>${formattedTime}</small><br>${processedText}`;
    msg.className = `chatmsg`;
    messagesBox.appendChild(msg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    scrollToBottom(messagesBoxContainer);
});

// emoji.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 定义表情映射 ---
    const EMOJI_PATH = './emojis/'; // 表情图片存放的路径
    const EMOJI_TAG_PREFIX = '[贴吧_'; // 标记符号的前缀
    const EMOJI_TAG_SUFFIX = ']';     // 标记符号的后缀

    // --- 2. 获取 DOM 元素 ---
    const emojiToggleBtn = document.getElementById('emoji-toggle-btn');
    const emojiPanel = document.getElementById('emoji-panel');
    const chatInput = document.getElementById('chat-input');

    // --- 3. 动态填充表情面板 ---
    function populateEmojiPanel() {
        for (const [name, filename] of Object.entries(TIEBA_EMOJIS_MAP)) {
            const img = document.createElement('img');
            img.src = `${EMOJI_PATH}${filename}`;
            img.title = name; // 鼠标悬停时显示中文名
            img.className = 'emoji-item';
            
            // 将要插入的标记符存储在 data 属性中
            const emojiTag = `${EMOJI_TAG_PREFIX}${name}${EMOJI_TAG_SUFFIX}`;
            img.dataset.tag = emojiTag;

            // --- 4. 绑定点击事件 ---
            img.addEventListener('click', () => {
                insertEmojiTag(img.dataset.tag);
                emojiPanel.classList.add('hidden'); // 选择后自动关闭面板
            });

            emojiPanel.appendChild(img);
        }
    }

    // --- 5. 实现插入文本到光标处的功能 ---
    function insertEmojiTag(tag) {
        const start = chatInput.selectionStart;
        const end = chatInput.selectionEnd;
        const text = chatInput.value;
        chatInput.value = text.substring(0, start) + tag + text.substring(end);
        chatInput.focus();
        chatInput.selectionStart = chatInput.selectionEnd = start + tag.length;
    }

    // --- 6. 绑定按钮点击事件，切换面板显示/隐藏 ---
    emojiToggleBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡，避免触发下面的 document 点击
        emojiPanel.classList.toggle('hidden');
        if (!emojiPanel.classList.contains('hidden')) {
            scrollToBottom(messagesBoxContainer); // 确保面板打开时滚动到底部
        }
    });

    // --- 7. 点击页面其他地方关闭表情面板 ---
    document.addEventListener('click', (event) => {
        if (!emojiPanel.contains(event.target) && event.target !== emojiToggleBtn) {
            emojiPanel.classList.add('hidden');
        }
    });

    // 初始化
    populateEmojiPanel();
});

function scrollToBottom(element) {
    // console.log("滚动到底部的元素：", element);
    if (element) {
        element.scrollTop = element.scrollHeight;
    } else {
        console.warn("未找到指定的元素，无法滚动到底部。");
    }
}