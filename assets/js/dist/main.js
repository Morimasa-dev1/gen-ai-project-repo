// メインクラス
class ServerWorksWebsite {
    constructor() {
        this.contactForm = document.getElementById('contactForm');
        this.navbar = document.querySelector('.navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }
    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.setupNavbarScrollEffect();
        this.setupFormValidation();
    }
    setupEventListeners() {
        // フォーム送信イベント
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        // ナビゲーションリンクのクリックイベント
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });
        // スクロールイベント
        window.addEventListener('scroll', this.handleScroll.bind(this));
        // リサイズイベント
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    setupSmoothScrolling() {
        // CSS scroll-behaviorをサポートしていない場合のフォールバック
        if (!('scrollBehavior' in document.documentElement.style)) {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = link.getAttribute('href');
                    if (target && target.startsWith('#')) {
                        const element = document.querySelector(target);
                        if (element) {
                            this.smoothScrollTo(element);
                        }
                    }
                });
            });
        }
    }
    smoothScrollTo(element) {
        const targetPosition = element.offsetTop - 80; // ナビバーの高さを考慮
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;
        const animation = (currentTime) => {
            if (start === null)
                start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration)
                requestAnimationFrame(animation);
        };
        requestAnimationFrame(animation);
    }
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    setupNavbarScrollEffect() {
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (this.navbar) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // 下にスクロール時はナビバーを隠す
                    this.navbar.style.transform = 'translateY(-100%)';
                }
                else {
                    // 上にスクロール時はナビバーを表示
                    this.navbar.style.transform = 'translateY(0)';
                }
                // スクロール位置に応じて背景の透明度を調整
                const opacity = Math.min(scrollTop / 100, 1);
                this.navbar.style.backgroundColor = `rgba(255, 255, 255, ${0.95 + opacity * 0.05})`;
            }
            lastScrollTop = scrollTop;
        });
    }
    setupFormValidation() {
        if (!this.contactForm)
            return;
        const inputs = this.contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }
    handleFormSubmit(e) {
        e.preventDefault();
        if (!this.contactForm)
            return;
        const formData = this.getFormData();
        const validation = this.validateForm(formData);
        if (validation.isValid) {
            this.submitForm(formData);
        }
        else {
            this.displayErrors(validation.errors);
        }
    }
    getFormData() {
        if (!this.contactForm) {
            throw new Error('Contact form not found');
        }
        return {
            name: this.contactForm.elements.name.value.trim(),
            company: this.contactForm.elements.company.value.trim(),
            email: this.contactForm.elements.email.value.trim(),
            subject: this.contactForm.elements.subject.value,
            message: this.contactForm.elements.message.value.trim()
        };
    }
    validateForm(data) {
        const errors = [];
        // 必須フィールドの検証
        if (!data.name) {
            errors.push('お名前は必須です。');
        }
        if (!data.email) {
            errors.push('メールアドレスは必須です。');
        }
        else if (!this.isValidEmail(data.email)) {
            errors.push('有効なメールアドレスを入力してください。');
        }
        if (!data.subject) {
            errors.push('件名を選択してください。');
        }
        if (!data.message) {
            errors.push('お問い合わせ内容は必須です。');
        }
        else if (data.message.length < 10) {
            errors.push('お問い合わせ内容は10文字以上で入力してください。');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        switch (field.id) {
            case 'name':
                if (!value) {
                    isValid = false;
                    errorMessage = 'お名前は必須です。';
                }
                break;
            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'メールアドレスは必須です。';
                }
                else if (!this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = '有効なメールアドレスを入力してください。';
                }
                break;
            case 'subject':
                if (!value) {
                    isValid = false;
                    errorMessage = '件名を選択してください。';
                }
                break;
            case 'message':
                if (!value) {
                    isValid = false;
                    errorMessage = 'お問い合わせ内容は必須です。';
                }
                else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'お問い合わせ内容は10文字以上で入力してください。';
                }
                break;
        }
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }
        else {
            this.clearFieldError(field);
        }
    }
    showFieldError(field, message) {
        field.classList.add('is-invalid');
        let errorElement = field.parentElement?.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            field.parentElement?.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorElement = field.parentElement?.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.remove();
        }
    }
    displayErrors(errors) {
        // エラーメッセージを表示するアラートを作成
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alertDiv.innerHTML = `
      <strong>入力エラーがあります:</strong>
      <ul class="mb-0 mt-2">
        ${errors.map(error => `<li>${error}</li>`).join('')}
      </ul>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
        // 既存のアラートを削除
        const existingAlert = this.contactForm?.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        // 新しいアラートを挿入
        this.contactForm?.insertBefore(alertDiv, this.contactForm.firstChild);
        // アラートまでスクロール
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    async submitForm(data) {
        const submitButton = this.contactForm?.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>送信中...';
        }
        try {
            // 実際のAPIエンドポイントがある場合はここで送信
            // const response = await fetch('/api/contact', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(data)
            // });
            // デモ用の遅延
            await new Promise(resolve => setTimeout(resolve, 2000));
            // 成功メッセージを表示
            this.showSuccessMessage();
            // フォームをリセット
            this.contactForm?.reset();
        }
        catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage('送信中にエラーが発生しました。しばらく後でもう一度お試しください。');
        }
        finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '送信する';
            }
        }
    }
    showSuccessMessage() {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show mt-3';
        alertDiv.innerHTML = `
      <strong>送信完了!</strong> お問い合わせありがとうございます。担当者より2営業日以内にご連絡いたします。
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
        // 既存のアラートを削除
        const existingAlert = this.contactForm?.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        this.contactForm?.insertBefore(alertDiv, this.contactForm.firstChild);
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showErrorMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alertDiv.innerHTML = `
      <strong>エラー:</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
        const existingAlert = this.contactForm?.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        this.contactForm?.insertBefore(alertDiv, this.contactForm.firstChild);
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    handleNavClick(e) {
        const link = e.target;
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            // アクティブなナビリンクの更新
            this.updateActiveNavLink(link);
        }
    }
    updateActiveNavLink(activeLink) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
    handleScroll() {
        // スクロール位置に基づいてアクティブなナビリンクを更新
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const sectionElement = section;
            const sectionTop = sectionElement.offsetTop;
            const sectionHeight = sectionElement.offsetHeight;
            const sectionId = sectionElement.getAttribute('id');
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    handleResize() {
        // リサイズ時の処理（必要に応じて追加）
        console.log('Window resized');
    }
}
// DOMContentLoaded時にアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    new ServerWorksWebsite();
});
// TypeScriptの型チェック用のエクスポート（実際には使用されない）
export { ServerWorksWebsite };
//# sourceMappingURL=main.js.map