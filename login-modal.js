document.addEventListener('DOMContentLoaded', () => {
    // 获取登录按钮
    const loginButtons = document.querySelectorAll('#loginButton');
    
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
            
            // 更新错误提示
            if (!googleId || !name || !email) {
                console.error('Missing required login information');
                alert('Login information incomplete, please try again');
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
                
                return true;
            } catch (error) {
                console.error('Error saving login information:', error);
                alert('Error saving login data, please make sure browser allows data storage');
                return false;
            }
        }
        return false;
    };

    // 更新用户界面显示
    const updateUserInterface = () => {
        const loginButton = document.querySelector('#loginButton');
        const token = localStorage.getItem('token');
        const picture = localStorage.getItem('picture');
        
        if (token && loginButton) {
            // 创建用户头像元素
            const userProfileDiv = document.createElement('div');
            userProfileDiv.className = 'user-profile';
            userProfileDiv.innerHTML = `
                <img src="${picture || 'assets/images/avatar/user1.png'}" alt="User Avatar" class="user-avatar">
                <div class="user-dropdown">
                    <div class="dropdown-item view-profile">View Profile</div>
                    <div class="dropdown-item logout">Sign Out</div>
                </div>
            `;
            
            // 替换登录按钮
            loginButton.parentNode.replaceChild(userProfileDiv, loginButton);
            
            // 添加下拉菜单事件
            const dropdown = userProfileDiv.querySelector('.user-dropdown');
            userProfileDiv.addEventListener('click', () => {
                dropdown.classList.toggle('show');
            });
            
            // 添加退出登录事件
            const logoutButton = userProfileDiv.querySelector('.logout');
            logoutButton.addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.clear();
                window.location.reload();
            });
            
            // 添加查看个人信息事件
            const viewProfileButton = userProfileDiv.querySelector('.view-profile');
            viewProfileButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = localStorage.getItem('name');
                const email = localStorage.getItem('email');
                alert(`Name: ${name}\nEmail: ${email}`);
            });
            
            // 点击其他地方关闭下拉菜单
            document.addEventListener('click', (e) => {
                if (!userProfileDiv.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        }
    };

    // 在登录成功后更新界面
    const handleLoginSuccess = () => {
        updateUserInterface();
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
        }
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
        handleLoginSuccess();
    }
});