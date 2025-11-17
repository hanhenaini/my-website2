// script.js - 终极版，100% 接通线上后端

document.addEventListener('DOMContentLoaded', () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // 你的真实线上后端地址（已确认可用）
    const API_URL = 'https://hanhenaini-backend-34e935e0abd0.herokuapp.com';

    // 1. 主题切换
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
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        applyTheme(isDark);
        themeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('dark-mode')));
    }

    // 2. 实时打招呼
    const nameInput = $('#name-input');
    const nameDisplay = $('#name-display');
    if (nameInput && nameDisplay) {
        nameInput.addEventListener('input', () => {
            const name = nameInput.value.trim();
            nameDisplay.textContent = name || '陌生人';
            nameDisplay.style.transition = 'transform 0.2s ease';
            nameDisplay.style.transform = 'scale(1.05)';
            clearTimeout(nameDisplay._timer);
            nameDisplay._timer = setTimeout(() => nameDisplay.style.transform = 'scale(1)', 200);
        });
        nameInput.addEventListener('keydown', e => e.key === 'Enter' && nameInput.blur());
    }

    // 3. 下载按钮
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

    // 4. Logo 切换
    const logoContainer = $('.logo-container');
    const logoStyles = ['style-1', 'style-2', 'style-3'];
    let currentIndex = 0;
    if (logoContainer) {
        const showStyle = (i) => {
            $$(`.logo-text`).forEach(el => el.style.opacity = '0');
            $(`.${logoStyles[i]}`).style.opacity = '1';
        };
        logoContainer.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % 3;
            showStyle(currentIndex);
        });
        logoContainer.addEventListener('mouseenter', () => currentIndex === 0 && showStyle(1));
        logoContainer.addEventListener('mouseleave', () => currentIndex === 1 && showStyle(0));
        showStyle(0);
    }

    // 5. 按钮点击反馈
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

    // 6. 动态加载项目
    async function loadProjects() {
        try {
            const res = await fetch(`${API_URL}/api/projects`);
            if (!res.ok) throw new Error('后端错误');
            const projects = await res.json();
            const grid = $('.projects-grid');
            if (!grid) return;
            grid.innerHTML = '';
            projects.forEach(p => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `<h3>${p.title}</h3><p>${p.description}</p><a href="${p.link}" target="_blank" class="project-link">查看</a>`;
                grid.appendChild(card);
            });
        } catch (err) {
            console.error('加载项目失败:', err);
        }
    }
    loadProjects();

    // 7. 联系表单提交
    const form = $('#contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '发送中...';

            const data = {
                name: form.name.value.trim() || '匿名',
                email: form.email.value.trim(),
                message: form.message.value.trim()
            };

            try {
                const res = await fetch(`${API_URL}/api/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await res.json();
                if (res.ok) {
                    alert('发送成功！寒会尽快回复你');
                    form.reset();
                } else {
                    alert('发送失败：' + (result.error || '未知错误'));
                }
            } catch (err) {
                alert('网络错误，请重试');
                console.error(err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

// 滚动检测
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});