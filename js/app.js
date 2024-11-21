import { BudgetTracker } from './budgetTracker.js';
import { UI } from './ui.js';
import { ExpenseChart } from './chart.js';
import { TaxCalculator } from './taxCalculator.js';
import { CookieConsent } from './cookieConsent.js';
import { Navigation } from './navigation.js';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker
if ('serviceWorker' in navigator) {
    registerSW({
        immediate: true
    });
}
   // Handle PWA installation
    let deferredPrompt;
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    const navigation = new Navigation();

    // Initialize other components
    const budgetTracker = new BudgetTracker();
    const ui = new UI();
    const chart = new ExpenseChart();
    
    // Initialize cookie consent
    CookieConsent.init();

    // Load saved data
    budgetTracker.loadData();
    
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Event Listeners
    document.getElementById('addExpenseBtn').addEventListener('click', () => {
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

    document.getElementById('addIncomeBtn').addEventListener('click', () => {
        ui.showIncomeModal();
    });

    document.getElementById('submitIncomeBtn').addEventListener('click', () => {
        const income = ui.getIncomeInput();
        if (income) {
            budgetTracker.addIncome(income);
            ui.displayData(budgetTracker.getData());
            chart.updateChart(budgetTracker.getData());
            ui.hideIncomeModal();
        }
    });

    document.getElementById('salary').addEventListener('input', (e) => {
        budgetTracker.updateSalary(parseFloat(e.target.value) || 0);
        ui.displayData(budgetTracker.getData());
        chart.updateChart(budgetTracker.getData());
    });

    document.addEventListener('removeExpense', (e) => {
        budgetTracker.removeExpense(e.detail);
        ui.displayData(budgetTracker.getData());
        chart.updateChart(budgetTracker.getData());
    });

    document.addEventListener('removeIncome', (e) => {
        budgetTracker.removeIncome(e.detail);
        ui.displayData(budgetTracker.getData());
        chart.updateChart(budgetTracker.getData());
    });

 
    function initPWA() {
        const installButton = document.getElementById('pwaInstallBtn');
      
        // For iOS, show a custom install message
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
          showInstallInstructions();
          return;
        }
      
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
          document.getElementById('pwaInstall').style.display = 'none';
          return;
        } else {
          document.getElementById('pwaInstall').style.display = 'block';
        }
      
        // Android install logic
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          deferredPrompt = e;
          if (installButton) {
            installButton.style.display = 'block';
          }
        });
      
        installButton?.addEventListener('click', async () => {
          if (!deferredPrompt) {
            return;
          }
      
          try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
          } catch (error) {
            console.error('Error during installation:', error);
          }
      
          deferredPrompt = null;
          installButton.style.display = 'none';
        });
      
        window.addEventListener('appinstalled', () => {
          console.log('PWA installed successfully');
          installButton.style.display = 'none';
        });
      }
      
      function showInstallInstructions() {
        const installBanner = document.getElementById('installBanner');
        if (installBanner) {
          installBanner.style.display = 'block';
        }

        const closeButton = document.getElementById('closeInstallBanner');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            installBanner.style.display = 'none';
          });
        }
      }
      
      initPWA();

    // Grocery List Functionality
    document.getElementById('viewGroceryList').addEventListener('click', () => {
        document.getElementById('groceryModal').style.display = 'block';
    });
    
    document.getElementById('closeGroceryModal').addEventListener('click', () => {
        document.getElementById('groceryModal').style.display = 'none';
    });
    
    function renderGroceryList() {
        const tbody = document.getElementById('groceryList');
        tbody.innerHTML = '';
    
        budgetTracker.getGroceries().forEach((item, index) => {
            const row = document.createElement('tr');
            row.style.textDecoration = item.done ? 'line-through' : 'none';
    
            row.innerHTML = `
                <td>${item?.name}</td>
                <td>${item?.price?.toFixed(2)}</td>
                <td>
                    <i style="color:black" class="fas fa-minus" onclick="updateQuantity(${index}, -1)"></i>
                    ${item?.quantity}
                     <i style="color:black" class="fas fa-plus" onclick="updateQuantity(${index}, 1)"></i>
                </td>
                <td><input type="checkbox" ${item?.done ? 'checked' : ''} onchange="toggleDone(${index})" /></td>
                <td><i onclick="removeGrocery(${index})" class="fas fa-trash"></i></td>
            `;
            tbody.appendChild(row);
        });
    }

    window.removeGrocery = function (index) {
        budgetTracker.removeGrocery(index);
        renderGroceryList();
    };
    
    window.updateQuantity = function(index, change) {
        const groceries = budgetTracker.getGroceries();
        if(!groceries[index].done) {
            if (groceries[index].quantity + change > 0) {
                groceries[index].quantity += change;
                budgetTracker.saveData();
                renderGroceryList();
            }
        }
    };
    
    window.toggleDone = function(index) {
        const groceries = budgetTracker.getGroceries();
        groceries[index].done = !groceries[index].done;
        budgetTracker.saveData();
        renderGroceryList();
    };
    
    document.getElementById('saveGroceryItem').addEventListener('click', () => {
        const name = document.getElementById('groceryName').value.trim();
        const price = parseFloat(document.getElementById('groceryPrice').value);
        const quantity = parseInt(document.getElementById('groceryQuantity').value, 10);
    
        if (name && !isNaN(price) && quantity > 0) {
            const newGrocery = { name, price, quantity, done: false };
            budgetTracker.addGroceries(newGrocery);
            renderGroceryList();
    
            // Clear inputs
            document.getElementById('groceryName').value = '';
            document.getElementById('groceryPrice').value = '';
            document.getElementById('groceryQuantity').value = '';
        } else {
            alert('Please fill all fields with valid data.');
        }
    });
    
    document.getElementById('resetGroceryList').addEventListener('click', () => {
        budgetTracker.groceries = [];
        budgetTracker.saveData();
        renderGroceryList();
    });
    
    // Initial render
    renderGroceryList();
});