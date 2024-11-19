export class BudgetTracker {
    constructor() {
        this.expenses = [];
        this.additionalIncomes = [];
        this.salary = 0;
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

    getTotalIncome() {
        const additionalIncome = this.additionalIncomes?.reduce((sum, income) => sum + (income.amount || 0), 0) || 0;
        return (this.salary || 0) + additionalIncome;
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
            salary: this.salary
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
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.expenses = [];
            this.additionalIncomes = [];
            this.salary = 0;
        }
    }
}