// app.js – Premium Homework Tracker with Dark Mode

(function() {
  // ---------- STATE ----------
  let assignments = [];
  let streak = 0;
  let lastCompletedDate = null;

  // ---------- DOM ELEMENTS ----------
  const form = document.getElementById('assignmentForm');
  const subjectInput = document.getElementById('subjectInput');
  const titleInput = document.getElementById('titleInput');
  const dueDateInput = document.getElementById('dueDateInput');
  const prioritySelect = document.getElementById('prioritySelect');
  const assignmentsList = document.getElementById('assignmentsList');
  const progressBar = document.getElementById('progressBar');
  const completedCountSpan = document.getElementById('completedCount');
  const totalCountSpan = document.getElementById('totalCount');
  const currentDateEl = document.getElementById('currentDate');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchInput');
  const themeToggle = document.getElementById('themeToggle');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const streakCountEl = document.getElementById('streakCount');
  const motivationText = document.getElementById('motivationText');

  let currentFilter = 'all';
  let searchQuery = '';

  // ---------- HELPERS ----------
  function getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(dateStr) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', options);
  }

  function isOverdue(dueDateStr) {
    return dueDateStr < getTodayDateString();
  }

  function isToday(dueDateStr) {
    return dueDateStr === getTodayDateString();
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ---------- THEME ----------
  function loadTheme() {
    const saved = localStorage.getItem('homeworkTrackerTheme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('homeworkTrackerTheme', 'light');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('homeworkTrackerTheme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  // ---------- STREAK & MOTIVATION ----------
  function updateStreak() {
    const completedCount = assignments.filter(a => a.completed).length;
    const total = assignments.length;
    
    if (completedCount > 0 && total > 0) {
      streak = Math.min(streak + 1, 365);
    }
    if (completedCount === total && total > 0) {
      streak = Math.max(streak, 1);
    }
    
    streakCountEl.textContent = streak;
    
    // motivation
    if (completedCount === total && total > 0) {
      motivationText.textContent = 'All done! 🎉';
    } else if (assignments.some(a => !a.completed && isOverdue(a.dueDate))) {
      motivationText.textContent = 'Overdue items! 😰';
    } else if (completedCount > total / 2 && total > 0) {
      motivationText.textContent = 'Halfway there! 💪';
    } else if (completedCount > 0) {
      motivationText.textContent = 'Keep going! 🚀';
    } else if (total > 0) {
      motivationText.textContent = 'Time to focus! 📚';
    } else {
      motivationText.textContent = 'Add a task! ✨';
    }
  }

  // ---------- PROGRESS ----------
  function updateProgress() {
    const total = assignments.length;
    const completed = assignments.filter(a => a.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressBar.style.width = `${percent}%`;
    completedCountSpan.textContent = completed;
    totalCountSpan.textContent = total;
    updateStreak();
  }

  function setCurrentDate() {
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    currentDateEl.textContent = today.toLocaleDateString('en-US', options);
  }

  // ---------- FILTER & SEARCH ----------
  function filterAssignments() {
    const todayStr = getTodayDateString();
    const query = searchQuery.toLowerCase().trim();
    
    return assignments.filter(assignment => {
      // search filter
      if (query) {
        const matchesSearch = 
          assignment.title.toLowerCase().includes(query) ||
          assignment.subject.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // hide completed from filtered views
      if (assignment.completed && currentFilter !== 'all') {
        return false;
      }
      
      switch (currentFilter) {
        case 'today':
          return assignment.dueDate === todayStr;
        case 'upcoming':
          return assignment.dueDate > todayStr;
        case 'overdue':
          return assignment.dueDate < todayStr && !assignment.completed;
        case 'all':
        default:
          return true;
      }
    });
  }

  // ---------- RENDER ----------
  function renderAssignments() {
    const filtered = filterAssignments();
    assignmentsList.innerHTML = '';
    
    if (filtered.length === 0) {
      assignmentsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="far fa-clipboard"></i></div>
          <p>${searchQuery ? 'No matches found' : 'No assignments here'}</p>
          <p class="sub">${searchQuery ? 'Try a different search' : (currentFilter === 'all' ? 'Add one to get started ✨' : 'Try another filter')}</p>
        </div>
      `;
      updateProgress();
      return;
    }
    
    const sorted = [...filtered].sort((a, b) => {
      if (a.dueDate < b.dueDate) return -1;
      if (a.dueDate > b.dueDate) return 1;
      return 0;
    });
    
    sorted.forEach(assignment => {
      const card = document.createElement('div');
      card.className = `assignment-card ${assignment.completed ? 'completed' : ''}`;
      
      const overdueClass = (!assignment.completed && isOverdue(assignment.dueDate)) ? 'overdue-text' : '';
      const priorityClass = assignment.priority === 'urgent' ? 'urgent' : (assignment.priority === 'low' ? 'low' : '');
      
      card.innerHTML = `
        <div class="assignment-left">
          <div class="priority-dot ${priorityClass}"></div>
          <div class="assignment-info">
            <div class="assignment-title">${escapeHTML(assignment.title)}</div>
            <div class="assignment-meta">
              <span class="subject-badge">${escapeHTML(assignment.subject)}</span>
              <span class="due-text ${overdueClass}">
                <i class="far fa-calendar-alt"></i> 
                ${isToday(assignment.dueDate) ? 'Today' : formatDisplayDate(assignment.dueDate)}
                ${(!assignment.completed && isOverdue(assignment.dueDate)) ? ' (overdue)' : ''}
              </span>
            </div>
          </div>
        </div>
        <button class="check-btn" data-id="${assignment.id}" aria-label="Toggle complete">
          <i class="fas fa-check"></i>
        </button>
      `;
      
      assignmentsList.appendChild(card);
    });
    
    // attach check button events
    document.querySelectorAll('.check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        toggleComplete(id);
      });
    });
    
    updateProgress();
  }

  // ---------- ACTIONS ----------
  function addAssignment(subject, title, dueDate, priority) {
    const newAssignment = {
      id: Date.now().toString(),
      subject: subject.trim(),
      title: title.trim(),
      dueDate: dueDate,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString()
    };
    assignments.push(newAssignment);
    renderAssignments();
    saveAll();
  }

  function toggleComplete(id) {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      assignment.completed = !assignment.completed;
      if (assignment.completed) {
        const today = getTodayDateString();
        if (lastCompletedDate !== today) {
          lastCompletedDate = today;
          streak++;
        }
      }
      renderAssignments();
      saveAll();
    }
  }

  function clearCompleted() {
    const hasCompleted = assignments.some(a => a.completed);
    if (!hasCompleted) return;
    if (confirm('Remove all completed assignments?')) {
      assignments = assignments.filter(a => !a.completed);
      renderAssignments();
      saveAll();
    }
  }

  // ---------- STORAGE ----------
  function saveAll() {
    localStorage.setItem('homeworkTrackerAssignments', JSON.stringify(assignments));
    localStorage.setItem('homeworkTrackerStreak', streak);
    localStorage.setItem('homeworkTrackerLastDate', lastCompletedDate || '');
  }

  function loadAll() {
    const stored = localStorage.getItem('homeworkTrackerAssignments');
    if (stored) {
      try { assignments = JSON.parse(stored); } catch (e) { assignments = []; }
    }
    const storedStreak = localStorage.getItem('homeworkTrackerStreak');
    if (storedStreak) streak = parseInt(storedStreak) || 0;
    const storedDate = localStorage.getItem('homeworkTrackerLastDate');
    if (storedDate) lastCompletedDate = storedDate;
  }

  // ---------- FILTER HANDLING ----------
  function setFilter(filterValue) {
    currentFilter = filterValue;
    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filterValue);
    });
    renderAssignments();
  }

  // ---------- EVENT LISTENERS ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = subjectInput.value.trim();
    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = prioritySelect.value;
    if (!subject || !title || !dueDate) {
      alert('Please fill in all fields');
      return;
    }
    addAssignment(subject, title, dueDate, priority);
    form.reset();
    prioritySelect.value = 'normal';
    dueDateInput.value = getTodayDateString();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.getAttribute('data-filter')));
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderAssignments();
  });

  themeToggle.addEventListener('click', toggleTheme);

  clearCompletedBtn.addEventListener('click', clearCompleted);

  // ---------- INIT ----------
  function init() {
    loadTheme();
    setCurrentDate();
    loadAll();
    dueDateInput.value = getTodayDateString();
    renderAssignments();
  }

  init();
})();
