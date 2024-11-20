export class ExpenseChart {
    constructor() {
        this.chartInstance = null;
        this.colors = [
            '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', 
            '#e74c3c', '#1abc9c', '#34495e', '#e67e22'
        ];
    }

    updateChart(data) {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const expenses = this.processExpenseData(data.expenses);
        
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: expenses.labels,
                datasets: [{
                    data: expenses.amounts,
                    backgroundColor: this.colors
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        this.updateLegend(expenses);
    }

    processExpenseData(expenses) {
        const categories = {};
        
        expenses.forEach(expense => {
            if (categories[expense.category]) {
                categories[expense.category] += expense.amount;
            } else {
                categories[expense.category] = expense.amount;
            }
        });

        return {
            labels: Object.keys(categories).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
            amounts: Object.values(categories)
        };
    }

    updateLegend(expenses) {
        const legend = document.getElementById('chartLegend');
        legend.innerHTML = '<h3>Expense Categories</h3>';
        
        expenses.labels.forEach((label, index) => {
            const item = document.createElement('div');
            item.style.marginBottom = '8px';
            item.innerHTML = `
                <span style="display: inline-block; width: 12px; height: 12px; background-color: ${this.colors[index]}; margin-right: 8px;"></span>
                ${label}: R${expenses.amounts[index].toFixed(2)}
            `;
            legend.appendChild(item);
        });
    }
}