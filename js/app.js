import { BudgetTracker } from './budgetTracker.js';
import { UI } from './ui.js';
import { ExpenseChart } from './chart.js';
import { TaxCalculator } from './taxCalculator.js';
import { CookieConsent } from './cookieConsent.js';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker
if ('serviceWorker' in navigator) {
    registerSW();
}

// Define global functions before DOMContentLoaded
window.acceptCookies = () => CookieConsent.accept();
window.rejectCookies = () => CookieConsent.reject();
window.closePrivacyPolicy = () => CookieConsent.hidePrivacyPolicy();
window.privacyPolicy = () => CookieConsent.showPrivacyPolicy();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cookie consent
    CookieConsent.init();

    // Initialize main components
    const budgetTracker = new BudgetTracker();
    const ui = new UI();
    const chart = new ExpenseChart();

    let deferredPrompt; // Declare deferredPrompt variable

    // Event listener for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the default install prompt from showing
        e.preventDefault();
        deferredPrompt = e;
        // Show the custom install prompt (text + button)
        document.getElementById('pwaInstall')?.classList.remove('d-none');
    });
    
    // Event listener for the install button click
    document.getElementById('pwaInstallBtn')?.addEventListener('click', () => {
        if (deferredPrompt) {
            // Show the native install prompt
            deferredPrompt.prompt();
            
            // Handle the user's choice (accept or dismiss)
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                // Reset deferredPrompt to null and hide the custom prompt
                deferredPrompt = null;
                document.getElementById('pwaInstall')?.classList.add('d-none');
            });
        }
    });
    
    
    // Load saved data
    budgetTracker.loadData();
    
    // Ensure DOM elements exist before updating
    requestAnimationFrame(() => {
        ui.displayData(budgetTracker.getData());
        chart.updateChart(budgetTracker.getData());
    });

    let salaryTimeout;
    // Handle user typing dynamically
    document.getElementById('salary')?.addEventListener('input', (e) => {
        clearTimeout(salaryTimeout);
        salaryTimeout = setTimeout(() => {
            const grossSalary = parseFloat(e.target.value) || 0;
            budgetTracker.updateSalaryDetails(grossSalary);
        }, 300);
    });

    var tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Event listeners for expense management
    document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
        const expense = ui.getExpenseInput();
        if (expense) {
            budgetTracker.addExpense(expense);
            ui.displayData(budgetTracker.getData());
            chart.updateChart(budgetTracker.getData());
            ui.clearExpenseInput();
        }
    });

    document.addEventListener('addSubExpense', (e) => {
        const { parentIndex, subExpense } = e.detail;
        budgetTracker.addSubExpense(parentIndex, subExpense);
        ui.displayData(budgetTracker.getData());
        chart.updateChart(budgetTracker.getData());
    });

    document.addEventListener('removeSubExpense', (e) => {
        const { parentIndex, subIndex } = e.detail;
        budgetTracker.removeSubExpense(parentIndex, subIndex);
        ui.displayData(budgetTracker.getData());
        chart.updateChart(budgetTracker.getData());
    });

    // Income management
    document.getElementById('addIncomeBtn')?.addEventListener('click', () => {
        ui.showIncomeModal();
    });

    document.getElementById('submitIncomeBtn')?.addEventListener('click', () => {
        const income = ui.getIncomeInput();
        if (income) {
            budgetTracker.addIncome(income);
            ui.displayData(budgetTracker.getData());
            chart.updateChart(budgetTracker.getData());
            ui.clearIncomeInput();
            ui.hideIncomeModal();
        }
    });

    document.addEventListener('removeIncome', (e) => {
        budgetTracker.removeIncome(e.detail);
        ui.displayData(budgetTracker.getData());
        chart.updateChart(budgetTracker.getData());
    });

    // Modal handling
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            ui.hideIncomeModal();
        }
    });

    document.querySelector('.close')?.addEventListener('click', () => {
        ui.hideIncomeModal();
    });
});