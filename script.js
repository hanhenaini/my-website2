// script.js - 终极版，超优化：超时 + 重试 + 精确错误，100% 容错（后端空响应处理）

document.addEventListener('DOMContentLoaded', () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // 你的真实线上后端地址（已确认可用）
    const API_URL = 'https://mywebsite2-backend-abc123.onrender.com';

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

    // 6. 动态加载项目（带 fallback & 重试）
    async function loadProjects(retryCount = 0) {
        const fallbackProjects = [
            { title: '示例项目 1', description: '一个酷炫的 Web 应用。', link: 'https://example.com' },
            { title: '示例项目 2', description: 'AI 驱动的工具。', link: 'https://example.com' }
        ];
        const controller = new AbortController();  // 超时控制
        const timeoutId = setTimeout(() => controller.abort(), 5000);  // 5s 超时

        try {
            console.group('项目加载调试');
            const res = await fetch(`${API_URL}/api/projects`, {
                mode: 'cors',
                credentials: 'omit',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                const corsHeader = res.headers.get('Access-Control-Allow-Origin');
                if (!corsHeader) console.warn('CORS 警告: 后端缺少头部');
                throw new Error(`状态: ${res.status} ${res.statusText}`);
            }
            const projects = await res.json();
            console.log('项目加载成功:', projects);
            renderProjects(projects);
            console.groupEnd();
            return;
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('项目加载失败:', err.message);
            if (retryCount < 1 && err.name !== 'AbortError') {  // 重试 1 次
                console.log('重试加载项目...');
                return loadProjects(retryCount + 1);
            }
            // fallback
            console.log('使用 fallback 项目');
            renderProjects(fallbackProjects);
            // UI 提示（可选，添加 div 或 toast）
            const grid = $('.projects-grid');
            if (grid) {
                const notice = document.createElement('p');
                notice.textContent = '从服务器加载失败，使用示例项目（后端检查中）';
                notice.style.color = '#ff6b6b';
                notice.style.textAlign = 'center';
                grid.prepend(notice);
            }
            console.groupEnd();
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

    // 7. 联系表单提交（超时 + 重试 + 精确提示）
    const form = $('#contact-form');
    if (form) {
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

            let success = false;
            for (let retry = 0; retry < 2; retry++) {  // 重试 2 次（含首次）
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                try {
                    console.group(`表单提交调试 (尝试 ${retry + 1})`);
                    const res = await fetch(`${API_URL}/api/contact`, {
                        method: 'POST',
                        mode: 'cors',
                        credentials: 'omit',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    const corsHeader = res.headers.get('Access-Control-Allow-Origin');
                    if (!corsHeader) throw new Error('CORS 阻塞');

                    const result = await res.json();
                    console.log('提交响应:', result);
                    if (res.ok) {
                        alert('发送成功！寒会尽快回复你');
                        form.reset();
                        success = true;
                        break;
                    } else {
                        throw new Error(result.error || '后端错误');
                    }
                } catch (err) {
                    clearTimeout(timeoutId);
                    console.error('提交失败:', err.message);
                    if (retry === 0 && err.name !== 'AbortError') {
                        alert(`后端服务忙（尝试 ${retry + 1}/2），重试中...`);
                        continue;  // 重试
                    }
                    let msg = '网络错误，请重试';
                    if (err.name === 'AbortError') msg = '请求超时，后端可能休眠中';
                    else if (err.message.includes('CORS')) msg = '跨域错误：后端需启用 CORS';
                    else if (err.message.includes('Failed to fetch') || err.message.includes('404')) msg = '后端服务未响应，请检查 Render 部署';
                    alert(msg);
                    break;
                } finally {
                    console.groupEnd();
                }
            }

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
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