document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('searchBox');
    const addBtn = document.getElementById('addBtn');
    const listContainer = document.getElementById('listContainer');
    const pendingCounter = document.getElementById('pendingTasks');
    const dateElement = document.querySelector('.date');
    const greetingElement = document.querySelector('.greeting');
    const emptyState = document.getElementById('emptyState');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // We changed the localStorage key to "stellar_tasks" to start fresh, 
    // avoiding conflicts with the previous data structure.
    let tasks = JSON.parse(localStorage.getItem('stellar_tasks')) || [];
    let currentFilter = 'all';

    // Set Date & Greeting
    function updateHeader() {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);

        const hour = now.getHours();
        if (hour < 12) greetingElement.textContent = 'Good Morning';
        else if (hour < 18) greetingElement.textContent = 'Good Afternoon';
        else greetingElement.textContent = 'Good Evening';
    }

    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('stellar_tasks', JSON.stringify(tasks));
    }

    // Render tasks based on filter
    function renderTasks() {
        listContainer.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (tasks.length === 0) {
            emptyState.style.display = 'flex';
            emptyState.querySelector('p').textContent = "What's on your mind today?";
        } else if (filteredTasks.length === 0) {
            emptyState.style.display = 'flex';
            emptyState.querySelector('p').textContent = "No tasks in this category.";
        } else {
            emptyState.style.display = 'none';
            filteredTasks.forEach((task, index) => {
                const li = document.createElement('li');
                if (task.completed) li.classList.add('checked');
                // Use actual index from main tasks array
                const realIndex = tasks.findIndex(t => t.id === task.id);
                li.innerHTML = `
                    <div class="checkbox" onclick="toggleTask(${realIndex})">
                        <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <button class="delete-btn" onclick="deleteTask(${realIndex}, this)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                `;
                li.style.animationDelay = `${index * 0.05}s`;
                listContainer.appendChild(li);
            });
        }
        
        updateStats();
    }

    // Helper to escape HTML and prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Update the pending task counter
    function updateStats() {
        const pending = tasks.filter(t => !t.completed).length;
        pendingCounter.textContent = pending;
    }

    // Add New Task
    function addTask() {
        const text = inputField.value.trim();
        if (text === '') {
            shakeInput();
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.unshift(newTask);
        saveTasks();
        inputField.value = '';
        currentFilter = 'all'; // Reset filter when adding a new task
        filterBtns.forEach(b => b.classList.remove('active'));
        filterBtns[0].classList.add('active'); // Set 'All' to active
        renderTasks();
    }

    // Toggle Task
    window.toggleTask = function(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    };

    // Delete Task
    window.deleteTask = function(index, btnElement) {
        const li = btnElement.closest('li');
        li.classList.add('deleting');
        
        setTimeout(() => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }, 300); // Wait for animation
    };

    // Clear All Completed
    clearAllBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    });

    // Filtering logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTasks();
        });
    });

    // Input handlers
    addBtn.addEventListener('click', addTask);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Shake animation for invalid input
    function shakeInput() {
        const inputSection = document.querySelector('.input-section');
        inputSection.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 400,
            easing: 'ease-in-out'
        });
    }

    // Init
    updateHeader();
    renderTasks();
    
    // Automatically update greeting/date periodically
    setInterval(updateHeader, 60000);
});
