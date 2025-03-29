// DOM Elements
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const totalExpensesElement = document.getElementById('totalExpenses');
const monthlyExpensesElement = document.getElementById('monthlyExpenses');
const averageExpensesElement = document.getElementById('averageExpenses');
const categoryCountElement = document.getElementById('categoryCount');

// Initialize expenses array from localStorage or empty array if none exists
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let editingId = null;

// Toggle Sidebar
document.addEventListener('DOMContentLoaded', () => {
    // Add click event to all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            // Add active class to clicked nav item
            e.currentTarget.classList.add('active');
        });
    });

    // Double click on sidebar header to toggle sidebar
    document.querySelector('.sidebar-header').addEventListener('dblclick', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    // Set default date to today
    document.getElementById('expenseDate').valueAsDate = new Date();
    
    // Initial render
    renderExpenses();
    updateCategoryCount();
});

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Format date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Show toast notification
const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
};

// Update category count
const updateCategoryCount = () => {
    const categories = new Set(expenses.map(expense => expense.category));
    categoryCountElement.textContent = categories.size;
};

// Calculate and update summary
const updateSummary = () => {
    // Calculate total expenses
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    totalExpensesElement.textContent = formatCurrency(total);

    // Calculate this month's expenses
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTotal = expenses.reduce((sum, expense) => {
        const expenseDate = new Date(expense.date);
        if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
            return sum + parseFloat(expense.amount);
        }
        return sum;
    }, 0);
    monthlyExpensesElement.textContent = formatCurrency(monthlyTotal);

    // Calculate average daily expenses for current month
    const today = new Date().getDate();
    const averageDaily = monthlyTotal / today;
    averageExpensesElement.textContent = formatCurrency(averageDaily);

    // Update category count
    updateCategoryCount();
};

// Get category tag class
const getCategoryTagClass = (category) => {
    const categoryClasses = {
        'Shopping': 'shopping',
        'Food': 'food',
        'Transportation': 'transportation',
        'Utilities': 'utilities',
        'Entertainment': 'entertainment',
        'Healthcare': 'healthcare',
        'Education': 'education',
        'Travel': 'travel',
        'Gifts': 'gifts',
        'Others': 'others'
    };
    return categoryClasses[category] || 'others';
};

// Render expenses list
const renderExpenses = () => {
    expenseList.innerHTML = '';
    
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(expense => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(expense.date)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="category-tag ${getCategoryTagClass(expense.category)}">
                    ${expense.category}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">${expense.description}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(expense.amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editExpense('${expense.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteExpense('${expense.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        expenseList.appendChild(row);
    });
    
    updateSummary();
};

// Add new expense
const addExpense = (e) => {
    e.preventDefault();
    
    const date = document.getElementById('expenseDate').value;
    const amount = document.getElementById('expenseAmount').value;
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    
    if (!date || !amount || !category || !description) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    const expense = {
        id: editingId || Date.now().toString(),
        date,
        amount,
        category,
        description
    };
    
    if (editingId) {
        // Update existing expense
        expenses = expenses.map(exp => exp.id === editingId ? expense : exp);
        editingId = null;
        document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus mr-2"></i>Add Expense';
    } else {
        // Add new expense
        expenses.push(expense);
    }
    
    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    // Reset form
    expenseForm.reset();
    document.getElementById('expenseDate').valueAsDate = new Date();
    
    // Show success message
    showToast(editingId ? 'Expense updated successfully!' : 'Expense added successfully!');
    
    // Render updated list
    renderExpenses();
};

// Edit expense
const editExpense = (id) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
        editingId = id;
        document.getElementById('expenseDate').value = expense.date;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expenseDescription').value = expense.description;
        document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save mr-2"></i>Update Expense';
        
        // Scroll to form
        document.getElementById('expenseForm').scrollIntoView({ behavior: 'smooth' });
    }
};

// Delete expense
const deleteExpense = (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        showToast('Expense deleted successfully!');
        renderExpenses();
    }
};

// Event Listeners
expenseForm.addEventListener('submit', addExpense);