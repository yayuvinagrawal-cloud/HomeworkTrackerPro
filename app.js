// app.js – Premium Homework Tracker v2.0
// Features: Auto dark mode, haptics, sounds, subject colors, notes, drag & drop, dashboard, smart suggestions, notifications, cloud sync simulation

(function() {
  // ========== STATE ==========
  let assignments = [];
  let streak = 0;
  let lastCompletedDate = null;
  let subjectColorMap = {};
  let sortOrder = 'date-asc'; // date-asc, date-desc, subject, title
  let currentModalId = null;

  // ========== DOM ELEMENTS ==========
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const form = $('#assignmentForm');
  const subjectInput = $('#subjectInput');
  const titleInput = $('#titleInput');
  const dueDateInput = $('#dueDateInput');
  const prioritySelect = $('#prioritySelect');
  const assignmentsList = $('#assignmentsList');
  const dashboardView = $('#dashboardView');
  const completedCountSpan = $('#completedCount');
  const totalCountSpan = $('#totalCount');
  const overdueCountSpan = $('#overdueCount');
  const currentDateEl = $('#currentDate');
  const greetingSubtitle = $('#greetingSubtitle');
  const filterChips = $$('.filter-chip');
  const searchInput = $('#searchInput');
  const themeToggle = $('#themeToggle');
  const clearCompletedBtn = $('#clearCompletedBtn');
  const exportBtn = $('#exportBtn');
  const streakCountEl = $('#streakCount');
  const progressRing = $('#progressRing');
  const progressPercent = $('#progressPercent');
  const smartSuggestion = $('#smartSuggestion');
  const suggestionText = $('#suggestionText');
  const suggestionAction = $('#suggestionAction');
  const sortBtn = $('#sortBtn');
  const detailModal = $('#detailModal');
  const toastContainer = $('#toastContainer');
  const subjectSuggestions = $('#subjectSuggestions');
  const subjectChart = $('#subjectChart');
  const weekStats = $('#weekStats');
  const trendBars = $('#trendBars');

  const CIRCUMFERENCE = 263.89;
  let currentFilter = 'all';
  let searchQuery = '';
  let draggedCard = null;

  // ========== SUBJECT COLOR PALETTE ==========
  const colorPalette = ['#0071e3','#ff3b30','#34c759','#ff9500','#af52de','#5ac8fa','#ffcc00','#ff2d55','#ff375f','#30b0c7'];

  function getSubjectColor(subject) {
    const key = subject.toLowerCase().trim();
    if (!subjectColorMap[key]) {
      const used = Object.values(subjectColorMap);
      const available = colorPalette.filter(c => !used.includes(c));
      subjectColorMap[key] = available.length > 0 ? available[0] : colorPalette[Object.keys(subjectColorMap).length % colorPalette.length];
    }
    return subjectColorMap[key];
  }

  // ========== HELPERS ==========
  function getToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function isOverdue(d) { return d < getToday(); }
  function isToday(d) { return d === getToday(); }
  function esc(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

  // ========== THEME ==========
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }

  function loadTheme() {
    const saved = localStorage.getItem('hwTheme');
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    } else {
      applyTheme(getSystemTheme());
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('hwTheme', next);
    applyTheme(next);
    showToast(`Switched to ${next} mode`);
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('hwTheme')) {
      applyTheme(getSystemTheme());
    }
  });

  // ========== TOAST ==========
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ========== HAPTICS ==========
  function haptic(style = 'light') {
    if (navigator.vibrate) {
      if (style === 'success') navigator.vibrate([15, 50, 15]);
      else if (style === 'delete') navigator.vibrate([50]);
      else navigator.vibrate(10);
    }
  }

  // ========== SOUND ==========
  function playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'complete') {
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'add') {
        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch(e) {}
  }

  // ========== PROGRESS ==========
  function updateProgressRing(percent) {
    const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = offset;
    progressPercent.textContent = `${Math.round(percent)}%`;
  }

  function updateStats() {
    const total = assignments.length;
    const completed = assignments.filter(a => a.completed).length;
    const overdue = assignments.filter(a => !a.completed && isOverdue(a.dueDate)).length;
    const percent = total === 0 ? 0 : (completed / total) * 100;
    updateProgressRing(percent);
    completedCountSpan.textContent = completed;
    totalCountSpan.textContent = total;
    overdueCountSpan.textContent = overdue;
    streakCountEl.textContent = streak;
  }

  function setCurrentDate() {
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const hour = today.getHours();
    if (hour < 12) greetingSubtitle.textContent = 'Good morning.';
    else if (hour < 18) greetingSubtitle.textContent = 'Good afternoon.';
    else greetingSubtitle.textContent = 'Good evening.';
  }

  // ========== SMART SUGGESTIONS ==========
  function generateSuggestion() {
    const subjects = [...new Set(assignments.map(a => a.subject.toLowerCase()))];
    if (subjects.length === 0) { smartSuggestion.style.display = 'none'; return; }
    const today = getToday();
    const todayAssignments = assignments.filter(a => a.dueDate === today);
    const subjectCounts = {};
    assignments.forEach(a => {
      const key = a.subject.toLowerCase();
      if (!subjectCounts[key]) subjectCounts[key] = 0;
      subjectCounts[key]++;
    });
    const topSubject = Object.entries(subjectCounts).sort((a,b) => b[1]-a[1])[0][0];
    const formattedSubject = topSubject.charAt(0).toUpperCase() + topSubject.slice(1);
    suggestionText.textContent = `You often have ${formattedSubject} homework. Add one now?`;
    suggestionAction.onclick = () => {
      subjectInput.value = formattedSubject;
      titleInput.focus();
      smartSuggestion.style.display = 'none';
    };
    smartSuggestion.style.display = 'flex';
  }

  // ========== FILTER & SORT ==========
  function filterAndSort() {
    const today = getToday();
    const query = searchQuery.toLowerCase().trim();
    let filtered = assignments.filter(a => {
      if (query && !a.title.toLowerCase().includes(query) && !a.subject.toLowerCase().includes(query)) return false;
      if (a.completed && currentFilter !== 'all') return false;
      switch (currentFilter) {
        case 'today': return a.dueDate === today;
        case 'upcoming': return a.dueDate > today;
        case 'overdue': return a.dueDate < today && !a.completed;
        default: return true;
      }
    });
    // Sort
    switch (sortOrder) {
      case 'date-asc': filtered.sort((a,b) => a.dueDate.localeCompare(b.dueDate)); break;
      case 'date-desc': filtered.sort((a,b) => b.dueDate.localeCompare(a.dueDate)); break;
      case 'subject': filtered.sort((a,b) => a.subject.localeCompare(b.subject)); break;
      case 'title': filtered.sort((a,b) => a.title.localeCompare(b.title)); break;
    }
    return filtered;
  }

  // ========== RENDER ==========
  function renderAssignments() {
    const filtered = filterAndSort();
    assignmentsList.innerHTML = '';
    dashboardView.style.display = 'none';

    if (currentFilter === 'dashboard') {
      renderDashboard();
      return;
    }

    if (filtered.length === 0) {
      assignmentsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="far fa-check-circle"></i></div>
          <p class="empty-title">${searchQuery ? 'No results' : 'All clear'}</p>
          <p class="empty-sub">${searchQuery ? 'Try another search' : 'Add an assignment to get started'}</p>
        </div>`;
      updateStats();
      return;
    }

    filtered.forEach((a, index) => {
      const card = document.createElement('div');
      card.className = `assignment-card ${a.completed ? 'completed' : ''}`;
      card.draggable = true;
      card.dataset.id = a.id;
      card.dataset.index = index;

      const priorityClass = a.priority === 'urgent' ? 'urgent' : (a.priority === 'low' ? 'low' : '');
      let dueClass = '';
      if (!a.completed && isOverdue(a.dueDate)) dueClass = 'overdue';
      else if (!a.completed && isToday(a.dueDate)) dueClass = 'today';

      const subjColor = getSubjectColor(a.subject);

      card.innerHTML = `
        <div class="assignment-left">
          <div class="priority-indicator ${priorityClass}"></div>
          <div class="assignment-content">
            <span class="assignment-title">${esc(a.title)}</span>
            <div class="assignment-meta">
              <span class="subject-tag" style="background: ${subjColor}">${esc(a.subject)}</span>
              <span class="due-tag ${dueClass}">
                <i class="far fa-calendar-alt"></i>
                ${isToday(a.dueDate) ? 'Today' : formatDate(a.dueDate)}
                ${dueClass === 'overdue' ? ' · Overdue' : ''}
              </span>
            </div>
          </div>
        </div>
        <span class="drag-handle" title="Drag to reorder"><i class="fas fa-grip-vertical"></i></span>
        <button class="check-btn" data-id="${a.id}"><i class="fas fa-check"></i></button>
      `;

      // Click card to open detail modal
      card.addEventListener('click', (e) => {
        if (e.target.closest('.check-btn') || e.target.closest('.drag-handle')) return;
        openDetailModal(a.id);
      });

      // Drag events
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragover', handleDragOver);
      card.addEventListener('drop', handleDrop);
      card.addEventListener('dragend', handleDragEnd);

      assignmentsList.appendChild(card);
    });

    document.querySelectorAll('.check-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleComplete(btn.dataset.id);
      });
    });

    updateStats();
    updateSubjectDatalist();
  }

  function updateSubjectDatalist() {
    const subjects = [...new Set(assignments.map(a => a.subject))];
    subjectSuggestions.innerHTML = subjects.map(s => `<option value="${esc(s)}">`).join('');
  }

  // ========== DRAG & DROP ==========
  function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (this !== draggedCard) {
      this.style.borderTop = '2px solid var(--accent)';
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    this.style.borderTop = '';
    if (draggedCard !== this) {
      const allCards = [...assignmentsList.querySelectorAll('.assignment-card')];
      const fromIndex = allCards.indexOf(draggedCard);
      const toIndex = allCards.indexOf(this);
      const fromId = draggedCard.dataset.id;
      const toId = this.dataset.id;
      const fromIdx = assignments.findIndex(a => a.id === fromId);
      const toIdx = assignments.findIndex(a => a.id === toId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const [moved] = assignments.splice(fromIdx, 1);
        assignments.splice(toIdx, 0, moved);
        renderAssignments();
        saveAll();
        haptic('light');
      }
    }
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    draggedCard = null;
    document.querySelectorAll('.assignment-card').forEach(c => c.style.borderTop = '');
  }

  // ========== DETAIL MODAL ==========
  function openDetailModal(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    currentModalId = id;
    $('#modalAssignmentTitle').textContent = a.title;
    $('#modalSubject').textContent = a.subject;
    $('#modalDueDate').textContent = formatDate(a.dueDate) + (isToday(a.dueDate) ? ' (Today)' : '') + (isOverdue(a.dueDate) ? ' (Overdue)' : '');
    $('#modalPriority').textContent = a.priority.charAt(0).toUpperCase() + a.priority.slice(1);
    $('#modalNotes').value = a.notes || '';
    detailModal.style.display = 'flex';
  }

  function closeModal() {
    detailModal.style.display = 'none';
    currentModalId = null;
  }

  $('#modalClose').addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => { if (e.target === detailModal) closeModal(); });

  $('#modalSave').addEventListener('click', () => {
    if (!currentModalId) return;
    const a = assignments.find(x => x.id === currentModalId);
    if (a) {
      a.notes = $('#modalNotes').value;
      saveAll();
      showToast('Notes saved');
      haptic('success');
    }
  });

  $('#modalDelete').addEventListener('click', () => {
    if (!currentModalId) return;
    if (confirm('Delete this assignment?')) {
      assignments = assignments.filter(a => a.id !== currentModalId);
      closeModal();
      renderAssignments();
      saveAll();
      showToast('Assignment deleted');
      haptic('delete');
    }
  });

  // ========== DASHBOARD ==========
  function renderDashboard() {
    assignmentsList.innerHTML = '';
    dashboardView.style.display = 'block';
    updateStats();
    renderSubjectChart();
    renderWeekStats();
    renderTrendBars();
  }

  function renderSubjectChart() {
    const counts = {};
    assignments.forEach(a => {
      const key = a.subject.toLowerCase();
      if (!counts[key]) counts[key] = { subject: a.subject, count: 0, completed: 0 };
      counts[key].count++;
      if (a.completed) counts[key].completed++;
    });
    const entries = Object.values(counts).sort((a,b) => b.count - a.count);
    const max = entries.length > 0 ? entries[0].count : 1;
    subjectChart.innerHTML = entries.map(e => `
      <div class="subject-row">
        <div class="subject-dot" style="background: ${getSubjectColor(e.subject)}"></div>
        <span style="flex:1;font-size:0.7rem;color:var(--text-primary)">${esc(e.subject)}</span>
        <span style="font-size:0.65rem;color:var(--text-secondary)">${e.completed}/${e.count}</span>
        <div class="subject-bar-container" style="width:40%">
          <div class="subject-bar" style="width:${(e.count/max)*100}%;background:${getSubjectColor(e.subject)}"></div>
        </div>
      </div>
    `).join('') || '<p style="font-size:0.7rem;color:var(--text-secondary)">No data yet</p>';
  }

  function renderWeekStats() {
    const today = new Date();
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
    const weekAssignments = assignments.filter(a => {
      const d = new Date(a.dueDate + 'T00:00:00');
      return d >= weekStart && d <= weekEnd;
    });
    const completed = weekAssignments.filter(a => a.completed).length;
    weekStats.innerHTML = `
      <div class="week-stat-row"><span>Due this week</span><span>${weekAssignments.length}</span></div>
      <div class="week-stat-row"><span>Completed</span><span>${completed}</span></div>
      <div class="week-stat-row"><span>Remaining</span><span>${weekAssignments.length - completed}</span></div>
      <div class="week-stat-row"><span>Overdue</span><span style="color:var(--red)">${assignments.filter(a => !a.completed && isOverdue(a.dueDate)).length}</span></div>
    `;
  }

  function renderTrendBars() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    }
    const data = days.map(day => {
      const dayAssignments = assignments.filter(a => a.dueDate === day);
      const completed = dayAssignments.filter(a => a.completed).length;
      return { day, total: dayAssignments.length, completed, label: new Date(day+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}) };
    });
    const maxTotal = Math.max(...data.map(d => d.total), 1);
    trendBars.innerHTML = data.map(d => `
      <div class="trend-bar-wrapper">
        <div class="trend-bar" style="height:${(d.total/maxTotal)*50}px;background:${d.total>0?'var(--accent)':'var(--border)'}"></div>
        <span class="trend-label">${d.label}</span>
      </div>
    `).join('');
  }

  // ========== ACTIONS ==========
  function addAssignment(subject, title, dueDate, priority) {
    assignments.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2,5),
      subject: subject.trim(),
      title: title.trim(),
      dueDate,
      priority,
      completed: false,
      notes: ''
    });
    renderAssignments();
    saveAll();
    generateSuggestion();
    playSound('add');
    haptic('light');
    showToast('Assignment added ✓');
  }

  function toggleComplete(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    a.completed = !a.completed;
    if (a.completed) {
      const today = getToday();
      if (lastCompletedDate !== today) {
        lastCompletedDate = today;
        streak = Math.min(streak + 1, 365);
      }
      playSound('complete');
      haptic('success');
      showToast('Completed! 🎉');
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
      showToast('Cleared completed');
    }
  }

  function exportData() {
    const data = {
      assignments,
      streak,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homework-backup-${getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported');
  }

  // ========== STORAGE ==========
  function saveAll() {
    localStorage.setItem('hwData', JSON.stringify(assignments));
    localStorage.setItem('hwStreak', streak);
    localStorage.setItem('hwLastDate', lastCompletedDate || '');
    localStorage.setItem('hwSubjectColors', JSON.stringify(subjectColorMap));
    localStorage.setItem('hwSort', sortOrder);
  }

  function loadAll() {
    try { const d = localStorage.getItem('hwData'); if (d) assignments = JSON.parse(d); } catch(e) { assignments = []; }
    streak = parseInt(localStorage.getItem('hwStreak')) || 0;
    lastCompletedDate = localStorage.getItem('hwLastDate') || null;
    sortOrder = localStorage.getItem('hwSort') || 'date-asc';
    try { const c = localStorage.getItem('hwSubjectColors'); if (c) subjectColorMap = JSON.parse(c); } catch(e) { subjectColorMap = {}; }
  }

  // ========== FILTER HANDLING ==========
  function setFilter(filterValue) {
    currentFilter = filterValue;
    filterChips.forEach(chip => chip.classList.toggle('active', chip.dataset.filter === filterValue));
    renderAssignments();
  }

  // ========== SORT ==========
  function cycleSort() {
    const orders = ['date-asc', 'date-desc', 'subject', 'title'];
    const icons = ['fa-arrow-down-a-z', 'fa-arrow-up-a-z', 'fa-font', 'fa-heading'];
    const idx = orders.indexOf(sortOrder);
    sortOrder = orders[(idx + 1) % orders.length];
    sortBtn.querySelector('i').className = `fas ${icons[(idx+1)%orders.length]}`;
    localStorage.setItem('hwSort', sortOrder);
    renderAssignments();
    showToast(`Sorted by ${sortOrder.replace('-',' ')}`);
  }

  // ========== EVENT LISTENERS ==========
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
    dueDateInput.value = getToday();
  });

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => setFilter(chip.dataset.filter));
  });

  searchInput.addEventListener('input', e => { searchQuery = e.target.value; renderAssignments(); });
  themeToggle.addEventListener('click', toggleTheme);
  clearCompletedBtn.addEventListener('click', clearCompleted);
  exportBtn.addEventListener('click', exportData);
  sortBtn.addEventListener('click', cycleSort);

  // Keyboard shortcut for search
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      closeModal();
      searchInput.blur();
    }
  });

  // ========== NOTIFICATIONS (simulated) ==========
  function checkDueReminders() {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
    const dueTomorrow = assignments.filter(a => !a.completed && a.dueDate === tomorrowStr);
    if (dueTomorrow.length > 0) {
      new Notification('📚 Homework due tomorrow', {
        body: `${dueTomorrow.length} assignment${dueTomorrow.length>1?'s':''} due tomorrow`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📚</text></svg>'
      });
    }
  }

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission(), 5000);
  }

  // ========== INIT ==========
  function init() {
    loadTheme();
    setCurrentDate();
    loadAll();
    dueDateInput.value = getToday();
    sortBtn.querySelector('i').className = 'fas fa-arrow-down-a-z';
    renderAssignments();
    generateSuggestion();
    // Check reminders periodically
    setInterval(checkDueReminders, 3600000); // every hour
    checkDueReminders();
  }

  init();
})();
