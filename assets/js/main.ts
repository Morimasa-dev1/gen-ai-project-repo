// 型定義
interface ContactFormData {
  name: string;
  company: string;
  email: string;
  subject: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// メインクラス
class ServerWorksWebsite {
  private contactForm: HTMLFormElement | null;
  private navbar: HTMLElement | null;

  constructor() {
    this.contactForm = document.getElementById('contactForm') as HTMLFormElement;
    this.navbar = document.querySelector('.navbar') as HTMLElement;
    this.init();
  }

  private init(): void {
    this.setupEventListeners();
    this.setupScrollEffects();
    this.setupSmoothScrolling();
    this.setupFormValidation();
  }

  private setupEventListeners(): void {
    // フォーム送信イベント
    if (this.contactForm) {
      this.contactForm.addEventListener('submit', (e: Event) => {
        this.handleFormSubmit(e);
      });
    }

    // ナビゲーションリンクのクリックイベント
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link: Element) => {
      link.addEventListener('click', (e: Event) => {
        this.handleNavClick(e);
      });
    });

    // ウィンドウリサイズイベント
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  private setupScrollEffects(): void {
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });
  }

  private handleScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // ナビゲーションバーの背景変更
    if (this.navbar) {
      if (scrollTop > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    }

    // パララックス効果
    this.updateParallaxEffect(scrollTop);
    
    // アクティブナビゲーションの更新
    this.updateActiveNavigation();
  }

  private updateParallaxEffect(scrollTop: number): void {
    const heroIcon = document.querySelector('.hero-icon') as HTMLElement;
    if (heroIcon) {
      const parallaxSpeed = 0.5;
      heroIcon.style.transform = `translateY(${scrollTop * parallaxSpeed}px)`;
    }
  }

  private updateActiveNavigation(): void {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach((section: Element) => {
      const sectionTop = (section as HTMLElement).offsetTop - 100;
      const sectionHeight = (section as HTMLElement).offsetHeight;
      
      if (window.pageYOffset >= sectionTop && 
          window.pageYOffset < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach((link: Element) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  private setupSmoothScrolling(): void {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach((link: Element) => {
      link.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (href) {
          const targetElement = document.querySelector(href);
          if (targetElement) {
            const offsetTop = (targetElement as HTMLElement).offsetTop - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  private handleNavClick(e: Event): void {
    const target = e.target as HTMLElement;
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    // モバイルメニューを閉じる
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const bsCollapse = new (window as any).bootstrap.Collapse(navbarCollapse);
      bsCollapse.hide();
    }
  }

  private setupFormValidation(): void {
    if (!this.contactForm) return;

    const inputs = this.contactForm.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input: Element) => {
      input.addEventListener('blur', () => {
        this.validateField(input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement);
      });
      
      input.addEventListener('input', () => {
        this.clearFieldError(input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement);
      });
    });
  }

  private validateField(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // 必須フィールドのチェック
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'この項目は必須です。';
    }

    // メールアドレスの形式チェック
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = '正しいメールアドレスを入力してください。';
      }
    }

    // エラー表示の更新
    this.updateFieldError(field, isValid, errorMessage);
    
    return isValid;
  }

  private updateFieldError(field: HTMLElement, isValid: boolean, errorMessage: string): void {
    const existingError = field.parentElement?.querySelector('.error-message');
    
    if (existingError) {
      existingError.remove();
    }

    if (!isValid) {
      field.classList.add('is-invalid');
      
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message text-danger small mt-1';
      errorElement.textContent = errorMessage;
      
      field.parentElement?.appendChild(errorElement);
    } else {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    }
  }

  private clearFieldError(field: HTMLElement): void {
    field.classList.remove('is-invalid');
    const errorElement = field.parentElement?.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  private handleFormSubmit(e: Event): void {
    e.preventDefault();
    
    if (!this.contactForm) return;

    const formData = this.getFormData();
    const validation = this.validateForm(formData);

    if (validation.isValid) {
      this.submitForm(formData);
    } else {
      this.displayValidationErrors(validation.errors);
    }
  }

  private getFormData(): ContactFormData {
    if (!this.contactForm) {
      throw new Error('Contact form not found');
    }

    const nameInput = this.contactForm.querySelector('#name') as HTMLInputElement;
    const companyInput = this.contactForm.querySelector('#company') as HTMLInputElement;
    const emailInput = this.contactForm.querySelector('#email') as HTMLInputElement;
    const subjectSelect = this.contactForm.querySelector('#subject') as HTMLSelectElement;
    const messageTextarea = this.contactForm.querySelector('#message') as HTMLTextAreaElement;

    return {
      name: nameInput?.value.trim() || '',
      company: companyInput?.value.trim() || '',
      email: emailInput?.value.trim() || '',
      subject: subjectSelect?.value || '',
      message: messageTextarea?.value.trim() || ''
    };
  }

  private validateForm(data: ContactFormData): ValidationResult {
    const errors: string[] = [];

    if (!data.name) {
      errors.push('お名前を入力してください。');
    }

    if (!data.email) {
      errors.push('メールアドレスを入力してください。');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('正しいメールアドレスを入力してください。');
      }
    }

    if (!data.subject) {
      errors.push('件名を選択してください。');
    }

    if (!data.message) {
      errors.push('お問い合わせ内容を入力してください。');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private displayValidationErrors(errors: string[]): void {
    // 既存のエラーメッセージを削除
    const existingAlert = document.querySelector('.alert-danger');
    if (existingAlert) {
      existingAlert.remove();
    }

    // エラーメッセージを表示
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger mt-3';
    alertElement.innerHTML = `
      <strong>入力エラー:</strong>
      <ul class="mb-0 mt-2">
        ${errors.map(error => `<li>${error}</li>`).join('')}
      </ul>
    `;

    this.contactForm?.appendChild(alertElement);

    // エラーメッセージまでスクロール
    alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private async submitForm(data: ContactFormData): Promise<void> {
    const submitButton = this.contactForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>送信中...';
    }

    try {
      // 実際の送信処理をシミュレート
      await this.simulateFormSubmission(data);
      
      this.displaySuccessMessage();
      this.resetForm();
      
    } catch (error) {
      this.displayErrorMessage('送信に失敗しました。しばらく後でもう一度お試しください。');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-send-fill me-2"></i>送信する';
      }
    }
  }

  private simulateFormSubmission(data: ContactFormData): Promise<void> {
    return new Promise((resolve) => {
      console.log('Form submission data:', data);
      setTimeout(resolve, 2000); // 2秒の遅延をシミュレート
    });
  }

  private displaySuccessMessage(): void {
    const successElement = document.createElement('div');
    successElement.className = 'alert alert-success mt-3';
    successElement.innerHTML = `
      <i class="bi bi-check-circle-fill me-2"></i>
      <strong>送信完了!</strong> お問い合わせありがとうございます。担当者より折り返しご連絡いたします。
    `;

    this.contactForm?.appendChild(successElement);
    successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 5秒後にメッセージを削除
    setTimeout(() => {
      successElement.remove();
    }, 5000);
  }

  private displayErrorMessage(message: string): void {
    const errorElement = document.createElement('div');
    errorElement.className = 'alert alert-danger mt-3';
    errorElement.innerHTML = `
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>エラー:</strong> ${message}
    `;

    this.contactForm?.appendChild(errorElement);
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private resetForm(): void {
    if (this.contactForm) {
      this.contactForm.reset();
      
      // バリデーションクラスを削除
      const fields = this.contactForm.querySelectorAll('.is-valid, .is-invalid');
      fields.forEach(field => {
        field.classList.remove('is-valid', 'is-invalid');
      });
      
      // エラーメッセージを削除
      const errorMessages = this.contactForm.querySelectorAll('.error-message');
      errorMessages.forEach(error => error.remove());
    }
  }

  private handleResize(): void {
    // ウィンドウリサイズ時の処理
    this.updateActiveNavigation();
  }
}

// アニメーション効果のクラス
class AnimationEffects {
  constructor() {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // アニメーション対象要素を監視
    const animateElements = document.querySelectorAll('.strength-card, .service-card');
    animateElements.forEach(el => {
      observer.observe(el);
    });
  }
}

// DOMContentLoaded時の初期化
document.addEventListener('DOMContentLoaded', () => {
  new ServerWorksWebsite();
  new AnimationEffects();
  
  // パフォーマンス最適化: 画像の遅延読み込み
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => imageObserver.observe(img));
  }
});

// エクスポート（モジュール使用時）
export { ServerWorksWebsite, AnimationEffects };
