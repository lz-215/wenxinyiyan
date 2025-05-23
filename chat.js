document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const homeButton = document.getElementById('homeButton');
    const loginButton = document.getElementById('loginButton');
    const newChatButton = document.getElementById('newChatButton');
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const responseText = document.getElementById('responseText');
    const userQuestion = document.getElementById('userQuestion');
    const userAvatar = document.querySelector('.user-avatar img');
    const conversationContainer = document.querySelector('.conversation-container');

    // 用于存储聊天历史的数组
    let chatHistory = [];

    // 聊天状态存储的键
    const CHAT_STATE_KEY = 'chatState';
    const USER_AVATAR_KEY = 'userAvatarPath';
    const NAV_STATE_KEY = 'navigationState';
    const LAST_PAGE_KEY = 'lastPageVisited';

    // 控制API请求的变量
    let currentApiController = null;
    let isRequestPending = false;
    let lastStoppedPrompt = null;
    let isContinueMode = false;

    // 检查并更新用户界面
    const updateUserInterface = () => {
        const isLoggedIn = localStorage.getItem('google_id');
        if (isLoggedIn && loginButton) {
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info-container';
            
            const userPicture = localStorage.getItem('picture');
            const userName = localStorage.getItem('name');
            const userEmail = localStorage.getItem('email');
            
            const userAvatar = document.createElement('img');
            userAvatar.src = userPicture || 'assets/images/user.png';
            userAvatar.className = 'user-avatar-button';
            userAvatar.alt = 'User Avatar';
            
            const dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'dropdown-menu';
            dropdownMenu.innerHTML = `
                <div class="dropdown-item user-profile">
                    <img src="${userPicture || 'assets/images/user.png'}" alt="User Avatar">
                    <div class="user-details">
                        <div class="user-name">${userName || 'User'}</div>
                        <div class="user-email">${userEmail || ''}</div>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item logout">Logout</div>
            `;
            
            userInfo.appendChild(userAvatar);
            userInfo.appendChild(dropdownMenu);
            
            loginButton.parentNode.replaceChild(userInfo, loginButton);
            
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            const logoutButton = dropdownMenu.querySelector('.logout');
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('google_id');
                localStorage.removeItem('name');
                localStorage.removeItem('email');
                localStorage.removeItem('picture');
                localStorage.removeItem('token');
                window.location.reload();
            });
            
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }
    };

    // 在页面加载时检查登录状态并更新UI
    updateUserInterface();

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

                    // 如果时间差小于60秒，认为是从首页（通过后退按钮）返回的
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

    // 检查登录状态
    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        const googleId = localStorage.getItem('google_id');
        
        if (!token || !googleId) {
            // 未登录时保存当前URL
            localStorage.setItem('redirect_after_login', window.location.href);
            window.location.href = '/';
            return false;
        }
        return true;
    }

    // 在页面加载时检查登录状态
    document.addEventListener('DOMContentLoaded', () => {
        if (!checkLoginStatus()) {
            return;
        }
        
        // 显示用户头像
        const userPicture = localStorage.getItem('picture');
        if (userPicture) {
            const userAvatarImg = document.querySelector('.user-avatar img');
            if (userAvatarImg) {
                userAvatarImg.src = userPicture;
            }
        }
        
        // ...继续执行其他初始化代码...
    });

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

        // 显示欢迎消息
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

        // 保存聊天状态
        saveChatState();

        // 聚焦到输入框
        if (userInput) {
            userInput.focus();
        }
    }

    // 处理发送/停止/继续按钮
    if (sendButton && userInput) {
        sendButton.addEventListener('click', () => {
            if (isRequestPending) {
                stopApiRequest();
            } else if (isContinueMode && lastStoppedPrompt) {
                console.log('Continuing response for prompt:', lastStoppedPrompt);

                const aiMessages = conversationContainer.querySelectorAll('.ai-message-wrapper');
                if (aiMessages.length > 0) {
                    const lastAiMessage = aiMessages[aiMessages.length - 1];
                    const contentDiv = lastAiMessage.querySelector('.message-content');
                    if (contentDiv && contentDiv.innerHTML.includes('Response generation stopped')) {
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
                                    const rawResponse = result.data?.text || 'Sorry, could not get a response';
                                    const formattedResponse = formatAIResponse(rawResponse);
                                    contentDiv.innerHTML = formattedResponse;

                                    chatHistory.push({
                                        type: 'ai',
                                        text: rawResponse,
                                        avatar: 'assets/images/chatgpt.png',
                                        timestamp: new Date().toISOString()
                                    });
                                }

                                isContinueMode = false;
                                lastStoppedPrompt = null;

                                // 保存聊天状态并滚动到底部
                                saveChatState();
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
                                chatHistory.push({
                                    type: 'ai',
                                    text: errorMessage,
                                    avatar: 'assets/images/chatgpt.png',
                                    timestamp: new Date().toISOString(),
                                    isError: true
                                });

                                saveChatState();
                            });
                    }
                }
            } else {
                // 正常发送新消息
                const message = userInput.value.trim();
                if (message) {
                    handleNewUserInput(message);
                    userInput.value = '';
                    autoResizeTextarea();
                }
            }
        });
    }

    // 更新UI元素的禁用状态
    function updateUIDisabledState(disabled) {
        if (userInput) {
            userInput.disabled = disabled;
            if (disabled) {
                userInput.placeholder = 'You have reached the free chat limit (10 messages). Please login to continue.';
            } else {
                userInput.placeholder = 'Type your message here... Press Ctrl+Enter to send';
            }
        }
        if (sendButton) {
            sendButton.disabled = disabled;
        }
        if (newChatButton) {
            newChatButton.disabled = disabled;
        }
    }

    // 检查是否需要禁用功能
    function checkAndUpdateUIState() {
        const chatCount = parseInt(localStorage.getItem('chat_count') || '0');
        const isLoggedIn = localStorage.getItem('google_id');
        
        if (chatCount >= 10 && !isLoggedIn) {
            updateUIDisabledState(true);
            return false;
        } else {
            updateUIDisabledState(false);
            return true;
        }
    }

    // 页面加载时检查UI状态
    checkAndUpdateUIState();

    // 设置发送按钮状态（发送/停止/继续）
    function updateSendButtonState(isLoading, isContinue = false) {
        isRequestPending = isLoading;
        isContinueMode = isContinue && !isLoading;

        if (!sendButton) return;

        if (isLoading) {
            // Change to stop button
            sendButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.5 3.5h9v9h-9z"/>
                </svg>
            `;
            sendButton.title = 'Stop';
            sendButton.classList.add('stop-button');
            sendButton.classList.remove('continue-button');
        } else if (isContinue) {
            // Change to continue button
            sendButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
            `;
            sendButton.title = 'Continue';
            sendButton.classList.remove('stop-button');
            sendButton.classList.add('continue-button');
        } else {
            // Change back to send button
            sendButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                </svg>
            `;
            sendButton.title = 'Send';
            sendButton.classList.remove('stop-button', 'continue-button');
        }
    }

    // Stop current API request
    function stopApiRequest() {
        if (currentApiController) {
            // Save current prompt
            const userMessages = chatHistory.filter(msg => msg.type === 'user');
            if (userMessages.length > 0) {
                lastStoppedPrompt = userMessages[userMessages.length - 1].text;
            }
            
            currentApiController.abort();
            updateSendButtonState(false, true);
        }
    }
});