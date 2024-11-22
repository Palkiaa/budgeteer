import { BudgetTracker } from './budgetTracker.js';
import { UI } from './ui.js';
import { ExpenseChart } from './chart.js';
import { TaxCalculator } from './taxCalculator.js';
import { CookieConsent } from './cookieConsent.js';
import { MyNavigation } from './navigation.js';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker
if ('serviceWorker' in navigator) {
    registerSW({
        immediate: true
    });
}
   // Handle PWA installation
    let deferredPrompt;

    window.acceptCookies = () => CookieConsent.accept();
    window.rejectCookies = () => CookieConsent.reject();
    window.closePrivacyPolicy = () => CookieConsent.hidePrivacyPolicy();
    window.privacyPolicy = () => CookieConsent.showPrivacyPolicy();
    window.navigationTo = (val) => MyNavigation.navigateTo(val);
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    const navigation = new MyNavigation();
    initPWA();
    // Initialize other components
    const budgetTracker = new BudgetTracker();
    const ui = new UI();
    const chart = new ExpenseChart();
    
    // Initialize cookie consent
    CookieConsent.init();

    initializeTooltips();

    // Load saved data
    budgetTracker.loadData();
    chart.updateChart(budgetTracker.getData());
    ui.displayData(budgetTracker.getData());
    // Initialize tax toggle
   
    initializeTaxToggle(budgetTracker, ui, chart);

    function initializeTaxToggle(budgetTracker, ui, chart) {
      
        const taxToggle = document.getElementById('taxToggle');
        const salaryInput = document.getElementById('salary');
        const netSalaryInput = document.getElementById('netSalaryInput');
        const salaryDetails = document.getElementById('salaryDetails');
        const salaryLabel = document.getElementById('salaryLabel');
    
        if (taxToggle && salaryInput && netSalaryInput) {
            // Load saved preference
            const savedUseTax = localStorage.getItem('useTax') !== 'false';
            taxToggle.checked = savedUseTax;
            
            // Set initial visibility
            updateSalaryInputs(savedUseTax);
    
            taxToggle.addEventListener('change', (e) => {
                const useTax = e.target.checked;
                updateSalaryInputs(useTax);
                localStorage.setItem('useTax', useTax);
    
                // Transfer value between inputs
                if (useTax && netSalaryInput.value) {
                    // Approximate gross from net (simplified)
                    salaryInput.value = (parseFloat(netSalaryInput.value) * 1.3).toFixed(2);
                } else if (!useTax && salaryInput.value) {
                    // Use actual net from tax calculation
                    const { netSalary } = TaxCalculator.calculateNetSalary(parseFloat(salaryInput.value), 30);
                    netSalaryInput.value = netSalary.toFixed(2);
                }
    
                // Update budget tracker with new value
                budgetTracker.updateSalary(useTax ? parseFloat(salaryInput.value) : parseFloat(netSalaryInput.value));
                budgetTracker.setUseTax(useTax);
                
                // Update UI
                ui.displayData(budgetTracker.getData());
                chart.updateChart(budgetTracker.getData());
            });
    
            // Handle salary input changes
            salaryInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) || 0;
                budgetTracker.updateSalary(value);
                ui.displayData(budgetTracker.getData());
                chart.updateChart(budgetTracker.getData());
            });
    
            // Handle net salary input changes
            netSalaryInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) || 0;
                budgetTracker.updateSalary(value);
                ui.displayData(budgetTracker.getData());
                chart.updateChart(budgetTracker.getData());
            });
        }
    }
    
    function updateSalaryInputs(useTax) {
        const grossContainer = document.getElementById('grossSalaryContainer');
        const netContainer = document.getElementById('netSalaryContainer');
        const salaryDetails = document.getElementById('salaryDetails');
        
        if (grossContainer && netContainer) {
            grossContainer.style.display = useTax ? 'block' : 'none';
            netContainer.style.display = useTax ? 'none' : 'block';
            if (salaryDetails) {
                salaryDetails.style.display = useTax ? 'block' : 'none';
            }
        }
    }


    document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
        const expense = ui.getExpenseInput();
        if (expense) {
            budgetTracker.addExpense(expense);
            ui.displayData(budgetTracker.getData());
            chart.updateChart(budgetTracker.getData());
            ui.clearExpenseInput();
        }
    });

    // Close side nav when clicking outside
    document.addEventListener('click', (e) => {
        const sideNav = document.getElementById('sideNav');
        const burgerMenu = document.getElementById('burgerMenu');
        
        if (!sideNav?.contains(e.target) && !burgerMenu?.contains(e.target)) {
            sideNav?.classList.remove('open');
            document.getElementById('overlay')?.classList.remove('show');
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
   

     function initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            tippy(element, {
                content: element.getAttribute('data-tooltip'),
                placement: 'right',
                theme: 'custom',
                arrow: true,
                animation: 'scale'
            });
        });
    }
    
    function initializeTaxToggle() {
        const taxToggle = document.getElementById('taxToggle');
        const grossSalaryInput = document.getElementById('grossSalary');
        const netSalaryInput = document.getElementById('netSalary');
        const salaryDetails = document.getElementById('salaryDetails');
    
        if (taxToggle) {
            taxToggle.addEventListener('change', () => {
                const useTax = taxToggle.checked;
                grossSalaryInput.style.display = useTax ? 'block' : 'none';
                netSalaryInput.style.display = useTax ? 'none' : 'block';
                salaryDetails.style.display = useTax ? 'block' : 'none';
                
                // Save preference
                localStorage.setItem('useTax', useTax);
            });
    
            // Load saved preference
            const savedUseTax = localStorage.getItem('useTax') === 'true';
            taxToggle.checked = savedUseTax;
            grossSalaryInput.style.display = savedUseTax ? 'block' : 'none';
            netSalaryInput.style.display = savedUseTax ? 'none' : 'block';
            salaryDetails.style.display = savedUseTax ? 'block' : 'none';
        }
    }


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