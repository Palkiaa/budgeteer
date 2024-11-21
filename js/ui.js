export class UI {
    displayData(data) {
        this.displayExpenses(data.expenses);
        this.displayIncomes(data.additionalIncomes);
        this.displaySummary(data);
        document.getElementById('salary').value = data.salary;
    }

    displayExpenses(expenses) {
        const expenseList = document.getElementById('expenseList');
        expenseList.innerHTML = '<h2>Expenses</h2>';
        
        expenses.forEach((expense, index) => {
            const item = document.createElement('div');
            item.className = 'expense-item';
            
            // Main expense
            const mainExpense = document.createElement('div');
            mainExpense.className = 'main-expense';
            mainExpense.innerHTML = `
                <span>
                    <i class="fas fa-${this.getCategoryIcon(expense.category)}"></i>
                    ${expense.name} - R${expense.amount.toFixed(2)}
                </span>
                <div class="expense-actions">
                    <button class="add-sub-btn" data-index="${index}">
                        <i class="fas fa-plus"></i> Add Sub-expense
                    </button>
                    <button class="remove-btn" data-type="expense" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            item.appendChild(mainExpense);

            // Sub-expenses
            if (expense.subExpenses && expense.subExpenses.length > 0) {
                const subExpenseList = document.createElement('div');
                subExpenseList.className = 'sub-expense-list';
                
                expense.subExpenses.forEach((subExpense, subIndex) => {
                    const subItem = document.createElement('div');
                    subItem.className = 'sub-expense-item';
                    subItem.innerHTML = `
                        <span>→ ${subExpense.name} - R${subExpense.amount.toFixed(2)}</span>
                        <button class="remove-btn small" data-parent="${index}" data-index="${subIndex}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    subExpenseList.appendChild(subItem);
                });
                
                item.appendChild(subExpenseList);
            }
            
            expenseList.appendChild(item);
        });

        // Add event listeners
        this.addExpenseEventListeners();
    }

    addExpenseEventListeners() {
        // Remove main expense
        document.querySelectorAll('.remove-btn[data-type="expense"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-btn').dataset.index);
                document.dispatchEvent(new CustomEvent('removeExpense', { detail: index }));
            });
        });

        // Remove sub-expense
        document.querySelectorAll('.sub-expense-item .remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const parentIndex = parseInt(button.dataset.parent);
                const subIndex = parseInt(button.dataset.index);
                document.dispatchEvent(new CustomEvent('removeSubExpense', { 
                    detail: { parentIndex, subIndex }
                }));
            });
        });

        // Add sub-expense
        document.querySelectorAll('.add-sub-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const parentIndex = parseInt(button.dataset.index);
                this.showSubExpenseModal(parentIndex);
            });
        });
    }

    showSubExpenseModal(parentIndex) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Add Sub-expense</h2>
                <div class="input-group">
                    <label for="subExpenseName">Name</label>
                    <input type="text" id="subExpenseName" placeholder="Enter sub-expense name">
                </div>
                <div class="input-group">
                    <label for="subExpenseAmount">Amount (R)</label>
                    <input type="number" id="subExpenseAmount" placeholder="Enter amount">
                </div>
                <button id="submitSubExpenseBtn">Add Sub-expense</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';

        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => {
            document.body.removeChild(modal);
        };

        const submitBtn = modal.querySelector('#submitSubExpenseBtn');
        submitBtn.onclick = () => {
            const subExpense = this.getSubExpenseInput();
            if (subExpense) {
                document.dispatchEvent(new CustomEvent('addSubExpense', {
                    detail: { parentIndex, subExpense }
                }));
                document.body.removeChild(modal);
            }
        };

        window.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    displayIncomes(incomes) {
        const incomeList = document.getElementById('additionalIncomeList');
        incomeList.innerHTML = '';
        
        incomes.forEach((income, index) => {
            const item = document.createElement('div');
            item.className = 'income-item';
            item.innerHTML = `
                <span>${income.source} - R${income.amount.toFixed(2)}</span>
                <button class="remove-btn" data-type="income" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            incomeList.appendChild(item);
        });

        // Add event listeners to remove buttons
        incomeList.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-btn').dataset.index);
                document.dispatchEvent(new CustomEvent('removeIncome', { detail: index }));
            });
        });
    }

    displaySummary(data) {
        console.log(data)
        const summary = document.getElementById('summary');
        summary.innerHTML = `
            <h2>Summary</h2>
            <div class="summary-numbers">
                <p>Total Income: R${parseFloat(data.totalIncome)?.toFixed(2)}</p>
                <p>Total Expenses: R${parseFloat(data.totalExpenses)?.toFixed(2)}</p>
                <p class="${data.balance >= 0 ? 'positive' : 'negative'}">
                    Balance: R${parseFloat(data.balance)?.toFixed(2)}
                </p>
            </div>
            <div class="budget-analysis">
                <h3>Budget Analysis</h3>
                ${data.analysis.map(item => `<p>${item}</p>`).join('')}
            </div>
        `;
    }

    getExpenseInput() {
        const name = document.getElementById('expenseName').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;

        if (name && amount && !isNaN(amount)) {
            return { name, amount, category };
        }
        this.showError('Please fill in all expense fields correctly');
        return null;
    }

    getSubExpenseInput() {
        const name = document.getElementById('subExpenseName').value;
        const amount = parseFloat(document.getElementById('subExpenseAmount').value);

        if (name && amount && !isNaN(amount)) {
            return { name, amount };
        }
        this.showError('Please fill in all sub-expense fields correctly');
        return null;
    }

    getIncomeInput() {
        const source = document.getElementById('incomeSource').value;
        const amount = parseFloat(document.getElementById('incomeAmount').value);

        if (source && amount && !isNaN(amount)) {
            return { source, amount };
        }
        this.showError('Please fill in all income fields correctly');
        return null;
    }

    clearExpenseInput() {
        document.getElementById('expenseName').value = '';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseCategory').selectedIndex = 0;
    }

    clearIncomeInput() {
        document.getElementById('incomeSource').value = '';
        document.getElementById('incomeAmount').value = '';
    }

    showIncomeModal() {
        document.getElementById('incomeModal').style.display = 'block';
    }

    hideIncomeModal() {
        document.getElementById('incomeModal').style.display = 'none';
    }

    showError(message) {
        alert(message);
    }

    getCategoryIcon(category) {
        const icons = {
            housing: 'home',
            transportation: 'car',
            food: 'utensils',
            utilities: 'bolt',
            healthcare: 'medkit',
            entertainment: 'tv',
            other: 'question-circle'
        };
        return icons[category] || 'question-circle';
    }
}
