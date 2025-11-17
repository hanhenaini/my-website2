// script.js - 完全适配线上后端版（已测试可用）

document.addEventListener('DOMContentLoaded', () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // 你的线上后端地址（关键！）
    const API_URL = 'https://hanhenaini-backend-34e935e0abd0.herokuapp.com';

    // ==================== 1. 主题切换 ====================
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

    // ==================== 2. 实时打招呼 ====================
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

    // ==================== 4. Logo 切换 ====================
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

    // ==================== 5. 动态加载项目（已接通线上后端） ====================
    async function loadProjects() {
        try {
            const res = await fetch(`${API_URL}/api/projects`);
            if (!res.ok) throw new Error('后端返回错误');
            const projects = await res.json();
            const grid = $('.projects-grid');
            if (!grid) return;
            grid.innerHTML = '';
            projects.forEach(p => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <a href="${p.link || '#'}" target="_blank" class="project-link">查看项目 →</a>
                `;
                grid.appendChild(card);
            });
        } catch (err) {
            console.error('加载项目失败:', err);
            $('.projects-grid')?.insertAdjacentHTML('afterbegin', 
                '<p style="color:#e74c3c;text-align:center;">项目加载失败（后端可能在唤醒中）</p>');
        }
    }
    loadProjects();

    // ==================== 6. 联系表单提交（已接通线上后端） ====================
    const form = $('.contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '发送中...';

            const data = {
                name: form.querySelector('input[name="name"]')?.value.trim() || '匿名',
                email: form.querySelector('input[name="email"]')?.value.trim() || '',
                message: form.querySelector('textarea[name="message"]')?.value.trim() || ''
            };

            try {
                const res = await fetch(`${API_URL}/api/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await res.json();
                if (res.ok) {
                    alert('发送成功！寒会尽快回复你~');
                    form.reset();
                    $('#name-display').textContent = '陌生人';
                } else {
                    alert('发送失败：' + (result.error || '未知错误'));
                }
            } catch (err) {
                alert('网络错误，请检查网络后重试');
                console.error(err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

// 导航栏滚动变色
window.addEventListener('scroll', () => {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
});