// app.js – Professional Homework Tracker Logic

(function() {
  // ---------- STATE ----------
  let assignments = [];

  // ---------- DOM ELEMENTS ----------
  const form = document.getElementById('assignmentForm');
  const subjectInput = document.getElementById('subjectInput');
  const titleInput = document.getElementById('titleInput');
  const dueDateInput = document.getElementById('dueDateInput');
  const prioritySelect = document.getElementById('prioritySelect');
  const assignmentsList = document.getElementById('assignmentsList');
  const emptyState = document.getElementById('emptyState');
  const progressBar = document.getElementById('progressBar');
  const completedCountSpan = document.getElementById('completedCount');
  const totalCountSpan = document.getElementById('totalCount');
  const currentDateEl = document.getElementById('currentDate');
  const filterButtons = document.querySelectorAll('.filter-btn');

  let currentFilter = 'all'; // all, today, upcoming, overdue

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
    const today = getTodayDateString();
    return dueDateStr < today;
  }

  function isToday(dueDateStr) {
    return dueDateStr === getTodayDateString();
  }

  function updateProgress() {
    const total = assignments.length;
    const completed = assignments.filter(a => a.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    progressBar.style.width = `${percent}%`;
    completedCountSpan.textContent = completed;
    totalCountSpan.textContent = total;
  }

  function setCurrentDate() {
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    currentDateEl.textContent = today.toLocaleDateString('en-US', options);
  }

  // ---------- RENDER ----------
  function filterAssignments() {
    const todayStr = getTodayDateString();
    
    return assignments.filter(assignment => {
      if (assignment.completed && currentFilter !== 'all') {
        // keep completed visible in 'all', but hide from other filters for cleaner view
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

  function renderAssignments() {
    const filtered = filterAssignments();
    
    // clear list
    assignmentsList.innerHTML = '';
    
    if (filtered.length === 0) {
      assignmentsList.innerHTML = `
        <div class="empty-state" id="emptyState">
          <div class="empty-icon"><i class="far fa-clipboard"></i></div>
          <p>No assignments here</p>
          <p class="sub">${currentFilter === 'all' ? 'Add one to get started ✨' : 'Try another filter'}</p>
        </div>
      `;
      updateProgress();
      return;
    }
    
    // sort: overdue first, then by date ascending
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
    
    // attach event listeners to check buttons
    document.querySelectorAll('.check-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        toggleComplete(id);
      });
    });
    
    updateProgress();
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
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
    saveToLocalStorage();
  }

  function toggleComplete(id) {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      assignment.completed = !assignment.completed;
      renderAssignments();
      saveToLocalStorage();
    }
  }

  // ---------- STORAGE ----------
  function saveToLocalStorage() {
    localStorage.setItem('homeworkTrackerAssignments', JSON.stringify(assignments));
  }

  function loadFromLocalStorage() {
    const stored = localStorage.getItem('homeworkTrackerAssignments');
    if (stored) {
      try {
        assignments = JSON.parse(stored);
      } catch (e) {
        assignments = [];
      }
    }
  }

  // ---------- FILTER HANDLING ----------
  function setFilter(filterValue) {
    currentFilter = filterValue;
    filterButtons.forEach(btn => {
      const btnFilter = btn.getAttribute('data-filter');
      if (btnFilter === filterValue) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
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
    
    // reset form
    form.reset();
    prioritySelect.value = 'normal';
    // set date input to today as convenience
    dueDateInput.value = getTodayDateString();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setFilter(filter);
    });
  });

  // ---------- INITIALIZATION ----------
  function init() {
    setCurrentDate();
    loadFromLocalStorage();
    // set default date input to today
    dueDateInput.value = getTodayDateString();
    renderAssignments();
  }

  init();
})();
