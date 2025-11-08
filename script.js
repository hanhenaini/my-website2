// script.js - 所有交互逻辑

document.addEventListener('DOMContentLoaded', function () {
    // 欢迎弹窗（可选）
    // alert("网站加载成功！欢迎访问寒的个人主页");

    // ========== 下载按钮反馈（只写一次！）==========
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            const originalText = this.textContent;
            this.textContent = '下载中...';
            this.style.pointerEvents = 'none'; // 防止重复点击

            setTimeout(() => {
                this.textContent = originalText;
                this.style.pointerEvents = 'auto';
            }, 1500);
        });
    }

    // ========== 暗黑模式切换 ==========
    const toggleButton = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun');
    const moonIcon = document.querySelector('.moon');
    const body = document.body;

    if (toggleButton && sunIcon && moonIcon) {
        if (localStorage.getItem('theme') === 'dark') {
            body.classList.add('dark-mode');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline';
        }

        toggleButton.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            sunIcon.style.display = isDark ? 'none' : 'inline';
            moonIcon.style.display = isDark ? 'inline' : 'none';
        });
    }

    // ========== 其他按钮点击反馈（可选）==========
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        // 排除 download-btn，避免重复
        if (btn.id !== 'download-btn') {
            btn.addEventListener('click', function () {
                this.classList.add('clicked');
                this.textContent = '已点击！';

                setTimeout(() => {
                    this.classList.remove('clicked');
                    this.textContent = '联系我'; // 或原始文字
                }, 1000);
            });
        }
    });
});
// === 事件监听：输入框实时显示 ===
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name-input');
    const nameDisplay = document.getElementById('name-display');

    // 监听输入事件
    nameInput.addEventListener('input', () => {
        const value = nameInput.value.trim();
        nameDisplay.textContent = value || '陌生人';

        // 可选：加动画
        nameDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            nameDisplay.style.transform = 'scale(1)';
        }, 200);
    });

    // 可选：按 Enter 提交（增强体验）
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            nameInput.blur(); // 收起键盘
        }
    });
});