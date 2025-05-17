document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const loginModal = document.getElementById('loginModal');
    const loginButtons = document.querySelectorAll('#loginButton');
    const closeModalButton = document.getElementById('closeLoginModal');
    const modalTabs = document.querySelectorAll('.modal-tab');
    const phoneInput = document.getElementById('phoneInput');
    const verificationInput = document.getElementById('verificationInput');
    const sendVerificationBtn = document.getElementById('sendVerificationBtn');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const consentCheckbox = document.getElementById('consentCheckbox');
    const loginForm = document.getElementById('loginForm');

    // 设置验证码倒计时的初始值
    let countdownInterval = null;
    let countdownTime = 60;

    // 显示登录弹窗
    function showLoginModal() {
        loginModal.classList.add('active');
        // 默认重置表单
        resetForm();
    }

    // 隐藏登录弹窗
    function hideLoginModal() {
        loginModal.classList.remove('active');
    }

    // 重置表单
    function resetForm() {
        if (loginForm) {
            loginForm.reset();
        }
        updateLoginButtonState();
        stopCountdown();
        if (sendVerificationBtn) {
            sendVerificationBtn.textContent = 'Send code';
            sendVerificationBtn.disabled = false;
        }
    }

    // 监听登录按钮点击事件
    loginButtons.forEach(button => {
        // 移除所有现有的点击事件监听器（通过克隆和替换元素）
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // 添加新的点击事件监听器
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    });

    // 监听关闭按钮点击事件
    if (closeModalButton) {
        closeModalButton.addEventListener('click', hideLoginModal);
    }

    // 点击模态框外部关闭模态框
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                hideLoginModal();
            }
        });
    }

    // 标签切换功能
    modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签的active类
            modalTabs.forEach(t => t.classList.remove('active'));
            // 添加当前标签的active类
            tab.classList.add('active');
        });
    });

    // 启动倒计时
    function startCountdown() {
        if (sendVerificationBtn) {
            sendVerificationBtn.disabled = true;
            countdownTime = 60;
            sendVerificationBtn.textContent = `Resend (${countdownTime}s)`;

            countdownInterval = setInterval(() => {
                countdownTime--;
                if (countdownTime <= 0) {
                    stopCountdown();
                    return;
                }
                sendVerificationBtn.textContent = `Resend (${countdownTime}s)`;
            }, 1000);
        }
    }

    // 停止倒计时
    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        if (sendVerificationBtn) {
            sendVerificationBtn.disabled = false;
            sendVerificationBtn.textContent = 'Send code';
        }
    }

    // 监听发送验证码按钮点击事件
    if (sendVerificationBtn) {
        sendVerificationBtn.addEventListener('click', () => {
            if (!phoneInput.value.trim()) {
                alert("Please enter your phone number");
                return;
            }

            // 模拟发送验证码
            alert("This feature is currently unavailable. In a real app, a verification code would be sent to your phone.");
            startCountdown();
        });
    }

    // 监听输入字段变化，更新登录按钮状态
    if (phoneInput) {
        phoneInput.addEventListener('input', updateLoginButtonState);
    }

    if (verificationInput) {
        verificationInput.addEventListener('input', updateLoginButtonState);
    }

    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', updateLoginButtonState);
    }

    // 更新登录按钮状态
    function updateLoginButtonState() {
        if (loginSubmitBtn) {
            const isPhoneValid = phoneInput && phoneInput.value.trim().length > 0;
            const isVerificationValid = verificationInput && verificationInput.value.trim().length > 0;
            const isConsentChecked = consentCheckbox && consentCheckbox.checked;

            loginSubmitBtn.disabled = !(isPhoneValid && isVerificationValid && isConsentChecked);
        }
    }

    // 监听登录表单提交事件
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // 模拟登录逻辑
            alert("This feature is currently unavailable. In a real app, you would be logged in now.");
            hideLoginModal();
        });
    }

    // 初始化登录按钮状态
    updateLoginButtonState();
});