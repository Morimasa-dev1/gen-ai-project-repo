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
declare class ServerWorksWebsite {
    private contactForm;
    private navbar;
    private navLinks;
    constructor();
    private init;
    private setupEventListeners;
    private setupSmoothScrolling;
    private smoothScrollTo;
    private easeInOutQuad;
    private setupNavbarScrollEffect;
    private setupFormValidation;
    private handleFormSubmit;
    private getFormData;
    private validateForm;
    private isValidEmail;
    private validateField;
    private showFieldError;
    private clearFieldError;
    private displayErrors;
    private submitForm;
    private showSuccessMessage;
    private showErrorMessage;
    private handleNavClick;
    private updateActiveNavLink;
    private handleScroll;
    private handleResize;
}
export { ServerWorksWebsite };
export type { ContactFormData, ValidationResult };
