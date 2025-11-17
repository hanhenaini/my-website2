// script.js - 已全面升级，支持线上后端 + 修复所有问题

document.addEventListener('DOMContentLoaded', () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // ==================== 线上后端地址（关键！） ====================
    const API_URL = 'https://hanhenaini-backend-34e935e0abd0.herokuapp.com';

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

        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        applyTheme(isDark);

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
            nameDisplay.style.transition = 'transform 0.2s ease';
            nameDisplay.style.transform = 'scale(1.05)';
            clearTimeout(nameDisplay._timer);
            nameDisplay._timer = setTimeout(() => {
                nameDisplay.style.transform = 'scale(1)';
            }, 200);
        });

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

    // ==================== 4. Logo 动态切换 ====================
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

        logoContainer.addEventListener('mouseenter', () => {
            if (currentIndex === 0) showStyle(1);
        });
        logoContainer.addEventListener('mouseleave', () => {
            if (currentIndex === 1) showStyle(0);
        });

        showStyle(0);
    }

    // ==================== 5. 通用按钮点击反馈 ====================
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

    // ==================== 6. 动态加载项目（已修复地址） ====================
    async function loadProjects() {
        try {
            const res = await fetch(`${API_URL}/api/projects`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const projects = await res.json();
            const grid = document.querySelector('.projects-grid');
            if (!grid) return;
            grid.innerHTML = '';
            projects.forEach(p => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <a href="${p.link || '#'}" target="_blank" class="project-link">查看项目</a>
                `;
                grid.appendChild(card);
            });
        } catch (err) {
            console.error('加载项目失败:', err);
            document.querySelector('.projects-grid')?.insertAdjacentHTML('afterbegin', 
                '<p style="color: red; text-align: center;">项目加载失败（后端可能休眠）</p>');
        }
    }
    loadProjects();

    // ==================== 7. 联系表单提交（已修复地址 + 优化反馈） ====================
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: form.querySelector('input[name="name"]')?.value.trim() || '匿名',
                email: form.querySelector('input[name="email"]')?.value.trim() || '',
                message: form.querySelector('textarea[name="message"]')?.value.trim() || ''
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '发送中...';

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
                    $('#name-display').textContent = '陌生人';
                } else {
                    alert('发送失败：' + (result.error || '未知错误'));
                }
            } catch (err) {
                console.error('网络错误:', err);
                alert('网络连接失败，请检查网络后重试');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

// ==================== 导航栏滚动效果 ====================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});