document.addEventListener('DOMContentLoaded', () => {
    const homeButton = document.getElementById('homeButton');
    const loginButton = document.getElementById('loginButton');
    const newChatButton = document.getElementById('newChatButton');
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const responseText = document.getElementById('responseText');
    const userQuestion = document.getElementById('userQuestion');
    const userAvatar = document.querySelector('.user-avatar img'); // 获取用户头像元素
    const conversationContainer = document.querySelector('.conversation-container'); // 聊天容器

    // 用于存储聊天历史的数组
    let chatHistory = [];

    // 聊天状态存储的键
    const CHAT_STATE_KEY = 'chatState';
    const USER_AVATAR_KEY = 'userAvatarPath'; // 保存用户头像路径的键
    const NAV_STATE_KEY = 'navigationState'; // 导航状态的键
    const LAST_PAGE_KEY = 'lastPageVisited'; // 上一个访问页面的键

    // 控制API请求的变量
    let currentApiController = null; // 当前API请求的AbortController
    let isRequestPending = false; // 是否有请求正在进行中
    let lastStoppedPrompt = null; // 保存被中断的请求的提示文本
    let isContinueMode = false; // 是否处于继续回复模式

    // 记录当前页面为聊天页面
    try {
        localStorage.setItem(LAST_PAGE_KEY, 'chat');
    } catch (e) {
        console.error('Error setting last page visited:', e);
    }

    // 监听页面离开事件
    window.addEventListener('beforeunload', () => {
        // 当用户离开页面时，我们不能确定他是使用浏览器后退按钮还是关闭网站
        // 为了处理后退按钮的情况，我们设置一个标志并包含时间戳
        try {
            localStorage.setItem(NAV_STATE_KEY, `from_browser_back:${Date.now()}`);
        } catch (e) {
            console.error('Error setting navigation state on page unload:', e);
        }
    });

    // 检查导航状态，确定是否需要更换头像
    function checkNavigationState() {
        try {
            const navState = localStorage.getItem(NAV_STATE_KEY);

            // 如果存在导航状态
            if (navState) {
                // 如果是从"Home"按钮返回的
                if (navState === 'from_home') {
                    // 重置导航状态
                    localStorage.removeItem(NAV_STATE_KEY);
                    // 随机设置新头像
                    setRandomUserAvatar();
                    return true;
                }
                // 如果是从浏览器后退按钮返回的
                else if (navState.startsWith('from_browser_back:')) {
                    const timestamp = parseInt(navState.split(':')[1], 10);
                    const currentTime = Date.now();
                    const timeDifference = currentTime - timestamp;

                    // 如果时间差小于60秒，认为是从首页通过后退按钮返回的
                    // 并且上一个页面是首页（通过lastPageVisited检查）
                    if (timeDifference < 60000 && localStorage.getItem(LAST_PAGE_KEY) === 'index') {
                        console.log('User returned from home page using browser back button');
                        localStorage.removeItem(NAV_STATE_KEY);
                        setRandomUserAvatar();
                        return true;
                    } else {
                        // 超过时间限制或不是从首页返回，清除导航状态
                        localStorage.removeItem(NAV_STATE_KEY);
                    }
                }
            }
        } catch (e) {
            console.error('Error checking navigation state:', e);
        }
        return false;
    }

    // 随机选择用户头像
    function setRandomUserAvatar() {
        // 头像总数量为20个，从user1.png到user20.png
        const avatarCount = 20;
        const randomNumber = Math.floor(Math.random() * avatarCount) + 1;
        const avatarPath = `assets/images/avatar/user${randomNumber}.png`;

        if (userAvatar) {
            userAvatar.src = avatarPath;
            console.log(`Random avatar set: ${avatarPath}`);

            // 保存用户头像路径到sessionStorage
            try {
                sessionStorage.setItem(USER_AVATAR_KEY, avatarPath);
            } catch (e) {
                console.error('Error saving user avatar path:', e);
            }
        }
    }

    // 尝试从sessionStorage获取用户头像路径
    function loadUserAvatar() {
        try {
            const savedAvatarPath = sessionStorage.getItem(USER_AVATAR_KEY);
            if (savedAvatarPath && userAvatar) {
                userAvatar.src = savedAvatarPath;
                console.log(`Loaded saved avatar: ${savedAvatarPath}`);
                return true;
            }
        } catch (e) {
            console.error('Error loading user avatar path:', e);
        }
        return false;
    }

    // 页面加载时设置头像（优先检查导航状态，然后使用保存的头像，没有则随机设置）
    if (checkNavigationState()) {
        console.log('User came from home page, avatar changed');
    } else if (!loadUserAvatar()) {
        setRandomUserAvatar();
    }

    // 辅助函数：找到具有特定类名的父元素
    function findParentWithClass(element, className) {
        let parent = element.parentElement;
        while (parent) {
            if (parent.classList.contains(className)) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }

    // 将新消息添加到聊天显示区域
    function appendMessageToDisplay(text, messageType, avatarSrc) {
        // 检查最后一条消息的类型
        const allMessages = conversationContainer.querySelectorAll('.message-wrapper');
        const lastMessage = allMessages.length > 0 ? allMessages[allMessages.length - 1] : null;

        // 如果要添加新的用户消息，检查是否需要清理
        if (messageType === 'user') {
            // 先移除可能存在的加载中的消息
            const loadingMessages = conversationContainer.querySelectorAll('.message-content .api-placeholder');
            loadingMessages.forEach(placeholder => {
                const wrapper = findParentWithClass(placeholder, 'message-wrapper');
                if (wrapper) {
                    conversationContainer.removeChild(wrapper);
                }
            });

            // 检查最后一条消息是否为用户消息
            // 如果是，则移除它，以避免用户消息堆叠
            if (lastMessage && lastMessage.classList.contains('user-message-wrapper')) {
                conversationContainer.removeChild(lastMessage);
            }
        }

        // 创建消息包装器
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message-wrapper ${messageType}-message-wrapper`;

        // 创建头像容器
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `${messageType}-avatar`;

        // 创建头像图片
        const avatarImg = document.createElement('img');
        avatarImg.src = avatarSrc;
        avatarImg.alt = messageType === 'user' ? 'User Avatar' : 'AI Avatar';
        avatarDiv.appendChild(avatarImg);

        // 创建消息容器
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageType}-message`;

        // 创建消息内容容器
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // 确保文本格式化正确
        if (messageType === 'ai') {
            // 对AI回复进行格式化处理
            contentDiv.innerHTML = formatAIResponse(text);
        } else {
            // 用户消息可以直接使用，但要确保安全处理
            contentDiv.textContent = text;
        }

        // 组装消息
        messageDiv.appendChild(contentDiv);
        messageWrapper.appendChild(avatarDiv);
        messageWrapper.appendChild(messageDiv);

        // 添加到聊天容器
        conversationContainer.appendChild(messageWrapper);

        // 滚动到最新消息
        scrollToBottom();

        // 返回内容容器，以便后续可以更新内容
        return contentDiv;
    }

    // 更稳定的滚动到底部函数，恢复简单版本但提高可靠性
    function scrollToBottom() {
        if (conversationContainer) {
            // 立即执行一次滚动
            conversationContainer.scrollTop = conversationContainer.scrollHeight;

            // 再次延迟执行一次滚动，确保内容渲染完成后滚动生效
            setTimeout(() => {
                conversationContainer.scrollTop = conversationContainer.scrollHeight;
            }, 100);
        }
    }

    // 从URL获取查询参数
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('query');

    // 检查URL中是否有新卡片的标记
    const isNewCardNavigation = !!queryParam; // 如果有query参数，认为是从卡片点击跳转的

    // 添加一个新变量用于保存上次访问的URL query
    let lastUrlQuery = '';

    // 清空聊天容器，移除默认的消息结构
    if (conversationContainer) {
        console.log('Clearing conversation container at start');
        conversationContainer.innerHTML = '';
    }

    // 尝试从sessionStorage获取上次访问的URL query
    try {
        lastUrlQuery = sessionStorage.getItem('lastUrlQuery') || '';
    } catch (e) {
        console.error('Error reading lastUrlQuery:', e);
    }

    // 检查当前query是否与上次的相同
    const isSameQuery = queryParam === lastUrlQuery;
    console.log('Current query:', queryParam, 'Last query:', lastUrlQuery, 'Is same query:', isSameQuery);

    // 如果有新的query参数且与上次不同，则清除历史，优先处理新卡片内容
    if (isNewCardNavigation && !isSameQuery) {
        console.log('New card navigation detected, clearing previous chat history');
        // 清除聊天历史
        chatHistory = [];
        // 保存新的URL query
        try {
            sessionStorage.setItem('lastUrlQuery', queryParam || '');
        } catch (e) {
            console.error('Error saving lastUrlQuery:', e);
        }
        // 清除旧的聊天状态
        try {
            sessionStorage.removeItem(CHAT_STATE_KEY);
        } catch (e) {
            console.error('Error removing chat state:', e);
        }
    }

    // 尝试加载已保存的聊天状态
    const stateLoaded = loadChatState();

    // 根据是否加载了状态以及是否存在 queryParam 来决定如何初始化页面
    if ((!stateLoaded && queryParam) || (isNewCardNavigation && !isSameQuery)) {
        // 情况1: 没有从 sessionStorage 加载状态，但 URL 中有 queryParam
        // 或者这是一个新的卡片导航（与上次不同）
        // 这通常是用户通过卡片链接第一次访问 chat.html 或重新访问不同卡片
        console.log('Initializing from queryParam:', queryParam);

        // 添加用户问题到聊天历史和显示
        const userAvatarSrc = userAvatar ? userAvatar.src : 'assets/images/user.png';
        appendMessageToDisplay(queryParam, 'user', userAvatarSrc);
        chatHistory.push({
            type: 'user',
            text: queryParam,
            avatar: userAvatarSrc,
            timestamp: new Date().toISOString()
        });

        // 更新页面标题
        let shortTitle = queryParam.length > 50 ? queryParam.substring(0, 50) + "..." : queryParam;
        document.title = `${shortTitle} - GPT4.1 Free AI Assistant`;

        // 添加AI响应加载中的消息
        const aiAvatarSrc = 'assets/images/chatgpt.png';
        const aiResponseElement = appendMessageToDisplay(
            '<p class="api-placeholder">Loading response...</p>',
            'ai',
            aiAvatarSrc
        );

        // 调用API
        updateSendButtonState(true);
        callGPT41Api(queryParam)
            .then(result => {
                updateSendButtonState(false);
                if (result.success === false) {
                    const errorMessage = `<div class="error-message">
                        <p>Sorry, an error occurred: ${result.error}</p>
                    </div>`;
                    aiResponseElement.innerHTML = errorMessage;

                    // 将错误消息添加到聊天历史
                    chatHistory.push({
                        type: 'ai',
                        text: errorMessage,
                        avatar: aiAvatarSrc,
                        timestamp: new Date().toISOString(),
                        isError: true
                    });
                } else {
                    // 获取原始响应文本
                    const rawResponse = result.data?.text || 'Sorry, could not get a response';

                    // 显示格式化的响应
                    const formattedResponse = formatAIResponse(rawResponse);
                    aiResponseElement.innerHTML = formattedResponse;

                    // 将AI原始文本回复添加到聊天历史（这样在恢复时可以正确格式化）
                    chatHistory.push({
                        type: 'ai',
                        text: rawResponse, // 存储原始文本而非格式化后的HTML
                        avatar: aiAvatarSrc,
                        timestamp: new Date().toISOString()
                    });
                }
                saveChatState(); // 保存聊天状态
            })
            .catch(error => {
                let errorMessage;

                if (error.name === 'AbortError') {
                    console.log('API request was aborted');
                    errorMessage = '<p class="api-placeholder">Response generation stopped</p>';
                    // 设置为继续模式
                    updateSendButtonState(false, true);
                } else {
                    console.error('Error processing message:', error);
                    errorMessage = `<div class="error-message">
                        <p>Error connecting to server. Please try again later.</p>
                    </div>`;
                    // 普通错误，恢复为发送模式
                    updateSendButtonState(false);
                }

                aiResponseElement.innerHTML = errorMessage;

                // 将错误信息添加到聊天历史
                chatHistory.push({
                    type: 'ai',
                    text: errorMessage,
                    avatar: aiAvatarSrc,
                    timestamp: new Date().toISOString(),
                    isError: true
                });

                saveChatState(); // 保存聊天状态
            });
    } else if (stateLoaded) {
        // 情况2: 成功从 sessionStorage 加载了状态
        // 用户刷新了页面，显示从 loadChatState 加载的聊天历史。
        console.log('Chat state loaded from session storage. queryParam (if any) was ignored.');

        // 确保输入框焦点
        setTimeout(() => {
            if (userInput && document.activeElement !== userInput) {
                userInput.focus();
            }
        }, 100);
    } else {
        // 情况3: 没有加载到 sessionStorage 状态，并且 URL 中也没有 queryParam
        // 或者加载的状态中没有消息。
        // 例如直接访问 chat.html，或者 sessionStorage 被清除。
        console.log('No session state and no queryParam. Displaying empty chat.');

        // 如果是通过主页直接进入聊天页面，可以显示欢迎消息（可选）
        if (!queryParam) {
            const aiAvatarSrc = 'assets/images/chatgpt.png';
            const welcomeMessage = '<p>Welcome to GPT4.1 AI Assistant, please type your question below.</p>';
            appendMessageToDisplay(welcomeMessage, 'ai', aiAvatarSrc);

            // 将欢迎消息添加到聊天历史
            chatHistory.push({
                type: 'ai',
                text: welcomeMessage,
                avatar: aiAvatarSrc,
                timestamp: new Date().toISOString()
            });

            // 保存欢迎状态
            saveChatState();
        }
    }

    // 函数：处理textarea自动调整大小
    function autoResizeTextarea() {
        if (!userInput) return; // 增加一个卫语句，确保 userInput 存在
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 85) + 'px'; // 限制最大高度为85px，与index页面一致
    }

    // 初始设置
    if (userInput) {
        userInput.addEventListener('input', autoResizeTextarea);

        // 只有在没有从 sessionStorage 加载状态时，才需要对空的 textarea 进行初始调整和聚焦
        // 如果 stateLoaded 为 true，loadChatState 已经处理了 userInput.value, resize (via dispatchEvent) 和上面的聚焦逻辑
        if (!stateLoaded) {
            setTimeout(autoResizeTextarea, 0); // 对空的输入框进行初始高度调整
            setTimeout(() => {
                if (document.activeElement !== userInput) { // 避免不必要的焦点切换
                    userInput.focus();
                }
            }, 500); // 原始的聚焦延迟
        }
    }

    // 返回主页
    if (homeButton) {
        homeButton.addEventListener('click', () => {
            // 设置导航状态，表示用户正在前往首页
            try {
                localStorage.setItem(NAV_STATE_KEY, 'from_home');
                localStorage.setItem(LAST_PAGE_KEY, 'index'); // 记录用户将要访问的页面为首页
                console.log('Setting navigation state: from_home');
            } catch (e) {
                console.error('Error setting navigation state:', e);
            }

            window.location.href = 'index.html';
        });
    }

    // 处理新对话按钮
    if (newChatButton) {
        newChatButton.addEventListener('click', () => {
            clearChat();
        });
    }

    // 清除当前对话，开始新对话
    function clearChat() {
        // 停止任何进行中的API请求
        if (isRequestPending) {
            stopApiRequest();
        }

        // 清空聊天历史
        chatHistory = [];

        // 清空聊天显示区域
        if (conversationContainer) {
            conversationContainer.innerHTML = '';
        }

        // 清空输入框
        if (userInput) {
            userInput.value = '';
            autoResizeTextarea();
        }

        // 重置页面标题
        document.title = 'GPT4.1 Free AI Assistant (No Login Required)';

        // 显示欢迎消息 - 使用已有的头像，不更改头像
        const aiAvatarSrc = 'assets/images/chatgpt.png';
        const welcomeMessage = '<p>Welcome to GPT4.1 AI Assistant, please type your question below.</p>';
        appendMessageToDisplay(welcomeMessage, 'ai', aiAvatarSrc);

        // 将欢迎消息添加到聊天历史
        chatHistory.push({
            type: 'ai',
            text: welcomeMessage,
            avatar: aiAvatarSrc,
            timestamp: new Date().toISOString()
        });

        // 清除URL中的query参数，但不刷新页面
        if (window.history && window.history.replaceState) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }

        // 清除sessionStorage中的聊天状态
        try {
            sessionStorage.removeItem(CHAT_STATE_KEY);
            sessionStorage.removeItem('lastUrlQuery');
            // 注意：我们不移除USER_AVATAR_KEY，以保持头像不变
        } catch (e) {
            console.error('Error removing chat state:', e);
        }

        // 保存新的欢迎状态
        saveChatState();

        // 聚焦到输入框
        if (userInput) {
            userInput.focus();
        }

        console.log('Chat cleared, new conversation started (avatar unchanged)');
    }

    // 登录按钮点击事件已在login-modal.js中处理
    // 这里不再添加额外的点击事件处理

    // 处理发送/停止/继续按钮
    if (sendButton && userInput) {
        sendButton.addEventListener('click', () => {
            if (isRequestPending) {
                // 如果正在请求中，点击按钮应该停止请求
                stopApiRequest();
            } else if (isContinueMode && lastStoppedPrompt) {
                // 如果处于继续模式，且有上次中断的提示，则继续生成回复
                console.log('Continuing response for prompt:', lastStoppedPrompt);

                // 移除最后一条AI消息中的"已停止"提示
                const aiMessages = conversationContainer.querySelectorAll('.ai-message-wrapper');
                if (aiMessages.length > 0) {
                    const lastAiMessage = aiMessages[aiMessages.length - 1];
                    const contentDiv = lastAiMessage.querySelector('.message-content');
                    if (contentDiv && contentDiv.innerHTML.includes('Response generation stopped')) {
                        // 替换为加载中提示
                        contentDiv.innerHTML = '<p class="api-placeholder">Continuing response...</p>';

                        // 从聊天历史中移除最后一条AI消息
                        if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].type === 'ai') {
                            chatHistory.pop();
                        }

                        // 调用API继续生成回复
                        updateSendButtonState(true);
                        callGPT41Api(lastStoppedPrompt)
                            .then(result => {
                                updateSendButtonState(false);

                                if (result.success === false) {
                                    const errorMessage = `<div class="error-message">
                                        <p>Sorry, an error occurred: ${result.error}</p>
                                    </div>`;
                                    contentDiv.innerHTML = errorMessage;

                                    chatHistory.push({
                                        type: 'ai',
                                        text: errorMessage,
                                        avatar: 'assets/images/chatgpt.png',
                                        timestamp: new Date().toISOString(),
                                        isError: true
                                    });
                                } else {
                                    // 获取原始响应文本
                                    const rawResponse = result.data?.text || 'Sorry, could not get a response';

                                    // 显示格式化的响应
                                    const formattedResponse = formatAIResponse(rawResponse);
                                    contentDiv.innerHTML = formattedResponse;

                                    // 将AI原始文本回复添加到聊天历史
                                    chatHistory.push({
                                        type: 'ai',
                                        text: rawResponse,
                                        avatar: 'assets/images/chatgpt.png',
                                        timestamp: new Date().toISOString()
                                    });
                                }

                                // 重置继续模式和上次中断的提示
                                isContinueMode = false;
                                lastStoppedPrompt = null;

                                // 保存聊天状态
                                saveChatState();

                                // 滚动到底部
                                setTimeout(scrollToBottom, 100);
                            })
                            .catch(error => {
                                updateSendButtonState(false);
                                let errorMessage;

                                if (error.name === 'AbortError') {
                                    console.log('API request was aborted again');
                                    errorMessage = '<p class="api-placeholder">Response generation stopped again</p>';
                                } else {
                                    console.error('Error processing message:', error);
                                    errorMessage = `<div class="error-message">
                                        <p>Error connecting to server. Please try again later.</p>
                                    </div>`;
                                }

                                contentDiv.innerHTML = errorMessage;

                                // 将错误信息添加到聊天历史
                                chatHistory.push({
                                    type: 'ai',
                                    text: errorMessage,
                                    avatar: 'assets/images/chatgpt.png',
                                    timestamp: new Date().toISOString(),
                                    isError: true
                                });

                                // 保存聊天状态
                                saveChatState();
                            });
                    }
                }
            } else {
                // 正常发送新消息
                const message = userInput.value.trim();
                if (message) {
                    handleNewUserInput(message);
                    userInput.value = '';  // 清空输入框
                    autoResizeTextarea();  // 调整输入框大小
                }
            }
        });

        userInput.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'Enter') {
                event.preventDefault();
                if (isRequestPending) {
                    // 如果正在请求中，Ctrl+Enter 也应该停止请求
                    stopApiRequest();
                } else if (isContinueMode && lastStoppedPrompt) {
                    // 触发点击事件，复用继续生成的逻辑
                    sendButton.click();
                } else {
                    // 使用新的处理函数
                    const message = userInput.value.trim();
                    if (message) {
                        handleNewUserInput(message);
                        userInput.value = '';  // 清空输入框
                        autoResizeTextarea();  // 调整输入框大小
                    }
                }
            }
        });
    }

    // 函数：发送后续消息
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            // 获取用户头像路径
            const userAvatarSrc = userAvatar ? userAvatar.src : 'assets/images/user.png';

            // 将用户消息添加到显示和历史
            appendMessageToDisplay(message, 'user', userAvatarSrc);
            chatHistory.push({
                type: 'user',
                text: message,
                avatar: userAvatarSrc,
                timestamp: new Date().toISOString()
            });

            // 添加AI响应"加载中"占位符
            const aiAvatarSrc = 'assets/images/chatgpt.png';
            const aiResponseElement = appendMessageToDisplay(
                '<p class="api-placeholder">Loading response...</p>',
                'ai',
                aiAvatarSrc
            );

            // 设置为加载状态
            updateSendButtonState(true);

            // 调用API
            callGPT41Api(message)
                .then(result => {
                    updateSendButtonState(false);

                    if (result.success === false) {
                        // 处理错误
                        const errorMessage = `<div class="error-message">
                            <p>Sorry, an error occurred: ${result.error}</p>
                        </div>`;
                        aiResponseElement.innerHTML = errorMessage;

                        // 将错误消息添加到聊天历史
                        chatHistory.push({
                            type: 'ai',
                            text: errorMessage,
                            avatar: aiAvatarSrc,
                            timestamp: new Date().toISOString(),
                            isError: true
                        });
                    } else {
                        // 获取原始响应文本
                        const rawResponse = result.data?.text || 'Sorry, could not get a response';

                        // 显示格式化的响应
                        const formattedResponse = formatAIResponse(rawResponse);
                        aiResponseElement.innerHTML = formattedResponse;

                        // 将AI原始文本回复添加到聊天历史（这样在恢复时可以正确格式化）
                        chatHistory.push({
                            type: 'ai',
                            text: rawResponse, // 存储原始文本而非格式化后的HTML
                            avatar: aiAvatarSrc,
                            timestamp: new Date().toISOString()
                        });
                    }

                    // 更新页面标题
                    let shortTitle = message.length > 50 ? message.substring(0, 50) + "..." : message;
                    document.title = `${shortTitle} - GPT4.1 Free AI Assistant`;

                    // 清空输入框并调整大小
                    userInput.value = '';
                    autoResizeTextarea();

                    // 保存聊天状态
                    saveChatState();
                })
                .catch(error => {
                    let errorMessage;

                    if (error.name === 'AbortError') {
                        console.log('API request was aborted');
                        errorMessage = '<p class="api-placeholder">Response generation stopped</p>';
                        // 设置为继续模式
                        updateSendButtonState(false, true);
                    } else {
                        console.error('Error processing message:', error);
                        errorMessage = `<div class="error-message">
                            <p>Error connecting to server. Please try again later.</p>
                        </div>`;
                        // 普通错误，恢复为发送模式
                        updateSendButtonState(false);
                    }

                    aiResponseElement.innerHTML = errorMessage;

                    // 将错误信息添加到聊天历史
                    chatHistory.push({
                        type: 'ai',
                        text: errorMessage,
                        avatar: aiAvatarSrc,
                        timestamp: new Date().toISOString(),
                        isError: true
                    });

                    // 清空输入框并调整大小
                    userInput.value = '';
                    autoResizeTextarea();

                    // 保存聊天状态
                    saveChatState();
                });
        } else {
            userInput.classList.add('shake');
            setTimeout(() => userInput.classList.remove('shake'), 500);
        }
    }

    // 格式化AI回复，将换行符转换为HTML换行
    function formatAIResponse(text) {
        if (!text) return '';

        // 处理特定的章节标题
        text = text.replace(/^\d+\.\s+(Sector-Specific Trends|City-Level Trends):?/gm,
            '<div class="section-header">$1:</div>');

        // 处理有序列表（数字后跟点和空格开头的行）
        text = text.replace(/^\d+\.\s(.+)$/gm, '<li class="numbered-item">$1</li>');
        text = text.replace(/(<li class="numbered-item">.*?<\/li>(\s*\n)?)+/gs, '<ol>$&</ol>');

        // 修复嵌套列表问题 (移除嵌套的 ol 标签)
        text = text.replace(/<ol>(\s*)<ol>/g, '<ol>$1');
        text = text.replace(/<\/ol>(\s*)<\/ol>/g, '</ol>$1');

        // 处理段落和换行
        text = text.replace(/\n\n/g, '</p><p>');
        text = text.replace(/\n/g, '<br>');

        // 处理格式化标记
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // 粗体
        text = text.replace(/_(.*?)_/g, '<em>$1</em>'); // 斜体

        return text;
    }

    // 调用GPT4.1 API的函数
    async function callGPT41Api(prompt) {
        try {
            console.log(`Calling GPT4.1 API with prompt: ${prompt}`);

            // 创建一个新的AbortController实例，用于取消请求
            currentApiController = new AbortController();
            const signal = currentApiController.signal;

            const response = await fetch('/api/qwen/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    options: {
                        temperature: 0.7,
                        max_tokens: 1500,
                        top_p: 0.9
                    }
                }),
                signal: signal // 传递信号给fetch，允许中断请求
            });

            // 请求完成后重置控制器
            currentApiController = null;

            console.log('API Response status:', response.status);

            if (!response.ok) {
                // Try to parse error message
                let errorData;
                try {
                    errorData = await response.json();
                    console.error('API error details:', errorData);
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                    // Ignore non-JSON responses
                }
                throw new Error(`HTTP Error! Status: ${response.status}${errorData && errorData.message ? ' - ' + errorData.message : ''}`);
            }

            const result = await response.json();
            console.log('GPT4.1 API Response:', result);
            return result;

        } catch (error) {
            // 如果是中断请求导致的错误，传递给调用者处理
            if (error.name === 'AbortError') {
                throw error;
            }

            console.error('Error calling GPT4.1 API:', error);
            return {
                success: false,
                error: error.message || "Unable to connect to backend service. Please try again later."
            };
        }
    }

    // 设置发送按钮状态（发送/停止/继续）
    function updateSendButtonState(isLoading, isContinue = false) {
        isRequestPending = isLoading;
        isContinueMode = isContinue && !isLoading;

        if (isLoading) {
            // 变为停止按钮
            sendButton.innerHTML = '■'; // 停止符号
            sendButton.title = 'Stop';
            sendButton.classList.add('stop-button');
            sendButton.classList.remove('continue-button');
        } else if (isContinue) {
            // 变为继续按钮
            sendButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
            </svg>`; // 继续图标（播放按钮）
            sendButton.title = 'Continue';
            sendButton.classList.remove('stop-button');
            sendButton.classList.add('continue-button');
        } else {
            // 变回发送按钮
            sendButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
            </svg>`; // 发送图标
            sendButton.title = 'Send';
            sendButton.classList.remove('stop-button');
            sendButton.classList.remove('continue-button');
        }
    }

    // 停止当前API请求
    function stopApiRequest() {
        if (currentApiController) {
            // 获取当前正在处理的最后一条用户消息
            const userMessages = chatHistory.filter(msg => msg.type === 'user');
            if (userMessages.length > 0) {
                lastStoppedPrompt = userMessages[userMessages.length - 1].text;
                console.log('Saved stopped prompt:', lastStoppedPrompt);
            }

            currentApiController.abort(); // 中断请求
            currentApiController = null;

            // 更新按钮状态为"继续"模式
            updateSendButtonState(false, true);
        }
    }

    // 从sessionStorage加载聊天状态
    function loadChatState() {
        try {
            const storedState = sessionStorage.getItem(CHAT_STATE_KEY);
            if (storedState) {
                const state = JSON.parse(storedState);

                // 恢复聊天历史
                chatHistory = state.chatHistory || [];

                if (chatHistory.length > 0) {
                    console.log('Rebuilding chat display with', chatHistory.length, 'messages');

                    // 清空当前聊天容器（前面已经清空过一次，这里确保）
                    if (conversationContainer) {
                        conversationContainer.innerHTML = '';
                    }

                    // 关闭动画滚动效果，以避免中间消息的滚动
                    conversationContainer.classList.remove('scroll-to-bottom');

                    // 重建对话显示
                    for (let i = 0; i < chatHistory.length; i++) {
                        const message = chatHistory[i];
                        const isLastMessage = i === chatHistory.length - 1;

                        // 创建消息包装器
                        const messageWrapper = document.createElement('div');
                        messageWrapper.className = `message-wrapper ${message.type}-message-wrapper`;

                        // 创建头像容器
                        const avatarDiv = document.createElement('div');
                        avatarDiv.className = `${message.type}-avatar`;

                        // 创建头像图片
                        const avatarImg = document.createElement('img');
                        avatarImg.src = message.avatar;
                        avatarImg.alt = message.type === 'user' ? 'User Avatar' : 'AI Avatar';
                        avatarDiv.appendChild(avatarImg);

                        // 创建消息容器
                        const messageDiv = document.createElement('div');
                        messageDiv.className = `message ${message.type}-message`;

                        // 创建消息内容容器
                        const contentDiv = document.createElement('div');
                        contentDiv.className = 'message-content';

                        // 根据消息类型处理内容
                        if (message.type === 'ai') {
                            // 确保AI回复的格式化一致
                            contentDiv.innerHTML = formatAIResponse(message.text);
                        } else {
                            // 用户消息可以直接使用
                            contentDiv.textContent = message.text;
                        }

                        // 组装消息
                        messageDiv.appendChild(contentDiv);
                        messageWrapper.appendChild(avatarDiv);
                        messageWrapper.appendChild(messageDiv);

                        // 添加到聊天容器
                        conversationContainer.appendChild(messageWrapper);

                        // 如果是最后一条消息，确保滚动到底部
                        if (isLastMessage) {
                            // 滚动到底部
                            setTimeout(scrollToBottom, 100);
                        }
                    }
                } else {
                    console.log('Chat history was empty, not rebuilding display');
                }

                // 恢复输入框内容
                if (userInput && state.userInput) {
                    userInput.value = state.userInput;
                    // 触发input事件以确保textarea高度正确调整
                    userInput.dispatchEvent(new Event('input'));
                }

                // 恢复页面标题
                if (state.pageTitle) {
                    document.title = state.pageTitle;
                }

                console.log('Chat state loaded with', chatHistory.length, 'messages');
                return chatHistory.length > 0; // 只有当实际有消息时才返回true
            }
        } catch (e) {
            console.error('Error loading chat state from sessionStorage:', e);
            // 如果解析失败，清除无效的状态
            sessionStorage.removeItem(CHAT_STATE_KEY);
        }
        return false; // 没有加载状态或状态为空
    }

    // 保存聊天状态到sessionStorage
    function saveChatState() {
        const state = {
            chatHistory: chatHistory,
            userInput: userInput ? userInput.value : '',
            pageTitle: document.title,
        };
        try {
            sessionStorage.setItem(CHAT_STATE_KEY, JSON.stringify(state));
            console.log('Chat state saved with', chatHistory.length, 'messages');
        } catch (e) {
            console.error('Error saving chat state to sessionStorage:', e);
        }
    }

    // 处理用户直接输入的新查询
    function handleNewUserInput(text) {
        if (!text || text.trim() === '') return;

        // 清除所有临时消息或未完成的用户消息
        cleanupIncompleteMessages();

        // 获取用户头像路径
        const userAvatarSrc = userAvatar ? userAvatar.src : 'assets/images/user.png';

        // 添加新的用户消息
        appendMessageToDisplay(text, 'user', userAvatarSrc);

        // 在聊天历史中记录用户消息
        chatHistory.push({
            type: 'user',
            text: text,
            avatar: userAvatarSrc,
            timestamp: new Date().toISOString()
        });

        // 添加AI响应"加载中"占位符
        const aiAvatarSrc = 'assets/images/chatgpt.png';
        const aiResponseElement = appendMessageToDisplay(
            '<p class="api-placeholder">Loading response...</p>',
            'ai',
            aiAvatarSrc
        );

        // 设置为加载状态
        updateSendButtonState(true);

        // 调用API获取回复
        callGPT41Api(text)
            .then(result => {
                updateSendButtonState(false);

                if (result.success === false) {
                    // 处理错误
                    const errorMessage = `<div class="error-message">
                        <p>Sorry, an error occurred: ${result.error}</p>
                    </div>`;
                    aiResponseElement.innerHTML = errorMessage;

                    // 将错误消息添加到聊天历史
                    chatHistory.push({
                        type: 'ai',
                        text: errorMessage,
                        avatar: aiAvatarSrc,
                        timestamp: new Date().toISOString(),
                        isError: true
                    });
                } else {
                    // 获取原始响应文本
                    const rawResponse = result.data?.text || 'Sorry, could not get a response';

                    // 显示格式化的响应
                    const formattedResponse = formatAIResponse(rawResponse);
                    aiResponseElement.innerHTML = formattedResponse;

                    // 将AI原始文本回复添加到聊天历史
                    chatHistory.push({
                        type: 'ai',
                        text: rawResponse, // 存储原始文本而非格式化后的HTML
                        avatar: aiAvatarSrc,
                        timestamp: new Date().toISOString()
                    });
                }

                // 更新页面标题
                let shortTitle = text.length > 50 ? text.substring(0, 50) + "..." : text;
                document.title = `${shortTitle} - GPT4.1 Free AI Assistant`;

                // 保存聊天状态
                saveChatState();

                // 强制滚动到底部
                setTimeout(scrollToBottom, 100);
            })
            .catch(error => {
                let errorMessage;

                if (error.name === 'AbortError') {
                    console.log('API request was aborted');
                    errorMessage = '<p class="api-placeholder">Response generation stopped</p>';
                    // 设置为继续模式
                    updateSendButtonState(false, true);
                } else {
                    console.error('Error processing message:', error);
                    errorMessage = `<div class="error-message">
                        <p>Error connecting to server. Please try again later.</p>
                    </div>`;
                    // 普通错误，恢复为发送模式
                    updateSendButtonState(false);
                }

                aiResponseElement.innerHTML = errorMessage;

                // 将错误信息添加到聊天历史
                chatHistory.push({
                    type: 'ai',
                    text: errorMessage,
                    avatar: aiAvatarSrc,
                    timestamp: new Date().toISOString(),
                    isError: true
                });

                // 保存聊天状态
                saveChatState();

                // 强制滚动到底部
                setTimeout(scrollToBottom, 100);
            });
    }

    // 清理可能存在的未完成消息或临时消息
    function cleanupIncompleteMessages() {
        // 1. 查找所有含有临时消息(.api-placeholder)的消息
        const temporaryMessages = conversationContainer.querySelectorAll('.message-content .api-placeholder');
        temporaryMessages.forEach(placeholder => {
            const messageWrapper = findParentWithClass(placeholder, 'message-wrapper');
            if (messageWrapper) {
                // 找到了临时消息的包装元素，删除它
                conversationContainer.removeChild(messageWrapper);
            }
        });

        // 2. 检查最后一条消息是否为用户消息，如果是，则移除
        const allMessages = conversationContainer.querySelectorAll('.message-wrapper');
        if (allMessages.length > 0) {
            const lastMessage = allMessages[allMessages.length - 1];
            if (lastMessage.classList.contains('user-message-wrapper')) {
                // 最后一条是用户消息，删除它以防止消息重叠
                conversationContainer.removeChild(lastMessage);
            }
        }
    }
});