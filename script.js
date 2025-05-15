document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const refreshPromptsButton = document.getElementById('refreshPrompts');
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    const introSection = document.querySelector('.intro-section');
    const responseContainer = document.getElementById('responseContainer');
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const closeChat = document.getElementById('closeChat');

    // Chat conversation history
    let conversationHistory = [];

    // 初始化分配图标
    initializeIcons();

    if (userInput) {
        userInput.addEventListener('input', autoResizeTextarea);
        
        setTimeout(autoResizeTextarea, 0);
        
        setTimeout(() => userInput.focus(), 500);
    }

    function autoResizeTextarea() {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    }

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            setButtonLoading(loginButton, true);
            
            setTimeout(() => {
                setButtonLoading(loginButton, false);
                alert('Login functionality will be implemented with actual API integration.');
            }, 1000);
        });
    }

    if (refreshPromptsButton) {
        refreshPromptsButton.addEventListener('click', () => {
            setButtonLoading(refreshPromptsButton, true);
            
            setTimeout(() => {
                setButtonLoading(refreshPromptsButton, false);
                shuffleAndDisplayCards();
            }, 300);
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (userInput) {
        userInput.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    if (closeChat) {
        closeChat.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }

    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.add('active');
            
            setTimeout(() => {
                card.classList.remove('active');
                const question = card.querySelector('p')?.textContent || card.querySelector('h3')?.textContent;
                if (question) {
                    // 直接跳转到chat.html页面，并传递查询参数
                    window.location.href = `chat.html?query=${encodeURIComponent(question)}`;
                }
            }, 150);
        });
    });

    function sendMessage() {
        if (!userInput) return;
        
        const message = userInput.value.trim();
        if (message) {
            // 将用户输入重定向到chat.html页面，并传递查询参数
            window.location.href = `chat.html?query=${encodeURIComponent(message)}`;
        } else {
            userInput.classList.add('shake');
            setTimeout(() => userInput.classList.remove('shake'), 500);
        }
    }
    
    // Add a message to the chat history
    function addMessageToChat(role, content) {
        conversationHistory.push({ role, content });
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${role}`;
        messageElement.innerHTML = `<p>${role === 'user' ? content : formatAIResponse(content)}</p>`;
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 格式化AI回复，将换行符转换为HTML换行
    function formatAIResponse(text) {
        if (!text) return '';
        return text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // 处理粗体
    }

    function setButtonLoading(button, isLoading) {
        if (!button) return;
        
        const originalContent = button.getAttribute('data-original-content') || button.innerHTML;
        
        if (isLoading) {
            button.setAttribute('data-original-content', originalContent);
            button.disabled = true;
            button.innerHTML = '<div class="loading-spinner"></div>';
        } else {
            button.innerHTML = originalContent;
            button.disabled = false;
        }
    }

    // 调用通义千问API的函数
    async function callQwenApi(prompt) {
        try {
            console.log(`Calling Qwen API with prompt: ${prompt}`);
            
            const response = await fetch('http://localhost:3000/api/qwen/chat', {
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
            });
            
            if (!response.ok) {
                // Try to parse error message
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Ignore non-JSON responses
                }
                throw new Error(`HTTP Error! Status: ${response.status}${errorData && errorData.message ? ' - ' + errorData.message : ''}`);
            }
            
            const result = await response.json();
            console.log('Qwen API Response:', result);
            return result;
            
        } catch (error) {
            console.error('Error calling Qwen API:', error);
            return { 
                success: false, 
                error: error.message || "Unable to connect to backend service. Please try again later." 
            };
        }
    }

    // Retain the original callApi function for compatibility with other features
    async function callApi(endpoint, data) {
        try {
            console.log(`Calling backend API: ${endpoint} with data:`, data);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                // Try to parse error from backend if available
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Ignore if response is not JSON
                }
                throw new Error(`HTTP error! status: ${response.status}${errorData && errorData.error ? ' - ' + errorData.error : ''}`);
            }
            
            const result = await response.json();
            console.log('Backend API Response:', result);
            return result; // Expecting backend to return something like { reply: "AI response" }
            
        } catch (error) {
            console.error('Error calling backend API:', error);
            // Return a structured error that sendMessage can handle
            return { 
                success: false, 
                error: error.message || "Failed to communicate with the backend. Please try again later." 
            };
        }
    }

    // 初始化时只显示6个卡片
    function shuffleAndDisplayCards() {
        const allCards = Array.from(suggestionCards);
        const suggestionsGrid = document.querySelector('.suggestions-grid');
        
        // 淡出效果
        suggestionsGrid.style.opacity = '0';
        
        setTimeout(() => {
            // 随机打乱所有卡片
            const shuffledCards = allCards.sort(() => Math.random() - 0.5);
            
            // 先隐藏所有卡片
            allCards.forEach(card => {
                card.style.display = 'none';
                // 重置动画
                card.style.animation = 'none';
                // 清除所有图标类
                for (let i = 1; i <= 12; i++) {
                    card.classList.remove(`icon-${i}`);
                }
            });
            
            // 只显示前6个
            shuffledCards.slice(0, 6).forEach((card, index) => {
                card.style.display = '';
                // 随机分配图标 (1-12)
                const randomIconNum = Math.floor(Math.random() * 12) + 1;
                card.classList.add(`icon-${randomIconNum}`);
                // 重新应用动画，添加延迟使卡片依次出现
                setTimeout(() => {
                    card.style.animation = `cardFadeIn 0.5s ease forwards ${index * 0.1}s`;
                }, 10);
            });
            
            // 淡入效果
            suggestionsGrid.style.opacity = '1';
            suggestionsGrid.style.transition = 'opacity 0.5s ease';
        }, 300);
    }
    
    // 页面加载时初始化显示
    shuffleAndDisplayCards();

    // 为每个卡片随机分配初始图标
    function initializeIcons() {
        suggestionCards.forEach(card => {
            const randomIconNum = Math.floor(Math.random() * 12) + 1;
            card.classList.add(`icon-${randomIconNum}`);
        });
    }
}); 