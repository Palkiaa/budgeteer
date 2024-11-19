import { BudgetTracker } from './budgetTracker.js';
import { UI } from './ui.js';
import { ExpenseChart } from './chart.js';

document.addEventListener('DOMContentLoaded', () => {
    const budgetTracker = new BudgetTracker();
    const ui = new UI();
    const chart = new ExpenseChart();

    // Load saved data
    budgetTracker.loadData();
    ui.displayData(budgetTracker.getData());
    chart.updateChart(budgetTracker.getData());

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
            ui.clearIncomeInput();
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

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            ui.hideIncomeModal();
        }
    });

    // Close modal with × button
    document.querySelector('.close').addEventListener('click', () => {
        ui.hideIncomeModal();
    });
});