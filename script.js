// script.js - 精简、高效、模块化交互逻辑

document.addEventListener('DOMContentLoaded', () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // ==================== 1. 主题切换（带本地持久化） ====================
    const themeToggle = $('#theme-toggle');
    const sunIcon = $('.sun');
    const moonIcon = $('.moon');

    if (themeToggle && sunIcon && moonIcon) {
        const applyTheme = (isDark) => {
            document.body.classList.toggle('dark-mode', isDark);
            sunIcon.style.display = isDark ? 'none' : 'inline';
            moonIcon.style.display = isDark ? 'inline' : 'none';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        };

        // 初始化
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        applyTheme(isDark);

        // 点击切换
        themeToggle.addEventListener('click', () => {
            applyTheme(!document.body.classList.contains('dark-mode'));
        });
    }

    // ==================== 2. 实时打招呼（带动画） ====================
    const nameInput = $('#name-input');
    const nameDisplay = $('#name-display');

    if (nameInput && nameDisplay) {
        nameInput.addEventListener('input', () => {
            const name = nameInput.value.trim();
            nameDisplay.textContent = name || '陌生人';

            // 轻微放大动画
            nameDisplay.style.transition = 'transform 0.2s ease';
            nameDisplay.style.transform = 'scale(1.05)';
            clearTimeout(nameDisplay._timer);
            nameDisplay._timer = setTimeout(() => {
                nameDisplay.style.transform = 'scale(1)';
            }, 200);
        });

        // Enter 键失焦
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') nameInput.blur();
        });
    }

    // ==================== 3. 下载按钮反馈 ====================
    const downloadBtn = $('#download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            const original = this.textContent;
            this.textContent = '下载中...';
            this.disabled = true;

            setTimeout(() => {
                this.textContent = original;
                this.disabled = false;
            }, 1500);
        });
    }

    // ==================== 4. Logo 动态切换（点击循环） ====================
    const logoContainer = $('.logo-container');
    const logoStyles = ['style-1', 'style-2', 'style-3'];
    let currentIndex = 0;

    if (logoContainer) {
        const showStyle = (index) => {
            $$(`.logo-text`).forEach(el => el.style.opacity = '0');
            $(`.${logoStyles[index]}`).style.opacity = '1';
        };

        logoContainer.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % logoStyles.length;
            showStyle(currentIndex);
        });

        // 鼠标悬停：1 → 2，离开回 1
        logoContainer.addEventListener('mouseenter', () => {
            if (currentIndex === 0) showStyle(1);
        });
        logoContainer.addEventListener('mouseleave', () => {
            if (currentIndex === 1) showStyle(0);
        });

        // 初始化
        showStyle(0);
    }

    // ==================== 5. 通用按钮点击反馈（排除 download-btn） ====================
    $$('.btn').forEach(btn => {
        if (btn.id === 'download-btn') return;

        btn.addEventListener('click', function () {
            const original = this.textContent;
            this.classList.add('clicked');
            this.textContent = '已点击！';

            setTimeout(() => {
                this.classList.remove('clicked');
                this.textContent = original;
            }, 800);
        });
    });
});