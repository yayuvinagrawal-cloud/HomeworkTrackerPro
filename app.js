// app.js – Apple-style Homework Tracker

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
  const completedCountSpan = document.getElementById('completedCount');
  const totalCountSpan = document.getElementById('totalCount');
  const currentDateEl = document.getElementById('currentDate');
  const filterChips = document.querySelectorAll('.filter-chip');
  const searchInput = document.getElementById('searchInput');
  const themeToggle = document.getElementById('themeToggle');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const streakCountEl = document.getElementById('streakCount');
  const progressRing = document.getElementById('progressRing');
  const progressPercent = document.getElementById('progressPercent');

  let currentFilter = 'all';
  let searchQuery = '';

  const CIRCUMFERENCE = 263.89; // 2 * π * 42

  // ---------- HELPERS ----------
  function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function formatDisplayDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function isOverdue(dateStr) {
    return dateStr < getTodayDateString();
  }

  function isToday(dateStr) {
    return dateStr === getTodayDateString();
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ---------- THEME ----------
  function loadTheme() {
    const saved = localStorage.getItem('hwTrackerTheme');
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
      localStorage.setItem('hwTrackerTheme', 'light');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('hwTrackerTheme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  // ---------- PROGRESS RING ----------
  function updateProgressRing(percent) {
    const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = offset;
    progressPercent.textContent = `${Math.round(percent)}%`;
  }

  function updateStats() {
    const total = assignments.length;
    const completed = assignments.filter(a => a.completed).length;
    const percent = total === 0 ? 0 : (completed / total) * 100;

    updateProgressRing(percent);
    completedCountSpan.textContent = completed;
    totalCountSpan.textContent = total;
    streakCountEl.textContent = streak;
  }

  function setCurrentDate() {
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // ---------- FILTER & SEARCH ----------
  function filterAssignments() {
    const todayStr = getTodayDateString();
    const query = searchQuery.toLowerCase().trim();

    return assignments.filter(a => {
      if (query && !a.title.toLowerCase().includes(query) && !a.subject.toLowerCase().includes(query)) {
        return false;
      }
      if (a.completed && currentFilter !== 'all') return false;

      switch (currentFilter) {
        case 'today': return a.dueDate === todayStr;
        case 'upcoming': return a.dueDate > todayStr;
        case 'overdue': return a.dueDate < todayStr && !a.completed;
        default: return true;
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
          <div class="empty-icon"><i class="far fa-check-circle"></i></div>
          <p class="empty-title">${searchQuery ? 'No results' : 'All clear'}</p>
          <p class="empty-sub">${searchQuery ? 'Try another search' : 'Add an assignment to get started'}</p>
        </div>
      `;
      updateStats();
      return;
    }

    const sorted = [...filtered].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    sorted.forEach(a => {
      const card = document.createElement('div');
      card.className = `assignment-card ${a.completed ? 'completed' : ''}`;

      const priorityClass = a.priority === 'urgent' ? 'urgent' : (a.priority === 'low' ? 'low' : '');
      let dueClass = '';
      if (!a.completed && isOverdue(a.dueDate)) dueClass = 'overdue';
      else if (!a.completed && isToday(a.dueDate)) dueClass = 'today';

      card.innerHTML = `
        <div class="assignment-left">
          <div class="priority-indicator ${priorityClass}"></div>
          <div class="assignment-content">
            <span class="assignment-title">${escapeHTML(a.title)}</span>
            <div class="assignment-meta">
              <span class="subject-tag">${escapeHTML(a.subject)}</span>
              <span class="due-tag ${dueClass}">
                <i class="far fa-calendar-alt"></i>
                ${isToday(a.dueDate) ? 'Today' : formatDisplayDate(a.dueDate)}
                ${dueClass === 'overdue' ? ' · Overdue' : ''}
              </span>
            </div>
          </div>
        </div>
        <button class="check-btn" data-id="${a.id}">
          <i class="fas fa-check"></i>
        </button>
      `;

      assignmentsList.appendChild(card);
    });

    document.querySelectorAll('.check-btn').forEach(btn => {
      btn.addEventListener('click', () => toggleComplete(btn.dataset.id));
    });

    updateStats();
  }

  // ---------- ACTIONS ----------
  function addAssignment(subject, title, dueDate, priority) {
    assignments.push({
      id: Date.now().toString(),
      subject: subject.trim(),
      title: title.trim(),
      dueDate,
      priority,
      completed: false
    });
    renderAssignments();
    saveAll();
  }

  function toggleComplete(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    a.completed = !a.completed;
    if (a.completed) {
      const today = getTodayDateString();
      if (lastCompletedDate !== today) {
        lastCompletedDate = today;
        streak = Math.min(streak + 1, 365);
      }
    }
    renderAssignments();
    saveAll();
  }

  function clearCompleted() {
    if (!assignments.some(a => a.completed)) return;
    if (confirm('Remove all completed assignments?')) {
      assignments = assignments.filter(a => !a.completed);
      renderAssignments();
      saveAll();
    }
  }

  // ---------- STORAGE ----------
  function saveAll() {
    localStorage.setItem('hwTrackerData', JSON.stringify(assignments));
    localStorage.setItem('hwTrackerStreak', streak);
    localStorage.setItem('hwTrackerLastDate', lastCompletedDate || '');
  }

  function loadAll() {
    try {
      const data = localStorage.getItem('hwTrackerData');
      if (data) assignments = JSON.parse(data);
    } catch (e) { assignments = []; }
    streak = parseInt(localStorage.getItem('hwTrackerStreak')) || 0;
    lastCompletedDate = localStorage.getItem('hwTrackerLastDate') || null;
  }

  // ---------- FILTER HANDLING ----------
  function setFilter(filterValue) {
    currentFilter = filterValue;
    filterChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.filter === filterValue);
    });
    renderAssignments();
  }

  // ---------- EVENT LISTENERS ----------
  form.addEventListener('submit', e => {
    e.preventDefault();
    const subject = subjectInput.value.trim();
    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = prioritySelect.value;
    if (!subject || !title || !dueDate) return;
    addAssignment(subject, title, dueDate, priority);
    form.reset();
    prioritySelect.value = 'normal';
    dueDateInput.value = getTodayDateString();
  });

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => setFilter(chip.dataset.filter));
  });

  searchInput.addEventListener('input', e => {
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
