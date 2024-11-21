import Cookies from 'js-cookie';

export class CookieConsent {
    static init() {
        if (!Cookies.get('cookieConsent')) {
            this.showConsentModal();
        }
    }

    static showConsentModal() {
        const modal = document.getElementById('cookieConsentModal');
        const backdrop = document.getElementById('cookieModalBackdrop');

        if (modal && backdrop) {
            modal.classList.add('show');
            modal.style.display = 'block';
            backdrop.style.display = 'block';
        }
    }

    static accept() {
        Cookies.set('cookieConsent', 'accepted', { expires: 365 });
        this.hideModal();
    }

    static reject() {
        Cookies.set('cookieConsent', 'rejected', { expires: 365 });
        this.hideModal();
    }

    static hideModal() {
        const modal = document.getElementById('cookieConsentModal');
        const backdrop = document.getElementById('cookieModalBackdrop');

        if (modal && backdrop) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            backdrop.style.display = 'none';
        }
    }

    static showPrivacyPolicy() {
        const modal = document.getElementById('privacy-policy-modal');
        const backdrop = document.getElementById('modal-backdrop');

        if (modal && backdrop) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            backdrop.classList.add('show');
            backdrop.style.display = 'block';
        }
    }

    static hidePrivacyPolicy() {
        const modal = document.getElementById('privacy-policy-modal');
        const backdrop = document.getElementById('modal-backdrop');

        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
        if (backdrop) {
            backdrop.classList.remove('show');
            backdrop.style.display = 'none';
        }
    }
}