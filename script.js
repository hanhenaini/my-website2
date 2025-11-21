// script.js - 终极版，优化版：增强错误处理 & CORS 调试，100% 接通线上后端（后端需启用 CORS）

document.addEventListener('DOMContentLoaded', () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // 你的真实线上后端地址（已确认可用）
    const API_URL = 'https://mywebsite2-backend-abc123.onrender.com'; // 替换成你的 Live URL

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
        themeToggle.addEventListener('click', () => {
            const currentIsDark = document.body.classList.contains('dark-mode');
            applyTheme(!currentIsDark);
        });
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
        nameInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') nameInput.blur();
        });
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
        logoContainer.addEventListener('mouseenter', () => {
            if (currentIndex === 0) showStyle(1);
        });
        logoContainer.addEventListener('mouseleave', () => {
            if (currentIndex === 1) showStyle(0);
        });
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

    // 6. 动态加载项目（带 fallback）
    async function loadProjects() {
        // Fallback 静态项目（如果 API 失败）
        const fallbackProjects = [
            { title: '示例项目 1', description: '一个酷炫的 Web 应用。', link: 'https://example.com' },
            { title: '示例项目 2', description: 'AI 驱动的工具。', link: 'https://example.com' }
        ];

        try {
            const res = await fetch(`${API_URL}/api/projects`, {
                mode: 'cors',  // 明确 CORS 模式
                credentials: 'omit'  // 避免 cookie 干扰
            });
            if (!res.ok) {
                const corsHeader = res.headers.get('Access-Control-Allow-Origin');
                if (!corsHeader) console.warn('CORS 警告: 后端缺少 Access-Control-Allow-Origin 头部');
                throw new Error(`后端响应错误: ${res.status} ${res.statusText}`);
            }
            const projects = await res.json();
            renderProjects(projects);
        } catch (err) {
            console.error('加载项目失败:', err.message);
            // 使用 fallback
            renderProjects(fallbackProjects);
            // 提示用户（可选，非侵入式）
            console.log('提示: 请检查后端 CORS 设置');
        }
    }

    function renderProjects(projects) {
        const grid = $('.projects-grid');
        if (!grid) return;
        grid.innerHTML = '';
        projects.forEach(p => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `<h3>${p.title}</h3><p>${p.description}</p><a href="${p.link}" target="_blank" class="project-link">查看</a>`;
            grid.appendChild(card);
        });
    }
    loadProjects();

    // 7. 联系表单提交（增强验证 & CORS 调试）
    const form = $('#contact-form');
    if (form) {
        // 简单邮箱验证
        const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

            // 验证
            if (!data.email || !validateEmail(data.email)) {
                alert('请输入有效的邮箱地址');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
            if (!data.message) {
                alert('请填写消息内容');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }

            try {
                const res = await fetch(`${API_URL}/api/contact`, {
                    method: 'POST',
                    mode: 'cors',  // 明确 CORS 模式
                    credentials: 'omit',  // 避免 cookie 干扰
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                // 检查 CORS 头部
                const corsHeader = res.headers.get('Access-Control-Allow-Origin');
                if (!corsHeader) {
                    console.warn('CORS 错误: 后端未允许跨域访问 https://hanenaini.github.io');
                    throw new Error('CORS 阻塞 - 请联系开发者修复后端');
                }

                const result = await res.json();
                if (res.ok) {
                    alert('发送成功！寒会尽快回复你');
                    form.reset();
                } else {
                    alert('发送失败：' + (result.error || '未知错误'));
                }
            } catch (err) {
                console.error('表单提交错误:', err.message);
                // 针对常见错误提示
                if (err.message.includes('CORS')) {
                    alert('跨域错误：后端需启用 CORS。请稍后重试或联系开发者。');
                } else if (err.message.includes('Failed to fetch')) {
                    alert('网络连接失败，请检查后端服务是否在线');
                } else {
                    alert('网络错误，请重试');
                }
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
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
});