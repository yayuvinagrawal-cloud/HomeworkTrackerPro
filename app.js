// app.js – Homework Tracker v4.0 (All Features)
(function() {
  // ========== STATE ==========
  let assignments = [];
  let archivedAssignments = [];
  let streak = 0;
  let lastCompletedDate = null;
  let subjectColorMap = {};
  let sortOrder = 'date-asc';
  let currentModalId = null;
  let soundEnabled = true;
  let focusMode = false;
  let bulkSelectMode = false;
  let selectedIds = new Set();
  let undoHistory = [];
  let confettiFiredForThisSet = false;
  let confettiActive = false;

  // ========== DOM ==========
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const skeletonLoader = $('#skeletonLoader');
  const mainContent = $('#mainContent');
  const form = $('#assignmentForm');
  const subjectInput = $('#subjectInput');
  const titleInput = $('#titleInput');
  const dueDateInput = $('#dueDateInput');
  const prioritySelect = $('#prioritySelect');
  const recurringSelect = $('#recurringSelect');
  const estimateInput = $('#estimateInput');
  const assignmentsList = $('#assignmentsList');
  const dashboardView = $('#dashboardView');
  const archiveView = $('#archiveView');
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
  const shareBtn = $('#shareBtn');
  const streakCountEl = $('#streakCount');
  const progressRing = $('#progressRing');
  const progressPercent = $('#progressPercent');
  const smartSuggestion = $('#smartSuggestion');
  const suggestionText = $('#suggestionText');
  const suggestionAction = $('#suggestionAction');
  const sortBtn = $('#sortBtn');
  const detailModal = $('#detailModal');
  const shareModal = $('#shareModal');
  const pasteModal = $('#pasteModal');
  const subjectColorModal = $('#subjectColorModal');
  const toastContainer = $('#toastContainer');
  const subjectSuggestions = $('#subjectSuggestions');
  const subjectChart = $('#subjectChart');
  const weekStats = $('#weekStats');
  const trendBars = $('#trendBars');
  const confettiCanvas = $('#confettiCanvas');
  const focusModeBtn = $('#focusModeBtn');
  const soundToggleBtn = $('#soundToggleBtn');
  const bulkSelectBtn = $('#bulkSelectBtn');
  const bulkDeleteBtn = $('#bulkDeleteBtn');
  const workloadBadge = $('#workloadBadge');
  const workloadText = $('#workloadText');
  const pasteSyllabusBtn = $('#pasteSyllabusBtn');
  const pasteTextarea = $('#pasteTextarea');
  const shortcutHint = $('#shortcutHint');
  const tabTitle = $('#tabTitle');

  const CIRCUMFERENCE = 263.89;
  let currentFilter = 'all';
  let searchQuery = '';

  const colorPalette = ['#0071e3','#ff3b30','#34c759','#ff9500','#af52de','#5ac8fa','#ffcc00','#ff2d55','#ff375f','#30b0c7','#64d2ff','#ffd60a'];
  const quotes = [
    '"The secret of getting ahead is getting started." – Mark Twain',
    '"Do it now. Sometimes later becomes never."',
    '"You don\'t have to be great to start, but you have to start to be great."',
    '"Small progress is still progress."',
    '"Focus on being productive instead of busy."',
    '"The earlier you start, the earlier you finish."',
    '"Done is better than perfect."'
  ];

  // ========== HELPERS ==========
  function getSubjectColor(subject) {
    const key = subject.toLowerCase().trim();
    if (!subjectColorMap[key]) {
      const used = Object.values(subjectColorMap);
      const available = colorPalette.filter(c => !used.includes(c));
      subjectColorMap[key] = available[0] || colorPalette[Object.keys(subjectColorMap).length % colorPalette.length];
    }
    return subjectColorMap[key];
  }

  function getToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function isOverdue(d) { return d < getToday(); }
  function isToday(d) { return d === getToday(); }
  function isSoon(d) { const today = getToday(); return d > today && d <= addDays(today, 2); }
  function esc(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

  // ========== ANIMATED COUNTERS ==========
  function animateNumber(el, start, end, duration = 400) {
    const range = end - start;
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + range * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ========== SKELETON ==========
  function showSkeleton() {
    skeletonLoader.style.display = 'flex';
    mainContent.style.display = 'none';
    setTimeout(() => { skeletonLoader.style.display = 'none'; mainContent.style.display = 'block'; }, 400);
  }

  // ========== CONFETTI ==========
  function launchConfetti() {
    if (confettiActive) return;
    confettiActive = true;
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    const particles = [];
    const subjectColors = Object.values(subjectColorMap);
    const colors = subjectColors.length > 0 ? subjectColors : ['#ff3b30','#ff9500','#ffcc00','#34c759','#0071e3','#af52de'];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width, y: -30,
        w: Math.random() * 10 + 4, h: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 8, vy: Math.random() * 4 + 3,
        rotation: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 12
      });
    }
    function animate() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let allDone = true;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rotation += p.rotationSpeed;
        if (p.y < confettiCanvas.height + 50) allDone = false;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); ctx.restore();
      });
      if (!allDone) requestAnimationFrame(animate);
      else confettiActive = false;
    }
    animate();
  }

  // ========== THEME ==========
  function getSystemTheme() { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function applyTheme(theme) {
    if (theme === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
    else { document.documentElement.removeAttribute('data-theme'); themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; }
  }
  function loadTheme() { applyTheme(localStorage.getItem('hwTheme') || getSystemTheme()); }
  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('hwTheme', next); applyTheme(next);
    showToast(`Switched to ${next} mode`);
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('hwTheme')) applyTheme(getSystemTheme());
  });

  // ========== TOAST ==========
  function showToast(msg, undoCallback = null) {
    const toast = document.createElement('div'); toast.className = 'toast';
    toast.innerHTML = `<span>${msg}</span>`;
    if (undoCallback) {
      const undoBtn = document.createElement('button'); undoBtn.className = 'undo-btn'; undoBtn.textContent = 'Undo';
      undoBtn.onclick = () => { undoCallback(); toast.remove(); };
      toast.appendChild(undoBtn);
    }
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, undoCallback ? 4000 : 2500);
  }

  // ========== HAPTICS & SOUND ==========
  function haptic(style = 'light') {
    if (navigator.vibrate) {
      if (style === 'success') navigator.vibrate([15,50,15]);
      else if (style === 'delete') navigator.vibrate([50]);
      else navigator.vibrate(10);
    }
  }
  function playSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === 'complete') { osc.frequency.value = 880; gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2); }
      else if (type === 'add') { osc.frequency.value = 660; gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15); }
    } catch(e) {}
  }

  // ========== PROGRESS ==========
  function updateProgressRing(percent) {
    progressRing.style.strokeDashoffset = CIRCUMFERENCE - (percent/100) * CIRCUMFERENCE;
    progressPercent.textContent = `${Math.round(percent)}%`;
  }

  function updateStats() {
    const total = assignments.length;
    const completed = assignments.filter(a => a.completed).length;
    const overdue = assignments.filter(a => !a.completed && isOverdue(a.dueDate)).length;
    const percent = total === 0 ? 0 : (completed/total)*100;
    updateProgressRing(percent);
    animateNumber(completedCountSpan, parseInt(completedCountSpan.textContent) || 0, completed);
    animateNumber(totalCountSpan, parseInt(totalCountSpan.textContent) || 0, total);
    animateNumber(overdueCountSpan, parseInt(overdueCountSpan.textContent) || 0, overdue);
    streakCountEl.textContent = streak;
    if (total > 0 && completed === total && !confettiFiredForThisSet) {
      confettiFiredForThisSet = true; setTimeout(launchConfetti, 200);
    }
    if (completed < total) confettiFiredForThisSet = false;
    updateTabTitle(overdue);
    updateWorkload();
  }

  function updateTabTitle(overdue) {
    if (overdue > 0) tabTitle.textContent = `(${overdue}) Homework • flow`;
    else tabTitle.textContent = 'Homework • flow';
  }

  function updateWorkload() {
    const today = getToday();
    const todayAssignments = assignments.filter(a => !a.completed && a.dueDate === today);
    const totalMin = todayAssignments.reduce((sum, a) => sum + (a.estimate || 0), 0);
    if (totalMin > 0) {
      workloadBadge.style.display = 'flex';
      workloadText.textContent = `Today's workload: ~${totalMin} min`;
    } else if (todayAssignments.length > 0) {
      workloadBadge.style.display = 'flex';
      workloadText.textContent = `${todayAssignments.length} assignment${todayAssignments.length>1?'s':''} due today`;
    } else {
      workloadBadge.style.display = 'none';
    }
  }

  function setCurrentDate() {
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const hour = today.getHours();
    greetingSubtitle.textContent = hour < 12 ? 'Good morning.' : hour < 18 ? 'Good afternoon.' : 'Good evening.';
  }

  // ========== RECURRING ==========
  function getNextRecurringDate(date, recurring) {
    switch(recurring) {
      case 'daily': return addDays(date, 1);
      case 'weekly': return addDays(date, 7);
      case 'biweekly': return addDays(date, 14);
      case 'monthly': return addDays(date, 30);
      default: return date;
    }
  }

  // ========== UNDO HISTORY ==========
  function pushUndo(action, data) {
    undoHistory.push({ action, data, time: Date.now() });
    if (undoHistory.length > 5) undoHistory.shift();
  }

  function undoLast() {
    if (undoHistory.length === 0) return false;
    const last = undoHistory.pop();
    if (last.action === 'complete') {
      const a = assignments.find(x => x.id === last.data.id);
      if (a) { a.completed = false; confettiFiredForThisSet = false; }
    } else if (last.action === 'delete') {
      assignments.push(last.data);
    } else if (last.action === 'clear') {
      assignments.push(...last.data);
    }
    renderAssignments(); saveAll();
    return true;
  }

  // ========== SMART SUGGESTION ==========
  function updateSuggestion() {
    const incompleteSubjects = [...new Set(assignments.filter(a => !a.completed).map(a => a.subject.toLowerCase()))];
    if (incompleteSubjects.length === 0) { smartSuggestion.style.display = 'none'; return; }
    const counts = {};
    assignments.filter(a => !a.completed).forEach(a => { const k = a.subject.toLowerCase(); counts[k] = (counts[k]||0)+1; });
    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
    if (sorted.length === 0) { smartSuggestion.style.display = 'none'; return; }
    const top = sorted[0][0];
    suggestionText.textContent = `You often have ${top} homework. Add one?`;
    smartSuggestion.style.display = 'flex';
    suggestionAction.onclick = function(e) {
      e.preventDefault(); e.stopPropagation();
      subjectInput.value = top; titleInput.focus(); smartSuggestion.style.display = 'none';
      return false;
    };
  }

  // ========== FILTER & SORT ==========
  function filterAndSort() {
    const today = getToday();
    const query = searchQuery.toLowerCase().trim();
    let filtered = assignments.filter(a => {
      if (query && !a.title.toLowerCase().includes(query) && !a.subject.toLowerCase().includes(query)) return false;
      if (focusMode && a.dueDate !== today && !isOverdue(a.dueDate)) return false;
      if (a.completed && currentFilter !== 'all' && currentFilter !== 'archive') return false;
      switch (currentFilter) {
        case 'today': return a.dueDate === today;
        case 'upcoming': return a.dueDate > today;
        case 'overdue': return a.dueDate < today && !a.completed;
        case 'archive': return false;
        default: return true;
      }
    });
    switch (sortOrder) {
      case 'date-asc': filtered.sort((a,b) => a.dueDate.localeCompare(b.dueDate)); break;
      case 'date-desc': filtered.sort((a,b) => b.dueDate.localeCompare(a.dueDate)); break;
      case 'subject': filtered.sort((a,b) => a.subject.localeCompare(b.subject)); break;
      case 'title': filtered.sort((a,b) => a.title.localeCompare(b.title)); break;
      case 'priority': const order = {urgent:0, normal:1, low:2}; filtered.sort((a,b) => order[a.priority] - order[b.priority]); break;
    }
    return filtered;
  }

  // ========== RENDER ==========
  function renderAssignments() {
    const today = getToday();
    assignments.forEach(a => {
      if (a.recurring !== 'none' && !a.completed && a.dueDate < today) {
        while (a.dueDate < today) a.dueDate = getNextRecurringDate(a.dueDate, a.recurring);
      }
    });

    if (currentFilter === 'dashboard') { renderDashboard(); return; }
    if (currentFilter === 'archive') { renderArchive(); return; }

    const filtered = filterAndSort();
    assignmentsList.innerHTML = '';
    dashboardView.style.display = 'none';
    archiveView.style.display = 'none';
    assignmentsList.style.display = 'flex';

    if (filtered.length === 0) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      assignmentsList.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><svg width="70" height="70" viewBox="0 0 80 80" fill="none"><rect x="14" y="10" width="52" height="60" rx="6" stroke="currentColor" stroke-width="2.5" fill="none"/><line x1="28" y1="10" x2="28" y2="70" stroke="currentColor" stroke-width="2.5"/><line x1="18" y1="28" x2="24" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="36" x2="24" y2="36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="34" y1="28" x2="50" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/><line x1="34" y1="36" x2="56" y2="36" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/></svg></div>
        <p class="empty-title">${searchQuery ? 'No results' : 'All clear'}</p>
        <p class="empty-sub">${searchQuery ? 'Try another search' : 'Add an assignment to get started'}</p>
        ${!searchQuery ? `<p class="empty-quote">${randomQuote}</p>` : ''}
      </div>`;
      updateStats(); return;
    }

    filtered.forEach(a => {
      const card = document.createElement('div');
      card.className = `assignment-card ${a.completed ? 'completed' : ''} ${selectedIds.has(a.id) ? 'selected' : ''}`;
      card.dataset.id = a.id;
      card.draggable = true;

      const daysUntil = Math.ceil((new Date(a.dueDate + 'T00:00:00') - new Date(today + 'T00:00:00')) / (1000*60*60*24));
      let urgencyClass = '';
      if (!a.completed && isOverdue(a.dueDate)) urgencyClass = 'overdue';
      else if (!a.completed && daysUntil <= 2 && daysUntil >= 0) urgencyClass = 'soon';

      card.innerHTML = `
        <div class="due-urgency-border ${urgencyClass}"></div>
        ${bulkSelectMode ? `<div class="select-checkbox" data-id="${a.id}"><i class="fas fa-check"></i></div>` : ''}
        <div class="assignment-left">
          <div class="priority-indicator ${a.priority==='urgent'?'urgent':a.priority==='low'?'low':''}"></div>
          <div class="assignment-content">
            <span class="assignment-title">${esc(a.title)}</span>
            <div class="assignment-meta">
              <span class="subject-tag" style="background:${getSubjectColor(a.subject)}">${esc(a.subject)}</span>
              <span class="due-tag ${!a.completed&&isOverdue(a.dueDate)?'overdue':!a.completed&&isToday(a.dueDate)?'today':urgencyClass==='soon'?'soon':''}">
                <i class="far fa-calendar-alt"></i> ${isToday(a.dueDate)?'Today':formatDate(a.dueDate)}
                ${!a.completed&&isOverdue(a.dueDate)?' · Overdue':urgencyClass==='soon'?` · ${daysUntil}d`:' '}
              </span>
              ${a.recurring!=='none'?`<span class="recurring-badge"><i class="fas fa-repeat"></i> ${a.recurring}</span>`:''}
              ${a.estimate?`<span class="estimate-badge"><i class="far fa-clock"></i> ${a.estimate}m</span>`:''}
            </div>
          </div>
        </div>
        <button class="check-btn" data-id="${a.id}"><i class="fas fa-check"></i></button>
      `;

      // Drag events
      card.addEventListener('dragstart', function(e) {
        if (bulkSelectMode) { e.preventDefault(); return; }
        this.classList.add('dragging'); e.dataTransfer.setData('text/plain', a.id);
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', function() { this.classList.remove('dragging'); });
      card.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('drag-over'); });
      card.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
      card.addEventListener('drop', function(e) {
        e.preventDefault(); this.classList.remove('drag-over');
        const fromId = e.dataTransfer.getData('text/plain');
        const toId = a.id;
        if (fromId !== toId) {
          const fromIdx = assignments.findIndex(x => x.id === fromId);
          const toIdx = assignments.findIndex(x => x.id === toId);
          if (fromIdx !== -1 && toIdx !== -1) {
            const [moved] = assignments.splice(fromIdx, 1);
            assignments.splice(toIdx, 0, moved);
            renderAssignments(); saveAll(); haptic('light');
          }
        }
      });

      // Click for detail or bulk select
      card.addEventListener('click', function(e) {
        if (e.target.closest('.check-btn')) return;
        if (e.target.closest('.select-checkbox')) {
          toggleSelect(a.id); return;
        }
        if (bulkSelectMode) { toggleSelect(a.id); return; }
        openDetailModal(a.id);
      });

      assignmentsList.appendChild(card);
    });

    document.querySelectorAll('.check-btn').forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault(); e.stopPropagation();
        toggleComplete(this.dataset.id); return false;
      };
    });

    updateStats(); updateSubjectDatalist();
  }

  function renderArchive() {
    assignmentsList.style.display = 'none';
    dashboardView.style.display = 'none';
    archiveView.style.display = 'flex';
    archiveView.innerHTML = archivedAssignments.length === 0
      ? `<div class="empty-state"><div class="empty-icon"><i class="fas fa-archive"></i></div><p class="empty-title">Empty archive</p><p class="empty-sub">Completed assignments will appear here</p></div>`
      : archivedAssignments.map(a => `
        <div class="assignment-card" style="opacity:0.7">
          <div class="assignment-left">
            <div class="assignment-content">
              <span class="assignment-title" style="text-decoration:line-through">${esc(a.title)}</span>
              <div class="assignment-meta">
                <span class="subject-tag" style="background:${getSubjectColor(a.subject)}">${esc(a.subject)}</span>
                <span class="due-tag"><i class="far fa-calendar-alt"></i> ${formatDate(a.dueDate)}</span>
              </div>
            </div>
          </div>
          <button class="btn-text" data-id="${a.id}" style="font-size:0.7rem;color:var(--accent)">Restore</button>
        </div>`).join('');
    document.querySelectorAll('.archive-view .btn-text').forEach(btn => {
      btn.onclick = function() {
        const a = archivedAssignments.find(x => x.id === this.dataset.id);
        if (a) { archivedAssignments = archivedAssignments.filter(x => x.id !== a.id); assignments.push({...a, completed: false}); renderAssignments(); saveAll(); showToast('Restored'); }
      };
    });
    updateStats();
  }

  // ========== MODAL ==========
  function openDetailModal(id) {
    if (bulkSelectMode) return;
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    currentModalId = id;
    $('#modalAssignmentTitle').textContent = a.title;
    $('#modalSubject').textContent = a.subject;
    $('#modalDueDate').textContent = formatDate(a.dueDate) + (isToday(a.dueDate)?' (Today)':'') + (isOverdue(a.dueDate)?' (Overdue)':'');
    $('#modalPriority').textContent = a.priority.charAt(0).toUpperCase() + a.priority.slice(1);
    $('#modalRecurring').textContent = a.recurring === 'none' ? 'One-time' : a.recurring;
    $('#modalEstimate').textContent = a.estimate ? `${a.estimate} minutes` : 'Not set';
    $('#modalNotes').value = a.notes || '';
    detailModal.style.display = 'flex';
  }
  function closeModal() { detailModal.style.display = 'none'; currentModalId = null; }

  // ========== BULK SELECT ==========
  function toggleBulkMode() {
    bulkSelectMode = !bulkSelectMode;
    bulkSelectBtn.classList.toggle('active', bulkSelectMode);
    bulkDeleteBtn.style.display = bulkSelectMode ? 'inline' : 'none';
    if (!bulkSelectMode) selectedIds.clear();
    renderAssignments();
  }

  function toggleSelect(id) {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    renderAssignments();
  }

  function bulkDelete() {
    if (selectedIds.size === 0) { showToast('Nothing selected'); return; }
    if (!confirm(`Delete ${selectedIds.size} assignment${selectedIds.size>1?'s':''}?`)) return;
    const deleted = assignments.filter(a => selectedIds.has(a.id));
    assignments = assignments.filter(a => !selectedIds.has(a.id));
    selectedIds.clear();
    pushUndo('clear', deleted);
    renderAssignments(); saveAll();
    showToast(`Deleted ${deleted.length} items`, () => {
      assignments.push(...deleted); renderAssignments(); saveAll();
    });
  }

  // ========== ACTIONS ==========
  function addAssignment(subject, title, dueDate, priority, recurring, estimate) {
    assignments.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2,5),
      subject: subject.trim(), title: title.trim(),
      dueDate, priority, recurring: recurring || 'none',
      estimate: estimate || 0, completed: false, notes: ''
    });
    renderAssignments(); saveAll(); updateSuggestion();
    playSound('add'); haptic('light');
    showToast('Assignment added ✓');
  }

  function toggleComplete(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    const wasCompleted = a.completed;
    a.completed = !a.completed;
    if (!a.completed && wasCompleted) { confettiFiredForThisSet = false; }
    if (a.completed && !wasCompleted) {
      const today = getToday();
      if (lastCompletedDate !== today) { lastCompletedDate = today; streak = Math.min(streak + 1, 365); }
      playSound('complete'); haptic('success');
      pushUndo('complete', { id });
      showToast('Completed! 🎉', () => {
        a.completed = false; confettiFiredForThisSet = false; renderAssignments(); saveAll();
      });
      // Auto-archive after 2 seconds
      setTimeout(() => {
        if (a.completed && assignments.includes(a)) {
          assignments = assignments.filter(x => x.id !== id);
          archivedAssignments.push(a);
          renderAssignments(); saveAll();
        }
      }, 2000);
    }
    renderAssignments(); saveAll();
  }

  function deleteAssignment(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    assignments = assignments.filter(x => x.id !== id);
    pushUndo('delete', {...a});
    renderAssignments(); saveAll();
    haptic('delete');
    showToast('Deleted', () => { assignments.push(a); renderAssignments(); saveAll(); });
  }

  function clearCompleted() {
    const completedItems = assignments.filter(a => a.completed);
    if (completedItems.length === 0) { showToast('No completed items'); return; }
    archivedAssignments.push(...completedItems);
    assignments = assignments.filter(a => !a.completed);
    confettiFiredForThisSet = false;
    pushUndo('clear', completedItems);
    renderAssignments(); saveAll();
    showToast(`Archived ${completedItems.length} items`, () => {
      archivedAssignments = archivedAssignments.filter(a => !completedItems.includes(a));
      assignments.push(...completedItems); renderAssignments(); saveAll();
    });
  }

  function pasteSyllabus() {
    const text = pasteTextarea.value.trim();
    if (!text) { showToast('Paste some text first'); return; }
    const lines = text.split('\n').filter(l => l.trim());
    let added = 0;
    lines.forEach(line => {
      const dateMatch = line.match(/(due|by)\s*:?\s*(\w+\s*\d{1,2}(?:st|nd|rd|th)?)/i) || line.match(/(\d{1,2}\/\d{1,2}(\/\d{2,4})?)/);
      const subjectMatch = line.match(/^(\w+)\s*[:|-]/);
      const title = line.replace(/due.*$/i, '').replace(/^\w+\s*[:|-]\s*/, '').trim();
      if (title) {
        let dueDate = getToday();
        if (dateMatch) {
          const dateStr = dateMatch[0].replace(/due\s*/i, '').replace(/by\s*/i, '').trim();
          const parsed = new Date(dateStr);
          if (!isNaN(parsed)) dueDate = `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`;
        }
        const subject = subjectMatch ? subjectMatch[1] : 'General';
        addAssignment(subject, title, dueDate, 'normal', 'none', 0);
        added++;
      }
    });
    pasteTextarea.value = '';
    pasteModal.style.display = 'none';
    showToast(`Extracted ${added} assignment${added!==1?'s':''}`);
  }

  // ========== SHARE ==========
  function generateShareLink() {
    const data = { assignments: assignments.map(a => ({ title:a.title, subject:a.subject, dueDate:a.dueDate, completed:a.completed })), generatedAt: new Date().toISOString() };
    return `${window.location.origin}${window.location.pathname}?shared=${btoa(encodeURIComponent(JSON.stringify(data)))}`;
  }
  function loadSharedData() {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('shared');
    if (!shared) return false;
    try {
      const data = JSON.parse(decodeURIComponent(atob(shared)));
      if (data.assignments && Array.isArray(data.assignments)) {
        assignments = data.assignments.map((a, i) => ({...a, id:`shared-${i}-${Date.now()}`, priority:'normal', recurring:'none', notes:'', estimate:0, completed:false}));
        saveAll(); renderAssignments(); showToast('Imported shared list');
        window.history.replaceState({}, '', window.location.pathname); return true;
      }
    } catch(e) {}
    return false;
  }
  function exportData() {
    const data = { assignments, archivedAssignments, streak, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `homework-backup-${getToday()}.json`; a.click();
    URL.revokeObjectURL(url); showToast('Backup exported');
  }

  // ========== SUBJECT COLORS MODAL ==========
  function openSubjectColorModal() {
    const subjects = [...new Set(assignments.map(a => a.subject))];
    $('#subjectColorList').innerHTML = subjects.map(s => `
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
        <span style="width:20px;height:20px;border-radius:50%;background:${getSubjectColor(s)}"></span>
        <span style="flex:1;font-size:0.82rem;">${esc(s)}</span>
        <input type="color" value="${getSubjectColor(s)}" data-subject="${esc(s.toLowerCase())}" style="width:30px;height:30px;border:none;cursor:pointer;">
      </div>`).join('');
    document.querySelectorAll('#subjectColorList input[type=color]').forEach(input => {
      input.addEventListener('change', function() {
        subjectColorMap[this.dataset.subject] = this.value;
        renderAssignments(); saveAll();
      });
    });
    subjectColorModal.style.display = 'flex';
  }

  // ========== STORAGE ==========
  function saveAll() {
    localStorage.setItem('hwData', JSON.stringify(assignments));
    localStorage.setItem('hwArchive', JSON.stringify(archivedAssignments));
    localStorage.setItem('hwStreak', streak);
    localStorage.setItem('hwLastDate', lastCompletedDate || '');
    localStorage.setItem('hwSubjectColors', JSON.stringify(subjectColorMap));
    localStorage.setItem('hwSort', sortOrder);
    localStorage.setItem('hwSound', soundEnabled);
  }
  function loadAll() {
    try { const d = localStorage.getItem('hwData'); if (d) assignments = JSON.parse(d); } catch(e) {}
    try { const a = localStorage.getItem('hwArchive'); if (a) archivedAssignments = JSON.parse(a); } catch(e) {}
    streak = parseInt(localStorage.getItem('hwStreak')) || 0;
    lastCompletedDate = localStorage.getItem('hwLastDate') || null;
    sortOrder = localStorage.getItem('hwSort') || 'date-asc';
    try { const c = localStorage.getItem('hwSubjectColors'); if (c) subjectColorMap = JSON.parse(c); } catch(e) {}
    soundEnabled = localStorage.getItem('hwSound') !== 'false';
    if (!soundEnabled) soundToggleBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
  }
  function updateSubjectDatalist() {
    subjectSuggestions.innerHTML = [...new Set(assignments.map(a => a.subject))].map(s => `<option value="${esc(s)}">`).join('');
  }

  // ========== DASHBOARD ==========
  function renderDashboard() {
    assignmentsList.style.display = 'none';
    archiveView.style.display = 'none';
    dashboardView.style.display = 'block';
    updateStats();
    const counts = {};
    assignments.forEach(a => { const k = a.subject.toLowerCase(); if (!counts[k]) counts[k] = { subject:a.subject, count:0, completed:0 }; counts[k].count++; if (a.completed) counts[k].completed++; });
    const entries = Object.values(counts).sort((a,b) => b.count-a.count);
    const max = entries[0]?.count || 1;
    subjectChart.innerHTML = entries.map(e => `<div class="subject-row"><div class="subject-dot" style="background:${getSubjectColor(e.subject)}"></div><span style="flex:1;font-size:0.7rem;color:var(--text-primary)">${esc(e.subject)}</span><span style="font-size:0.65rem;color:var(--text-secondary)">${e.completed}/${e.count}</span><div class="subject-bar-container" style="width:40%"><div class="subject-bar" style="width:${(e.count/max)*100}%;background:${getSubjectColor(e.subject)}"></div></div></div>`).join('') || '<p style="font-size:0.7rem;color:var(--text-secondary)">No data</p>';
    const today = new Date();
    const weekStart = new Date(today); weekStart.setDate(today.getDate()-today.getDay());
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6);
    const weekAssignments = assignments.filter(a => { const d = new Date(a.dueDate+'T00:00:00'); return d>=weekStart && d<=weekEnd; });
    const wCompleted = weekAssignments.filter(a=>a.completed).length;
    weekStats.innerHTML = `<div class="week-stat-row"><span>Due this week</span><span>${weekAssignments.length}</span></div><div class="week-stat-row"><span>Completed</span><span>${wCompleted}</span></div><div class="week-stat-row"><span>Remaining</span><span>${weekAssignments.length-wCompleted}</span></div><div class="week-stat-row"><span>Overdue</span><span style="color:var(--red)">${assignments.filter(a=>!a.completed&&isOverdue(a.dueDate)).length}</span></div>`;
    const days = [];
    for (let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`); }
    const todayStr = getToday();
    const data = days.map(day => ({ total: assignments.filter(a=>a.dueDate===day).length, label: new Date(day+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}), isToday: day === todayStr }));
    const maxTotal = Math.max(...data.map(d=>d.total),1);
    trendBars.innerHTML = data.map(d => `<div class="trend-bar-wrapper"><div class="trend-bar ${d.isToday?'today':''}" style="height:${(d.total/maxTotal)*50}px;background:${d.total>0?(d.isToday?'var(--accent)':'var(--accent)'):'var(--border)'}"></div><span class="trend-label ${d.isToday?'today':''}">${d.label}</span></div>`).join('');
  }

  // ========== FILTER & SORT CONTROLS ==========
  function setFilter(filterValue) {
    currentFilter = filterValue;
    filterChips.forEach(chip => chip.classList.toggle('active', chip.dataset.filter === filterValue));
    if (filterValue === 'archive' || filterValue === 'dashboard') { searchInput.value = ''; searchQuery = ''; }
    renderAssignments();
  }
  function cycleSort() {
    const orders = ['date-asc','date-desc','subject','title','priority'];
    const icons = ['fa-arrow-down-a-z','fa-arrow-up-a-z','fa-font','fa-heading','fa-flag'];
    const idx = orders.indexOf(sortOrder);
    sortOrder = orders[(idx+1)%orders.length];
    sortBtn.querySelector('i').className = `fas ${icons[(idx+1)%orders.length]}`;
    localStorage.setItem('hwSort', sortOrder);
    renderAssignments();
    showToast(`Sorted: ${sortOrder.replace('-',' ')}`);
  }

  // ========== EVENT LISTENERS ==========
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const subject = subjectInput.value.trim();
    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = prioritySelect.value;
    const recurring = recurringSelect.value;
    const estimate = parseInt(estimateInput.value) || 0;
    if (!subject || !title || !dueDate) { showToast('Fill in all fields'); return; }
    addAssignment(subject, title, dueDate, priority, recurring, estimate);
    form.reset(); prioritySelect.value = 'normal'; recurringSelect.value = 'none'; estimateInput.value = '';
    dueDateInput.value = getToday();
  });

  filterChips.forEach(chip => chip.addEventListener('click', function() { setFilter(this.dataset.filter); }));
  searchInput.addEventListener('input', function() { searchQuery = this.value; renderAssignments(); });
  themeToggle.addEventListener('click', toggleTheme);
  sortBtn.addEventListener('click', cycleSort);
  exportBtn.addEventListener('click', exportData);
  shareBtn.addEventListener('click', () => { $('#shareLinkInput').value = generateShareLink(); shareModal.style.display = 'flex'; });
  pasteSyllabusBtn.addEventListener('click', () => { pasteModal.style.display = 'flex'; });
  focusModeBtn.addEventListener('click', () => { focusMode = !focusMode; focusModeBtn.classList.toggle('active', focusMode); renderAssignments(); showToast(focusMode ? 'Focus mode on' : 'Focus mode off'); });
  soundToggleBtn.addEventListener('click', () => { soundEnabled = !soundEnabled; soundToggleBtn.innerHTML = soundEnabled ? '<i class="fas fa-volume-high"></i>' : '<i class="fas fa-volume-xmark"></i>'; localStorage.setItem('hwSound', soundEnabled); showToast(soundEnabled ? 'Sound on' : 'Sound muted'); });
  bulkSelectBtn.addEventListener('click', toggleBulkMode);
  bulkDeleteBtn.addEventListener('click', bulkDelete);
  clearCompletedBtn.onclick = function(e) { e.preventDefault(); clearCompleted(); return false; };

  $('#modalClose').addEventListener('click', closeModal);
  detailModal.addEventListener('click', function(e) { if (e.target === detailModal) closeModal(); });
  $('#modalSave').addEventListener('click', function() {
    if (!currentModalId) return;
    const a = assignments.find(x => x.id === currentModalId);
    if (a) { a.notes = $('#modalNotes').value; saveAll(); showToast('Notes saved ✓'); haptic('success'); }
  });
  $('#modalDelete').addEventListener('click', function() { if (!currentModalId) return; deleteAssignment(currentModalId); closeModal(); });
  $('#shareModalClose').addEventListener('click', () => shareModal.style.display = 'none');
  shareModal.addEventListener('click', function(e) { if (e.target === shareModal) shareModal.style.display = 'none'; });
  $('#copyShareLink').addEventListener('click', () => { const i = $('#shareLinkInput'); i.select(); navigator.clipboard.writeText(i.value).then(() => showToast('Link copied!')); });
  $('#pasteModalClose').addEventListener('click', () => pasteModal.style.display = 'none');
  pasteModal.addEventListener('click', function(e) { if (e.target === pasteModal) pasteModal.style.display = 'none'; });
  $('#pasteExtractBtn').addEventListener('click', pasteSyllabus);
  $('#subjectColorClose').addEventListener('click', () => subjectColorModal.style.display = 'none');
  subjectColorModal.addEventListener('click', function(e) { if (e.target === subjectColorModal) subjectColorModal.style.display = 'none'; });

  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchInput.focus(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); if (undoLast()) showToast('Undo ✓'); }
    if (e.key === 'Escape') { closeModal(); shareModal.style.display = 'none'; pasteModal.style.display = 'none'; subjectColorModal.style.display = 'none'; if (bulkSelectMode) toggleBulkMode(); }
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement === document.body) { e.preventDefault(); titleInput.focus(); }
  });

  // Double click logo to open subject colors
  document.querySelector('.logo-mark').addEventListener('dblclick', openSubjectColorModal);

  // Hide shortcut hint after 8 seconds
  setTimeout(() => { shortcutHint.style.opacity = '0'; setTimeout(() => shortcutHint.remove(), 500); }, 8000);

  // ========== NOTIFICATIONS ==========
  function checkDueReminders() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const tomorrowStr = addDays(getToday(), 1);
    const dueTomorrow = assignments.filter(a => !a.completed && a.dueDate === tomorrowStr);
    if (dueTomorrow.length > 0) new Notification('📚 Homework due tomorrow', { body: `${dueTomorrow.length} assignment${dueTomorrow.length>1?'s':''} due tomorrow` });
  }
  if ('Notification' in window && Notification.permission === 'default') setTimeout(() => Notification.requestPermission(), 3000);

  // ========== INIT ==========
  function init() {
    loadTheme(); setCurrentDate(); loadAll();
    dueDateInput.value = getToday();
    sortBtn.querySelector('i').className = 'fas fa-arrow-down-a-z';
    if (!soundEnabled) soundToggleBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
    showSkeleton();
    setTimeout(() => {
      if (!loadSharedData()) renderAssignments();
      updateSuggestion();
    }, 450);
    setInterval(checkDueReminders, 3600000);
    checkDueReminders();
  }

  init();
})();
