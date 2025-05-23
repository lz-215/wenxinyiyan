document.addEventListener('DOMContentLoaded', () => {
    const loginButtons = document.querySelectorAll('#loginButton');
    const loginModal = document.getElementById('loginModal');
    const CHAT_COUNT_KEY = 'chat_count';
    const MAX_FREE_CHATS = 10;
    
    // 获取主域名函数
    const getMainDomain = () => {
        const hostName = window.location.hostname;
        
        // 本地开发环境处理
        if (!hostName || hostName === '' || hostName === 'localhost' || hostName === '127.0.0.1') {
            // 本地开发时使用测试域名
            return 'ehangsec.com';
        }
        
        const parts = hostName.split('.');
        if (parts.length > 2) {
            return parts.slice(-2).join('.');
        }
        return hostName;
    };

    // 处理谷歌登录
    const handleGoogleLogin = () => {
        const mainDomain = getMainDomain();
        
        // 获取当前完整 URL 作为回调
        const currentUrl = window.location.href;
        const callback = encodeURIComponent(currentUrl);
        
        // 保存当前 URL 用于登录后跳转回来
        localStorage.setItem('redirect_after_login', currentUrl);
        
        // 构造登录 URL
        const loginUrl = `https://aa.jstang.cn/google_login.php?url=${mainDomain}&redirect_uri=${callback}`;
        console.log('Login URL:', loginUrl); // 添加调试日志
        
        // 跳转到登录页面
        window.location.href = loginUrl;
    };

    // 检查登录状态和对话次数
    const checkLoginAndChatCount = () => {
        const chatCount = parseInt(localStorage.getItem(CHAT_COUNT_KEY) || '0');
        if (chatCount >= MAX_FREE_CHATS && !localStorage.getItem('google_id')) {
            alert('You have reached the free chat limit. Please login to continue.');
            handleGoogleLogin();
            return false;
        }
        return true;
    };

    // 更新UI以显示用户信息
    const updateUserInterface = () => {
        const isLoggedIn = localStorage.getItem('google_id');
        const loginButtons = document.querySelectorAll('#loginButton');
        
        loginButtons.forEach(button => {
            if (isLoggedIn) {
                // 创建用户头像和下拉菜单
                const userInfo = document.createElement('div');
                userInfo.className = 'user-info-container';
                
                const userAvatar = document.createElement('img');
                userAvatar.src = localStorage.getItem('picture') || 'assets/images/user.png';
                userAvatar.className = 'user-avatar-button';
                userAvatar.alt = 'User Avatar';
                
                const dropdownMenu = document.createElement('div');
                dropdownMenu.className = 'dropdown-menu';
                dropdownMenu.innerHTML = `
                    <div class="dropdown-item user-profile">
                        <img src="${localStorage.getItem('picture') || 'assets/images/user.png'}" alt="User Avatar">
                        <div class="user-details">
                            <div class="user-name">${localStorage.getItem('name') || 'User'}</div>
                            <div class="user-email">${localStorage.getItem('email') || ''}</div>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item logout">Logout</div>
                `;
                
                userInfo.appendChild(userAvatar);
                userInfo.appendChild(dropdownMenu);
                
                // 替换登录按钮
                button.parentNode.replaceChild(userInfo, button);
                
                // 添加点击事件处理
                userAvatar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdownMenu.classList.toggle('show');
                });
                
                // 处理退出登录
                const logoutButton = dropdownMenu.querySelector('.logout');
                logoutButton.addEventListener('click', () => {
                    localStorage.removeItem('google_id');
                    localStorage.removeItem('name');
                    localStorage.removeItem('email');
                    localStorage.removeItem('picture');
                    localStorage.removeItem('token');
                    window.location.reload();
                });
                
                // 点击其他地方关闭下拉菜单
                document.addEventListener('click', () => {
                    dropdownMenu.classList.remove('show');
                });
            }
        });
    };

    // 增加对话计数
    const incrementChatCount = () => {
        const currentCount = parseInt(localStorage.getItem(CHAT_COUNT_KEY) || '0');
        localStorage.setItem(CHAT_COUNT_KEY, (currentCount + 1).toString());
    };

    // 检查登录状态
    const checkLoginStatus = () => {
        const url = window.location.href;
        if (url.includes('google_id=')) {
            const params = new URLSearchParams(url.split('?')[1]);
            
            // 提取 Google 用户信息
            const googleId = params.get('google_id');
            const name = params.get('name');
            const email = params.get('email');
            const picture = params.get('picture');
            
            console.log('Login response:', { googleId, name, email, picture }); // 添加调试日志
            
            if (!googleId || !name || !email) {
                alert('Login information is incomplete. Please try again.');
                return false;
            }
            
            // 存储用户信息
            try {
                localStorage.setItem('google_id', googleId);
                localStorage.setItem('name', name);
                localStorage.setItem('email', email);
                if (picture) localStorage.setItem('picture', picture);
                
                // 生成 token
                const token = btoa(JSON.stringify({ googleId, name, email, picture }));
                localStorage.setItem('token', token);
                
                // 清理 URL 参数
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
                
                updateUserInterface();
                return true;
            } catch (error) {
                console.error('Error saving login information:', error); // 添加调试日志
                alert('Error saving login information. Please ensure browser allows data storage.');
                return false;
            }
        }
        return false;
    };

    // 给所有登录按钮添加点击事件
    loginButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            handleGoogleLogin();
        });
    });

    // 页面加载时检查登录状态
    if (checkLoginStatus()) {
        // 如果存在重定向 URL，跳转到该 URL
        const redirectUrl = localStorage.getItem('redirect_after_login');
        if (redirectUrl) {
            localStorage.removeItem('redirect_after_login');
            window.location.href = redirectUrl;
        }
    } else {
        updateUserInterface(); // 确保UI反映当前登录状态
    }

    // 导出必要的函数供其他模块使用
    window.checkLoginAndChatCount = checkLoginAndChatCount;
    window.incrementChatCount = incrementChatCount;
});