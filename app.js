// app.js – Homework Tracker v3.0.1 (Fixed check button)
// Confetti + Swipe + Undo + Skeleton + Recurring + Share + all previous features

(function() {
  // ========== STATE ==========
  let assignments = [];
  let streak = 0;
  let lastCompletedDate = null;
  let subjectColorMap = {};
  let sortOrder = 'date-asc';
  let currentModalId = null;
  let undoStack = [];

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
  const toastContainer = $('#toastContainer');
  const subjectSuggestions = $('#subjectSuggestions');
  const subjectChart = $('#subjectChart');
  const weekStats = $('#weekStats');
  const trendBars = $('#trendBars');
  const confettiCanvas = $('#confettiCanvas');

  const CIRCUMFERENCE = 263.89;
  let currentFilter = 'all';
  let searchQuery = '';
  let swipeStartX = 0;
  let swipeCurrentX = 0;
  let swipingCard = null;
  let isSwiping = false;

  const colorPalette = ['#0071e3','#ff3b30','#34c759','#ff9500','#af52de','#5ac8fa','#ffcc00','#ff2d55'];

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
  function esc(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

  // ========== SKELETON LOADING ==========
  function showSkeleton() {
    skeletonLoader.style.display = 'flex';
    mainContent.style.display = 'none';
    setTimeout(() => {
      skeletonLoader.style.display = 'none';
      mainContent.style.display = 'block';
    }, 600);
  }

  // ========== CONFETTI ==========
  function launchConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#ff3b30','#ff9500','#ffcc00','#34c759','#0071e3','#af52de','#5ac8fa'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height * -1,
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    function animate() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let allDone = true;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.y < confettiCanvas.height + 20) allDone = false;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      if (!allDone) requestAnimationFrame(animate);
    }
    animate();
  }

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
    applyTheme(saved || getSystemTheme());
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('hwTheme', next);
    applyTheme(next);
    showToast(`Switched to ${next} mode`);
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('hwTheme')) applyTheme(getSystemTheme());
  });

  // ========== TOAST + UNDO ==========
  function showToast(msg, undoCallback = null) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${msg}</span>`;
    if (undoCallback) {
      const undoBtn = document.createElement('button');
      undoBtn.className = 'undo-btn';
      undoBtn.textContent = 'Undo';
      undoBtn.addEventListener('click', () => {
        undoCallback();
        toast.remove();
      });
      toast.appendChild(undoBtn);
    }
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), undoCallback ? 4000 : 3000);
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
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === 'complete') {
        osc.frequency.value = 880; osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'add') {
        osc.frequency.value = 660; osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
      }
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
    completedCountSpan.textContent = completed;
    totalCountSpan.textContent = total;
    overdueCountSpan.textContent = overdue;
    streakCountEl.textContent = streak;

    if (total > 0 && completed === total) {
      launchConfetti();
    }
  }

  function setCurrentDate() {
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const hour = today.getHours();
    greetingSubtitle.textContent = hour < 12 ? 'Good morning.' : hour < 18 ? 'Good afternoon.' : 'Good evening.';
  }

  // ========== RECURRING ==========
  function getNextRecurringDate(currentDate, recurring) {
    switch(recurring) {
      case 'daily': return addDays(currentDate, 1);
      case 'weekly': return addDays(currentDate, 7);
      case 'biweekly': return addDays(currentDate, 14);
      case 'monthly': return addDays(currentDate, 30);
      default: return currentDate;
    }
  }

  function processRecurring(assignment) {
    if (assignment.recurring === 'none' || assignment.completed) return;
    const today = getToday();
    if (assignment.dueDate <= today) {
      const nextDate = getNextRecurringDate(assignment.dueDate, assignment.recurring);
      if (nextDate > today) {
        assignment.dueDate = nextDate;
      }
    }
  }

  // ========== SMART SUGGESTIONS ==========
  function generateSuggestion() {
    const subjects = [...new Set(assignments.map(a => a.subject.toLowerCase()))];
    if (subjects.length === 0) { smartSuggestion.style.display = 'none'; return; }
    const counts = {};
    assignments.forEach(a => { const k = a.subject.toLowerCase(); counts[k] = (counts[k]||0)+1; });
    const top = Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0];
    suggestionText.textContent = `You often have ${top} homework. Add one?`;
    suggestionAction.onclick = () => { subjectInput.value = top; titleInput.focus(); smartSuggestion.style.display = 'none'; };
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
    assignments.forEach(a => processRecurring(a));
    const filtered = filterAndSort();
    assignmentsList.innerHTML = '';
    dashboardView.style.display = 'none';

    if (currentFilter === 'dashboard') { renderDashboard(); return; }

    if (filtered.length === 0) {
      assignmentsList.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="far fa-check-circle"></i></div><p class="empty-title">${searchQuery?'No results':'All clear'}</p><p class="empty-sub">${searchQuery?'Try another search':'Add an assignment to get started'}</p></div>`;
      updateStats(); return;
    }

    filtered.forEach(a => {
      const card = document.createElement('div');
      card.className = `assignment-card ${a.completed ? 'completed' : ''}`;
      card.dataset.id = a.id;
      card.innerHTML = `
        <div class="swipe-indicator left"><i class="fas fa-trash"></i></div>
        <div class="assignment-left">
          <div class="priority-indicator ${a.priority==='urgent'?'urgent':a.priority==='low'?'low':''}"></div>
          <div class="assignment-content">
            <span class="assignment-title">${esc(a.title)}</span>
            <div class="assignment-meta">
              <span class="subject-tag" style="background:${getSubjectColor(a.subject)}">${esc(a.subject)}</span>
              <span class="due-tag ${!a.completed&&isOverdue(a.dueDate)?'overdue':!a.completed&&isToday(a.dueDate)?'today':''}">
                <i class="far fa-calendar-alt"></i> ${isToday(a.dueDate)?'Today':formatDate(a.dueDate)}
                ${!a.completed&&isOverdue(a.dueDate)?' · Overdue':''}
              </span>
              ${a.recurring!=='none'?`<span class="recurring-badge"><i class="fas fa-repeat"></i> ${a.recurring}</span>`:''}
            </div>
          </div>
        </div>
        <div class="swipe-indicator right"><i class="fas fa-check"></i></div>
        <button class="check-btn" data-id="${a.id}"><i class="fas fa-check"></i></button>
      `;

      // FIXED: Check button click - stop propagation properly
      const checkBtn = card.querySelector('.check-btn');
      checkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleComplete(a.id);
      });

      // FIXED: Card click only opens modal if NOT swiping and NOT clicking check button
      card.addEventListener('click', (e) => {
        if (isSwiping) return;
        // Don't open modal if check button was clicked (safety check)
        if (e.target.closest('.check-btn')) return;
        openDetailModal(a.id);
      });

      // Swipe events
      card.addEventListener('touchstart', handleSwipeStart, {passive: true});
      card.addEventListener('touchmove', handleSwipeMove, {passive: false});
      card.addEventListener('touchend', handleSwipeEnd);
      card.addEventListener('mousedown', handleSwipeStart);

      assignmentsList.appendChild(card);
    });

    // Global mouse events for swipe
    window.removeEventListener('mousemove', handleSwipeMove);
    window.removeEventListener('mouseup', handleSwipeEnd);
    window.addEventListener('mousemove', handleSwipeMove);
    window.addEventListener('mouseup', handleSwipeEnd);

    updateStats();
    updateSubjectDatalist();
  }

  // ========== SWIPE GESTURES ==========
  function handleSwipeStart(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    swipingCard = e.target.closest('.assignment-card');
    if (!swipingCard) return;
    swipeStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    swipeCurrentX = swipeStartX;
    isSwiping = false;
  }

  function handleSwipeMove(e) {
    if (!swipingCard) return;
    const clientX = e.type.includes('mouse') ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : swipeCurrentX);
    swipeCurrentX = clientX;
    const deltaX = swipeCurrentX - swipeStartX;
    if (Math.abs(deltaX) > 5) {
      isSwiping = true;
      e.preventDefault();
      swipingCard.classList.add('swiping');
      swipingCard.style.transform = `translateX(${deltaX}px)`;
      const rightIndicator = swipingCard.querySelector('.swipe-indicator.right');
      const leftIndicator = swipingCard.querySelector('.swipe-indicator.left');
      if (rightIndicator) rightIndicator.style.opacity = deltaX > 40 ? Math.min(deltaX/80, 1) : 0;
      if (leftIndicator) leftIndicator.style.opacity = deltaX < -40 ? Math.min(Math.abs(deltaX)/80, 1) : 0;
    }
  }

  function handleSwipeEnd() {
    if (!swipingCard) return;
    const deltaX = swipeCurrentX - swipeStartX;
    swipingCard.classList.remove('swiping');
    swipingCard.style.transform = '';
    const rightIndicator = swipingCard.querySelector('.swipe-indicator.right');
    const leftIndicator = swipingCard.querySelector('.swipe-indicator.left');
    if (rightIndicator) rightIndicator.style.opacity = 0;
    if (leftIndicator) leftIndicator.style.opacity = 0;

    const id = swipingCard.dataset.id;
    if (deltaX > 80) {
      swipingCard.classList.add('swiped-right');
      setTimeout(() => { if (id) toggleComplete(id); }, 300);
    } else if (deltaX < -80) {
      swipingCard.classList.add('swiped-left');
      setTimeout(() => { if (id) deleteAssignment(id); }, 300);
    }
    swipingCard = null;
    isSwiping = false;
  }

  // ========== DETAIL MODAL ==========
  function openDetailModal(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    currentModalId = id;
    $('#modalAssignmentTitle').textContent = a.title;
    $('#modalSubject').textContent = a.subject;
    $('#modalDueDate').textContent = formatDate(a.dueDate) + (isToday(a.dueDate)?' (Today)':'') + (isOverdue(a.dueDate)?' (Overdue)':'');
    $('#modalPriority').textContent = a.priority.charAt(0).toUpperCase() + a.priority.slice(1);
    $('#modalRecurring').textContent = a.recurring === 'none' ? 'One-time' : a.recurring;
    $('#modalNotes').value = a.notes || '';
    detailModal.style.display = 'flex';
  }

  function closeModal() { detailModal.style.display = 'none'; currentModalId = null; }
  $('#modalClose').addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => { if (e.target === detailModal) closeModal(); });
  $('#modalSave').addEventListener('click', () => {
    if (!currentModalId) return;
    const a = assignments.find(x => x.id === currentModalId);
    if (a) { a.notes = $('#modalNotes').value; saveAll(); showToast('Notes saved'); haptic('success'); }
  });
  $('#modalDelete').addEventListener('click', () => {
    if (!currentModalId) return;
    deleteAssignment(currentModalId);
    closeModal();
  });

  // ========== ACTIONS ==========
  function addAssignment(subject, title, dueDate, priority, recurring) {
    assignments.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2,5),
      subject: subject.trim(), title: title.trim(),
      dueDate, priority, recurring: recurring || 'none',
      completed: false, notes: ''
    });
    renderAssignments(); saveAll(); generateSuggestion();
    playSound('add'); haptic('light');
    showToast('Assignment added ✓');
  }

  function toggleComplete(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    const wasCompleted = a.completed;
    a.completed = !a.completed;
    if (a.completed && !wasCompleted) {
      const today = getToday();
      if (lastCompletedDate !== today) { lastCompletedDate = today; streak = Math.min(streak+1, 365); }
      playSound('complete'); haptic('success');
      showToast('Completed! 🎉', () => { a.completed = false; renderAssignments(); saveAll(); });
    }
    renderAssignments(); saveAll();
  }

  function deleteAssignment(id) {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    const copy = {...a};
    assignments = assignments.filter(x => x.id !== id);
    renderAssignments(); saveAll();
    haptic('delete');
    showToast('Deleted', () => { assignments.push(copy); renderAssignments(); saveAll(); });
  }

  function clearCompleted() {
    if (!assignments.some(a => a.completed)) return;
    const completed = assignments.filter(a => a.completed);
    assignments = assignments.filter(a => !a.completed);
    renderAssignments(); saveAll();
    showToast(`Cleared ${completed.length} completed`, () => {
      assignments.push(...completed);
      renderAssignments(); saveAll();
    });
  }

  // ========== SHARE ==========
  function generateShareLink() {
    const data = {
      assignments: assignments.map(a => ({ title: a.title, subject: a.subject, dueDate: a.dueDate, completed: a.completed })),
      generatedAt: new Date().toISOString()
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    return `${window.location.origin}${window.location.pathname}?shared=${encoded}`;
  }

  function loadSharedData() {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('shared');
    if (!shared) return false;
    try {
      const data = JSON.parse(decodeURIComponent(atob(shared)));
      if (data.assignments && Array.isArray(data.assignments)) {
        assignments = data.assignments.map((a, i) => ({
          ...a,
          id: `shared-${i}-${Date.now()}`,
          priority: 'normal',
          recurring: 'none',
          notes: '',
          completed: false
        }));
        saveAll(); renderAssignments();
        showToast('Imported shared list');
        window.history.replaceState({}, '', window.location.pathname);
        return true;
      }
    } catch(e) {}
    return false;
  }

  function openShareModal() {
    $('#shareLinkInput').value = generateShareLink();
    shareModal.style.display = 'flex';
  }

  $('#shareBtn').addEventListener('click', openShareModal);
  $('#shareModalClose').addEventListener('click', () => shareModal.style.display = 'none');
  shareModal.addEventListener('click', (e) => { if (e.target === shareModal) shareModal.style.display = 'none'; });
  $('#copyShareLink').addEventListener('click', () => {
    navigator.clipboard.writeText($('#shareLinkInput').value).then(() => showToast('Link copied!'));
  });

  function exportData() {
    const data = { assignments, streak, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `homework-backup-${getToday()}.json`; a.click();
    URL.revokeObjectURL(url); showToast('Backup exported');
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
    try { const d = localStorage.getItem('hwData'); if (d) assignments = JSON.parse(d); } catch(e) {}
    streak = parseInt(localStorage.getItem('hwStreak')) || 0;
    lastCompletedDate = localStorage.getItem('hwLastDate') || null;
    sortOrder = localStorage.getItem('hwSort') || 'date-asc';
    try { const c = localStorage.getItem('hwSubjectColors'); if (c) subjectColorMap = JSON.parse(c); } catch(e) { subjectColorMap = {}; }
  }

  function updateSubjectDatalist() {
    const subjects = [...new Set(assignments.map(a => a.subject))];
    subjectSuggestions.innerHTML = subjects.map(s => `<option value="${esc(s)}">`).join('');
  }

  // ========== DASHBOARD ==========
  function renderDashboard() {
    assignmentsList.innerHTML = '';
    dashboardView.style.display = 'block';
    updateStats();
    const counts = {};
    assignments.forEach(a => {
      const k = a.subject.toLowerCase();
      if (!counts[k]) counts[k] = { subject: a.subject, count:0, completed:0 };
      counts[k].count++; if (a.completed) counts[k].completed++;
    });
    const entries = Object.values(counts).sort((a,b) => b.count-a.count);
    const max = entries[0]?.count || 1;
    subjectChart.innerHTML = entries.map(e => `
      <div class="subject-row">
        <div class="subject-dot" style="background:${getSubjectColor(e.subject)}"></div>
        <span style="flex:1;font-size:0.7rem;color:var(--text-primary)">${esc(e.subject)}</span>
        <span style="font-size:0.65rem;color:var(--text-secondary)">${e.completed}/${e.count}</span>
        <div class="subject-bar-container" style="width:40%"><div class="subject-bar" style="width:${(e.count/max)*100}%;background:${getSubjectColor(e.subject)}"></div></div>
      </div>`).join('') || '<p style="font-size:0.7rem;color:var(--text-secondary)">No data</p>';

    const today = new Date();
    const weekStart = new Date(today); weekStart.setDate(today.getDate()-today.getDay());
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6);
    const weekAssignments = assignments.filter(a => { const d = new Date(a.dueDate+'T00:00:00'); return d>=weekStart && d<=weekEnd; });
    const wCompleted = weekAssignments.filter(a=>a.completed).length;
    weekStats.innerHTML = `
      <div class="week-stat-row"><span>Due this week</span><span>${weekAssignments.length}</span></div>
      <div class="week-stat-row"><span>Completed</span><span>${wCompleted}</span></div>
      <div class="week-stat-row"><span>Remaining</span><span>${weekAssignments.length-wCompleted}</span></div>
      <div class="week-stat-row"><span>Overdue</span><span style="color:var(--red)">${assignments.filter(a=>!a.completed&&isOverdue(a.dueDate)).length}</span></div>`;

    const days = [];
    for (let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`); }
    const data = days.map(day => {
      const dayA = assignments.filter(a=>a.dueDate===day);
      return { total: dayA.length, label: new Date(day+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}) };
    });
    const maxTotal = Math.max(...data.map(d=>d.total),1);
    trendBars.innerHTML = data.map(d => `
      <div class="trend-bar-wrapper"><div class="trend-bar" style="height:${(d.total/maxTotal)*50}px;background:${d.total>0?'var(--accent)':'var(--border)'}"></div><span class="trend-label">${d.label}</span></div>`).join('');
  }

  // ========== FILTER ==========
  function setFilter(filterValue) {
    currentFilter = filterValue;
    filterChips.forEach(chip => chip.classList.toggle('active', chip.dataset.filter === filterValue));
    renderAssignments();
  }

  // ========== SORT ==========
  function cycleSort() {
    const orders = ['date-asc','date-desc','subject','title'];
    const icons = ['fa-arrow-down-a-z','fa-arrow-up-a-z','fa-font','fa-heading'];
    const idx = orders.indexOf(sortOrder);
    sortOrder = orders[(idx+1)%orders.length];
    sortBtn.querySelector('i').className = `fas ${icons[(idx+1)%orders.length]}`;
    localStorage.setItem('hwSort', sortOrder);
    renderAssignments();
  }

  // ========== EVENTS ==========
  form.addEventListener('submit', e => {
    e.preventDefault();
    const subject = subjectInput.value.trim();
    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = prioritySelect.value;
    const recurring = recurringSelect.value;
    if (!subject || !title || !dueDate) return;
    addAssignment(subject, title, dueDate, priority, recurring);
    form.reset();
    prioritySelect.value = 'normal';
    recurringSelect.value = 'none';
    dueDateInput.value = getToday();
  });

  filterChips.forEach(chip => chip.addEventListener('click', () => setFilter(chip.dataset.filter)));
  searchInput.addEventListener('input', e => { searchQuery = e.target.value; renderAssignments(); });
  themeToggle.addEventListener('click', toggleTheme);
  clearCompletedBtn.addEventListener('click', clearCompleted);
  exportBtn.addEventListener('click', exportData);
  sortBtn.addEventListener('click', cycleSort);

  document.addEventListener('keydown', e => {
    if ((e.metaKey||e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchInput.focus(); }
    if (e.key === 'Escape') { closeModal(); shareModal.style.display = 'none'; searchInput.blur(); }
  });

  // ========== NOTIFICATIONS ==========
  function checkDueReminders() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const tomorrowStr = addDays(getToday(), 1);
    const dueTomorrow = assignments.filter(a => !a.completed && a.dueDate === tomorrowStr);
    if (dueTomorrow.length > 0) {
      new Notification('📚 Homework due tomorrow', { body: `${dueTomorrow.length} assignment${dueTomorrow.length>1?'s':''} due tomorrow` });
    }
  }

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
    showSkeleton();
    setTimeout(() => {
      if (!loadSharedData()) renderAssignments();
      generateSuggestion();
    }, 650);
    setInterval(checkDueReminders, 3600000);
    checkDueReminders();
  }

  init();
})();
