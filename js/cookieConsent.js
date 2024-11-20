import Cookies from 'js-cookie';

export class CookieConsent {
    static init() {
        if (!Cookies.get('cookieConsent')) {
            this.showConsentModal();
        }
    }

    static showConsentModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Cookie Consent</h5>
                    </div>
                    <div class="modal-body">
                        <p>We use cookies to enhance your experience and save your preferences. No personal data is collected or shared.</p>
                        <p>For more information, please read our <a href="#" onclick="window.privacyPolicy()">Privacy Policy</a>.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="window.rejectCookies()">Reject</button>
                        <button type="button" class="btn btn-primary" onclick="window.acceptCookies()">Accept</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
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
        const modal = document.querySelector('.modal');
        const backdrop = document.querySelector('.modal-backdrop');
        if (modal) document.body.removeChild(modal);
        if (backdrop) document.body.removeChild(backdrop);
    }

    static showPrivacyPolicy() {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-scrollable modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Privacy Policy</h5>
                        <button type="button" class="btn-close" onclick="window.closePrivacyPolicy()"></button>
                    </div>
                    <div class="modal-body">
                        <h2>Privacy Policy for Budget ZA</h2>
                        <p>Last updated: ${new Date().toLocaleDateString()}</p>

                        <h3>1. Introduction</h3>
                        <p>Budget ZA ("we", "our", or "us") respects your privacy and is committed to protecting it through our compliance with POPIA (Protection of Personal Information Act).</p>

                        <h3>2. Information We Don't Collect</h3>
                        <p>We do not collect, store, or process any personal information. All data is stored locally on your device.</p>

                        <h3>3. Cookies</h3>
                        <p>We use only essential cookies to remember your preferences and provide basic functionality. No tracking or marketing cookies are used.</p>

                        <h3>4. POPIA Compliance</h3>
                        <p>We adhere to all POPIA principles:
                            <ul>
                                <li>Accountability: We take responsibility for data protection</li>
                                <li>Processing Limitation: We only process what's necessary</li>
                                <li>Purpose Specification: Cookies are used only for functionality</li>
                                <li>Further Processing Limitation: No data sharing or selling</li>
                                <li>Information Quality: All data stays on your device</li>
                                <li>Openness: Full transparency about our practices</li>
                                <li>Security Safeguards: Local storage only</li>
                                <li>Data Subject Participation: You control your data</li>
                            </ul>
                        </p>

                        <h3>5. Advertising</h3>
                        <p>We may display ads to keep this service free. These ads are managed by third parties and do not use your personal data.</p>

                        <h3>6. Contact</h3>
                        <p>For any privacy-related questions, please contact us at privacy@budgetza.co.za</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
    }
}