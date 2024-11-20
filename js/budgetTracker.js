import { TaxCalculator } from "./taxCalculator";
export class BudgetTracker {
    constructor() {
        this.expenses = [];
        this.additionalIncomes = [];
        this.salary = 0;
        this.netSalary = 0;
        this.initSalaryInputListener();
    }

        /**
     * Initializes the salary input listener to dynamically update salary details.
     */
        initSalaryInputListener() {
            const salaryInput = document.getElementById('salary');
            if (salaryInput) {
                let salaryTimeout;
                salaryInput.addEventListener('input', (e) => {
                    clearTimeout(salaryTimeout);
                    salaryTimeout = setTimeout(() => {
                        const grossSalary = parseFloat(e.target.value) || 0;
                        this.updateSalaryDetails(grossSalary);
                    }, 300);
                });
            }
        }
    
        /**
         * Updates salary details, including tax, UIF, and net salary, and updates the UI.
         * @param {number} grossSalary - The gross monthly salary.
         */
        updateSalaryDetails(grossSalary) {
            this.updateSalary(grossSalary);
            const ageCategory = document.getElementById('ageCategory').value;
            let age;
            switch(ageCategory) {
                case 'under65': age = 30; break;
                case '65to74': age = 70; break;
                case '75andOver': age = 80; break;
            }
        
            const { tax, UIF, netSalary } = TaxCalculator.calculateNetSalary(grossSalary, age);
            const annualIncome = grossSalary * 12;
             this.updateNetSalary(netSalary);
            let taxMessage = '';
            if (tax === 0) {
                if (age < 65 && annualIncome <= TaxCalculator.TAX_THRESHOLDS.under65) {
                    taxMessage = `You don't pay income tax because your annual income (R${annualIncome.toFixed(2)}) is below the tax threshold of R${TaxCalculator.TAX_THRESHOLDS.under65} for your age group.`;
                } else if (age >= 65 && age < 75 && annualIncome <= TaxCalculator.TAX_THRESHOLDS.under75) {
                    taxMessage = `You don't pay income tax because your annual income (R${annualIncome.toFixed(2)}) is below the tax threshold of R${TaxCalculator.TAX_THRESHOLDS.under75} for your age group.`;
                } else if (age >= 75 && annualIncome <= TaxCalculator.TAX_THRESHOLDS.over75) {
                    taxMessage = `You don't pay income tax because your annual income (R${annualIncome.toFixed(2)}) is below the tax threshold of R${TaxCalculator.TAX_THRESHOLDS.over75} for your age group.`;
                }
            } else {
                taxMessage = `You pay income tax because your annual income (R${annualIncome.toFixed(2)}) is above the tax threshold for your age group.`;
            }
        
            const salaryDetails = document.getElementById('salaryDetails');
            if (salaryDetails) {
                salaryDetails.innerHTML = `
                    <div class="row">
                        <div class="col-sm-6">
                            <p class="mb-1"><strong>Monthly Tax:</strong> R${parseFloat(tax).toFixed(2)}</p>
                        </div>
                        <div class="col-sm-6">
                            <p class="mb-1"><strong>Net Salary:</strong> R${parseFloat(netSalary).toFixed(2)} 
                            <span class="text-muted">(UIF: R${parseFloat(UIF).toFixed(2)})</span></p>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12">
                            <p class="mb-1 text-info">${taxMessage}</p>
                        </div>
                    </div>
                `;
            }
        }

    addExpense(expense) {
        expense.subExpenses = [];
        this.expenses.push(expense);
        this.saveData();
    }

    addSubExpense(parentIndex, subExpense) {
        if (this.expenses[parentIndex]) {
            if (!this.expenses[parentIndex].subExpenses) {
                this.expenses[parentIndex].subExpenses = [];
            }
            this.expenses[parentIndex].subExpenses.push(subExpense);
            this.saveData();
        }
    }

    removeExpense(index) {
        this.expenses.splice(index, 1);
        this.saveData();
    }

    removeSubExpense(parentIndex, subIndex) {
        if (this.expenses[parentIndex]?.subExpenses) {
            this.expenses[parentIndex].subExpenses.splice(subIndex, 1);
            this.saveData();
        }
    }

    addIncome(income) {
        this.additionalIncomes.push(income);
        this.saveData();
    }

    removeIncome(index) {
        this.additionalIncomes.splice(index, 1);
        this.saveData();
    }

    updateSalary(amount) {
        this.salary = amount;
        this.saveData();
    }

    updateNetSalary(amount) {
        this.netSalary = amount;
        this.saveData();
    }


    getTotalIncome() {
        const additionalIncome = this.additionalIncomes?.reduce((sum, income) => sum + (income.amount || 0), 0) || 0;
        return (this.netSalary || 0) + additionalIncome;
    }

    getTotalExpenses() {
        return this.expenses.reduce((sum, expense) => {
            const subExpenseTotal = expense.subExpenses?.reduce((subSum, subExp) => subSum + (subExp.amount || 0), 0) || 0;
            return sum + (expense.amount || 0) + subExpenseTotal;
        }, 0);
    }

    getBalance() {
        return this.getTotalIncome() - this.getTotalExpenses();
    }

    analyzeBudget() {
        const analysis = [];
        const totalIncome = this.getTotalIncome();
        const totalExpenses = this.getTotalExpenses();
        const balance = this.getBalance();
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        // Income vs Expenses Analysis
        if (totalExpenses > totalIncome) {
            analysis.push("⚠️ Your expenses exceed your income. This is unsustainable long-term.");
            analysis.push("💡 Consider reducing non-essential expenses or finding additional income sources.");
        }

        // Savings Rate Analysis
        if (savingsRate < 0) {
            analysis.push("🚨 You're in a deficit spending situation.");
        } else if (savingsRate < 20) {
            analysis.push("⚠️ Your savings rate is below recommended levels (20%).");
            analysis.push("💡 Try to increase your savings by reducing discretionary spending.");
        } else if (savingsRate >= 20 && savingsRate < 30) {
            analysis.push("👍 Good job! You're saving at a healthy rate.");
        } else {
            analysis.push("🌟 Excellent savings rate! Consider investing your surplus.");
        }

        // Category Analysis
        const categoryTotals = {};
        this.expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            const subExpenseTotal = expense.subExpenses?.reduce((sum, subExp) => sum + (subExp.amount || 0), 0) || 0;
            categoryTotals[expense.category] += (expense.amount || 0) + subExpenseTotal;
        });

        // Check category percentages
        if (totalIncome > 0) {
            Object.entries(categoryTotals).forEach(([category, amount]) => {
                const percentage = (amount / totalIncome) * 100;
                
                switch(category) {
                    case 'housing':
                        if (percentage > 30) {
                            analysis.push(`⚠️ Housing expenses (${percentage.toFixed(1)}%) exceed recommended 30% of income.`);
                        }
                        break;
                    case 'food':
                        if (percentage > 15) {
                            analysis.push(`💡 Consider reducing food expenses (${percentage.toFixed(1)}% of income).`);
                        }
                        break;
                    case 'entertainment':
                        if (percentage > 10) {
                            analysis.push(`💡 Entertainment spending (${percentage.toFixed(1)}%) could be reduced.`);
                        }
                        break;
                }
            });
        }

        return analysis;
    }

    getData() {
        return {
            expenses: this.expenses || [],
            additionalIncomes: this.additionalIncomes || [],
            salary: this.salary || 0,
            totalIncome: this.getTotalIncome(),
            totalExpenses: this.getTotalExpenses(),
            balance: this.getBalance(),
            analysis: this.analyzeBudget()
        };
    }

    saveData() {
        localStorage.setItem('budgetTrackerData', JSON.stringify({
            expenses: this.expenses,
            additionalIncomes: this.additionalIncomes,
            salary: this.salary,
            netSalary: this.netSalary
        }));
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('budgetTrackerData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.expenses = (data.expenses || []).map(expense => ({
                    ...expense,
                    subExpenses: expense.subExpenses || []
                }));
                this.additionalIncomes = data.additionalIncomes || [];
                this.salary = data.salary || 0;
                if (this.salary !== 0) {
                    this.updateSalaryDetails(parseFloat(this.salary));
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.expenses = [];
            this.additionalIncomes = [];
            this.salary = 0;
        }
    }
}