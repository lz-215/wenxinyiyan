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
            
            if (!googleId || !name || !email) {
                console.error('Missing required login information'); // 添加调试日志
                alert('登录信息不完整，请重试');
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
                console.error('Error saving login information:', error); // 添加调试日志
                alert('保存登录信息时出错，请确保浏览器允许保存数据');
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
        } else {
            // 否则跳转到首页
            window.location.href = '/';
        }
    }
});