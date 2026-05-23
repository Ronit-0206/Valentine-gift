// App State Management
const state = {
  tasks: [],
  people: [],
  filters: {
    status: 'all',     // Sidebar nav tabs: 'all' (Inbox), 'today', 'upcoming', 'completed'
    category: 'all',   // Category filter pills: 'all', 'work', 'personal', 'shopping', 'fitness'
    search: ''         // Header search query
  },
  theme: 'light',
  notifiedTaskIds: new Set(),
  user: {
    isLoggedIn: false,
    isGuest: false,
    id: '',
    name: '',
    email: '',
    avatar: '',
    bio: '',
    clientId: ''
  }
};

const MOCK_PROFILES = [
  { name: 'Marcus Chen', email: 'marcus@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Sarah Connor', email: 'sarah@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'David Kim', email: 'david.kim@gmail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' }
];

// Preset colors for new team members
const ASSIGNEE_COLORS = [
  '#4f46e5', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#14b8a6'  // teal
];

// Helper: Get random color
function getRandomColor() {
  return ASSIGNEE_COLORS[Math.floor(Math.random() * ASSIGNEE_COLORS.length)];
}

// Helper: Get Initials of Name
function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Initial Seed Data
const defaultPeople = [
  { id: 'p1', name: 'Alex Johnson', color: '#4f46e5' },
  { id: 'p2', name: 'Sophia Smith', color: '#10b981' },
  { id: 'p3', name: 'Marcus Chen', color: '#ec4899' }
];

const defaultTasks = [
  {
    id: 't1',
    title: 'Design high-fidelity dashboard layout',
    completed: false,
    assigneeId: 'p1',
    category: 'work',
    startDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString().slice(0, 16), // 1 hour ago
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16), // 2 hours from now
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't2',
    title: 'Implement drag-and-drop task sorting logic',
    completed: false,
    assigneeId: 'p2',
    category: 'work',
    startDate: new Date(Date.now()).toISOString().slice(0, 16), // now
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 24 hours from now
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't3',
    title: 'Test dark mode transition smoothness',
    completed: true,
    assigneeId: 'p3',
    category: 'personal',
    startDate: '',
    dueDate: '',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

// --- Audio Effects System ---
function playReminderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Sound Note 1 (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.45);

    // Sound Note 2 (C#6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1109.73, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.52);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.57);
  } catch (e) {
    console.warn('Web Audio synthesis prevented/unsupported:', e);
  }
}

// --- Notification Toasts ---
function showToast(title, message, type = 'primary') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  switch (type) {
    case 'success':
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
      break;
    case 'warning':
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      break;
    case 'danger':
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
      break;
    default:
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="btn-icon" style="padding: 0; width: 24px; height: 24px;" aria-label="Dismiss toast">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  toast.querySelector('.btn-icon').addEventListener('click', () => {
    dismissToast(toast);
  });

  container.appendChild(toast);

  setTimeout(() => {
    dismissToast(toast);
  }, 5000);
}

function dismissToast(toastElement) {
  if (toastElement.parentNode) {
    toastElement.classList.add('removing');
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.remove();
      }
    }, 300);
  }
}

// Helper: Get local datetime string format YYYY-MM-DDTHH:MM
function getLocalDateTimeString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Date helpers for filters
function isToday(dateString) {
  if (!dateString) return false;
  const d = new Date(dateString);
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

function isUpcoming(dateString) {
  if (!dateString) return false;
  const d = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d > today;
}

// --- Date Formatter ---
function formatTaskPeriod(startDateString, endDateString) {
  if (!startDateString && !endDateString) return null;

  const now = new Date();
  
  const formatSingle = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const timeOptions = { hour: 'numeric', minute: '2-digit' };
    const timeStr = date.toLocaleTimeString([], timeOptions);
    const isTodayVal = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isTodayVal) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    
    const dateOptions = { month: 'short', day: 'numeric' };
    return `${date.toLocaleDateString([], dateOptions)} at ${timeStr}`;
  };

  const startText = formatSingle(startDateString);
  const endText = formatSingle(endDateString);
  
  let isOverdue = false;
  let isUpcomingVal = false;
  
  if (endDateString) {
    const endDate = new Date(endDateString);
    isOverdue = endDate < now;
    isUpcomingVal = !isOverdue && (endDate.getTime() - now.getTime() < 12 * 60 * 60 * 1000);
  }

  let text = '';
  if (startText && endText) {
    text = `${startText} – ${endText}`;
  } else if (startText) {
    text = `Starts: ${startText}`;
  } else if (endText) {
    text = `Ends: ${endText}`;
  }

  return {
    text,
    isOverdue,
    isUpcoming: isUpcomingVal
  };
}

// --- Local Storage Sync ---
function saveToLocalStorage() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(state.tasks));
  localStorage.setItem('taskflow_people', JSON.stringify(state.people));
  localStorage.setItem('taskflow_theme', state.theme);
  localStorage.setItem('taskflow_user', JSON.stringify(state.user));
}

function loadFromLocalStorage() {
  const storedTasks = localStorage.getItem('taskflow_tasks');
  const storedPeople = localStorage.getItem('taskflow_people');
  const storedTheme = localStorage.getItem('taskflow_theme');
  const storedUser = localStorage.getItem('taskflow_user');

  if (storedUser) {
    state.user = JSON.parse(storedUser);
  } else {
    state.user = {
      isLoggedIn: false,
      isGuest: false,
      id: '',
      name: '',
      email: '',
      avatar: '',
      bio: '',
      clientId: ''
    };
  }

  if (storedPeople) {
    state.people = JSON.parse(storedPeople);
  } else {
    state.people = [...defaultPeople];
  }

  if (storedTasks) {
    state.tasks = JSON.parse(storedTasks);
  } else {
    state.tasks = [...defaultTasks];
  }

  if (storedTheme) {
    state.theme = storedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    state.theme = 'dark';
  } else {
    state.theme = 'light';
  }
}

// --- Dynamic Render Operations ---

// Render Team Dropdowns & Filters
function updateTeamDropdowns() {
  const taskAssigneeSelect = document.getElementById('task-assignee');
  const editTaskAssigneeSelect = document.getElementById('edit-task-assignee');
  const filterAssigneeSelect = document.getElementById('filter-assignee');

  if (taskAssigneeSelect) {
    taskAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
  }
  if (editTaskAssigneeSelect) {
    editTaskAssigneeSelect.innerHTML = '<option value="">Unassigned</option>';
  }
  if (filterAssigneeSelect) {
    filterAssigneeSelect.innerHTML = `
      <option value="all">Everyone</option>
      <option value="unassigned">Unassigned Only</option>
    `;
  }

  state.people.forEach(person => {
    const optInput = document.createElement('option');
    optInput.value = person.id;
    optInput.textContent = person.name;
    
    if (taskAssigneeSelect) {
      taskAssigneeSelect.appendChild(optInput.cloneNode(true));
    }
    if (editTaskAssigneeSelect) {
      editTaskAssigneeSelect.appendChild(optInput.cloneNode(true));
    }

    if (filterAssigneeSelect) {
      const optFilter = document.createElement('option');
      optFilter.value = person.id;
      optFilter.textContent = person.name;
      filterAssigneeSelect.appendChild(optFilter);
    }
  });

  if (filterAssigneeSelect) {
    filterAssigneeSelect.value = state.filters.assigneeId || 'all';
  }
}

// Render Team Member List in Dialog Modal
function renderPeopleList() {
  const container = document.getElementById('people-list');
  if (!container) return;
  container.innerHTML = '';

  if (state.people.length === 0) {
    container.innerHTML = '<li class="empty-state" style="padding: 1rem 0;">No team members added yet.</li>';
    return;
  }

  state.people.forEach(person => {
    const li = document.createElement('li');
    li.className = 'person-item';
    
    const initials = getInitials(person.name);
    const avatarHtml = person.avatar 
      ? `<img src="${person.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`
      : `<div class="avatar-circle" style="background: ${person.color};">${initials}</div>`;
    
    li.innerHTML = `
      <div class="person-profile">
        ${avatarHtml}
        <span>${person.name}</span>
      </div>
      <button class="btn-icon delete" aria-label="Remove person ${person.name}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      </button>
    `;

    li.querySelector('.delete').addEventListener('click', () => {
      deletePerson(person.id);
    });

    container.appendChild(li);
  });
}

// Render Tasks List
function renderTasks() {
  const container = document.getElementById('tasks-list');
  const emptyState = document.getElementById('empty-state');
  if (!container) return;
  container.innerHTML = '';

  // Toggle visibility of greeting and insights sections (show only in Inbox/All)
  const greetingSection = document.querySelector('.greeting-section');
  const insightsGrid = document.querySelector('.insights-grid');
  if (greetingSection && insightsGrid) {
    if (state.filters.status === 'all') {
      greetingSection.style.display = 'flex';
      insightsGrid.style.display = 'grid';
    } else {
      greetingSection.style.display = 'none';
      insightsGrid.style.display = 'none';
    }
  }

  // Apply filters
  const filteredTasks = state.tasks.filter(task => {
    // 1. Sidebar Nav tab status filter
    if (state.filters.status === 'completed') {
      if (!task.completed) return false;
    } else {
      if (task.completed) return false;
      if (state.filters.status === 'today') {
        if (!isToday(task.dueDate) && !isToday(task.startDate)) return false;
      } else if (state.filters.status === 'upcoming') {
        if (!isUpcoming(task.dueDate)) return false;
      }
    }

    // 2. Category Pill Filter
    if (state.filters.category !== 'all') {
      if (task.category !== state.filters.category) return false;
    }

    // 3. Search Bar Filter
    if (state.filters.search) {
      const query = state.filters.search.toLowerCase().trim();
      if (query) {
        const titleMatch = task.title.toLowerCase().includes(query);
        const assignee = state.people.find(p => p.id === task.assigneeId);
        const assigneeMatch = assignee && assignee.name.toLowerCase().includes(query);
        if (!titleMatch && !assigneeMatch) return false;
      }
    }

    return true;
  });

  // Toggle empty-state visibility
  if (filteredTasks.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    container.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    container.style.display = 'flex';
  }

  // Build each task item
  filteredTasks.forEach(task => {
    // Resolve neon status class
    const now = new Date();
    let statusClass = 'status-inprogress';
    if (task.completed) {
      statusClass = 'status-completed';
    } else if (task.dueDate && new Date(task.dueDate) < now) {
      statusClass = 'status-overdue';
    } else if (task.dueDate && new Date(task.dueDate) >= now) {
      statusClass = 'status-upcoming';
    } else if (task.startDate && new Date(task.startDate) > now) {
      statusClass = 'status-upcoming';
    }

    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''} ${statusClass}`;
    li.draggable = true;
    li.dataset.id = task.id;

    // Resolve assignee details
    const assignee = state.people.find(p => p.id === task.assigneeId);
    let assigneeBadge = '';
    if (assignee) {
      const avatarHtml = assignee.avatar
        ? `<img src="${assignee.avatar}" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;">`
        : `<div class="avatar-dot" style="background: ${assignee.color}"></div>`;
      assigneeBadge = `
        <div class="avatar-chip" title="Assigned to ${assignee.name}" style="gap: 0.25rem;">
          ${avatarHtml}
          <span>${assignee.name.split(' ')[0]}</span>
        </div>
      `;
    }

    // Resolve due date alerts
    let dateBadge = '';
    const dateDetails = formatTaskPeriod(task.startDate, task.dueDate);
    if (dateDetails) {
      let timeStatusClass = '';
      if (!task.completed) {
        if (dateDetails.isOverdue) timeStatusClass = 'overdue';
        else if (dateDetails.isUpcoming) timeStatusClass = 'upcoming';
      }

      dateBadge = `
        <div class="meta-item due-date ${timeStatusClass}">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${dateDetails.text}</span>
        </div>
      `;
    }

    // Category Badge style
    let categoryBadgeHtml = '';
    if (task.category) {
      categoryBadgeHtml = `<span class="task-category-badge cat-${task.category}">${task.category}</span>`;
    }

    li.innerHTML = `
      <!-- Status Checkbox -->
      <label class="checkbox-container">
        <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-checkbox-input">
        <span class="checkmark"></span>
      </label>

      <!-- Task Details -->
      <div class="task-details">
        <div class="task-title">${escapeHTML(task.title)}</div>
        <div class="task-meta">
          ${assigneeBadge}
          ${dateBadge}
          ${categoryBadgeHtml}
        </div>
      </div>

      <!-- Action Button Panel -->
      <div class="task-actions">
        <button class="btn-icon share-btn" aria-label="Send/Share task" title="Send Task">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </button>
        <button class="btn-icon edit-btn" aria-label="Edit task" title="Edit Task">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon delete delete-btn" aria-label="Delete task" title="Delete Task">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    `;

    li.querySelector('.task-checkbox-input').addEventListener('change', () => {
      toggleTaskComplete(task.id);
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
      deleteTask(task.id);
    });

    li.querySelector('.edit-btn').addEventListener('click', () => {
      openEditModal(task.id);
    });

    li.querySelector('.share-btn').addEventListener('click', () => {
      openShareModal(task.id);
    });

    bindDragEvents(li);

    container.appendChild(li);
  });

  updateStatsBadge();
}

// Stats & Momentum Badge Calculations
function updateStatsBadge() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;

  updateGreeting();

  const circle = document.getElementById('momentum-progress-circle');
  const percentageLabel = document.getElementById('momentum-percentage');
  const efficiencyValue = document.getElementById('efficiency-value');
  const streakValue = document.getElementById('streak-value');
  const momentumDescription = document.getElementById('momentum-description');
  
  if (circle) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (percentageLabel) percentageLabel.textContent = `${percentage}%`;
    if (efficiencyValue) efficiencyValue.textContent = `${percentage}%`;
    
    const circumference = 201.06;
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    
    let streak = localStorage.getItem('taskflow_streak') || 12;
    if (streakValue) streakValue.textContent = streak;
    
    if (momentumDescription) {
      const pendingCount = total - completed;
      if (total === 0) {
        momentumDescription.textContent = "Start by adding a task to build momentum!";
      } else if (pendingCount === 0) {
        momentumDescription.textContent = "All tasks completed! Amazing job today!";
      } else {
        const word = pendingCount === 1 ? 'task' : 'tasks';
        momentumDescription.textContent = `You're doing great! Only ${pendingCount} more ${word} to reach full clarity.`;
      }
    }
  }
}

// Update time-of-day greeting banner
function updateGreeting() {
  const greetingName = document.getElementById('user-greeting-name');
  const greetingCount = document.getElementById('greeting-task-count');
  
  if (!greetingName || !greetingCount) return;
  
  greetingName.textContent = (state.user.isLoggedIn && state.user.name) ? state.user.name.split(' ')[0] : 'Guest';
  
  const hours = new Date().getHours();
  let greetingStr = 'Good Morning';
  if (hours >= 12 && hours < 17) {
    greetingStr = 'Good Afternoon';
  } else if (hours >= 17 || hours < 4) {
    greetingStr = 'Good Evening';
  }
  
  const titleEl = document.querySelector('.greeting-title');
  if (titleEl) {
    titleEl.innerHTML = `${greetingStr}, <span id="user-greeting-name">${escapeHTML(state.user.isLoggedIn && state.user.name ? state.user.name.split(' ')[0] : 'Guest')}</span>.`;
  }
  
  // Calculate pending tasks for today
  const todayTasksCount = state.tasks.filter(task => {
    if (task.completed) return false;
    if (!task.dueDate) return false;
    return isToday(task.dueDate) || isToday(task.startDate);
  }).length;
  
  greetingCount.textContent = `${todayTasksCount} task${todayTasksCount === 1 ? '' : 's'}`;
}

// Utility: HTML Sanitizer
function escapeHTML(str) {
  if (!str) return '';
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

// --- Drag & Drop Event Binder ---
let draggedTaskId = null;

function bindDragEvents(element) {
  element.addEventListener('dragstart', (e) => {
    draggedTaskId = element.dataset.id;
    element.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedTaskId);
  });

  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (element.dataset.id === draggedTaskId) return;
    element.classList.add('drag-over');
  });

  element.addEventListener('dragleave', () => {
    element.classList.remove('drag-over');
  });

  element.addEventListener('dragend', () => {
    element.classList.remove('dragging');
    document.querySelectorAll('.task-item').forEach(el => el.classList.remove('drag-over'));
  });

  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('drag-over');

    const sourceId = e.dataTransfer.getData('text/plain');
    const targetId = element.dataset.id;

    if (sourceId === targetId) return;

    const sourceIndex = state.tasks.findIndex(t => t.id === sourceId);
    const targetIndex = state.tasks.findIndex(t => t.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = state.tasks.splice(sourceIndex, 1);
      state.tasks.splice(targetIndex, 0, draggedItem);
      
      saveToLocalStorage();
      renderTasks();
    }
  });
}

// --- Core Actions & CRUD Mutations ---

// Create Task
function addTask(title, assigneeId, startDate, dueDate, category) {
  if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
    showToast('Invalid Dates', 'Start Time cannot be later than End/Due Time.', 'danger');
    return;
  }

  const newTask = {
    id: 't_' + Date.now(),
    title,
    completed: false,
    assigneeId: assigneeId || '',
    category: category || '',
    startDate: startDate || '',
    dueDate: dueDate || '',
    createdAt: new Date().toISOString()
  };

  state.tasks.unshift(newTask);
  saveToLocalStorage();
  renderTasks();
  showToast('Success', 'Task created successfully', 'success');
}

// Update Task Checkbox State
function toggleTaskComplete(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveToLocalStorage();
    renderTasks();
    
    if (task.completed) {
      showToast('Completed!', `Finished task: "${task.title}"`, 'success');
    }
  }
}

// Delete Task
function deleteTask(id) {
  const taskIndex = state.tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    const taskName = state.tasks[taskIndex].title;
    state.tasks.splice(taskIndex, 1);
    state.notifiedTaskIds.delete(id);
    saveToLocalStorage();
    renderTasks();
    showToast('Deleted', `Removed task: "${taskName}"`, 'danger');
  }
}

// Edit Task Modal Handlers
const editModal = document.getElementById('edit-task-modal');
const editForm = document.getElementById('edit-task-form');

function openEditModal(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task && editModal) {
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-assignee').value = task.assigneeId || '';
    document.getElementById('edit-task-category').value = task.category || '';
    document.getElementById('edit-task-start-date').value = task.startDate || '';
    document.getElementById('edit-task-due-date').value = task.dueDate || '';
    editModal.showModal();
  }
}

if (editForm) {
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value;
    const assigneeId = document.getElementById('edit-task-assignee').value;
    const category = document.getElementById('edit-task-category').value;
    const startDate = document.getElementById('edit-task-start-date').value;
    const dueDate = document.getElementById('edit-task-due-date').value;

    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      showToast('Invalid Dates', 'Start Time cannot be later than End/Due Time.', 'danger');
      return;
    }

    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.title = title;
      task.assigneeId = assigneeId;
      task.category = category;
      task.startDate = startDate;
      task.dueDate = dueDate;
      saveToLocalStorage();
      renderTasks();
      if (editModal) editModal.close();
      showToast('Updated', 'Task changes saved successfully', 'success');
    }
  });
}

const btnCloseEditModal = document.getElementById('btn-close-edit-modal');
if (btnCloseEditModal && editModal) {
  btnCloseEditModal.addEventListener('click', () => {
    editModal.close();
  });
}

// --- Share Task Modal Handlers ---
const shareModal = document.getElementById('share-task-modal');
let currentShareTask = null;

function openShareModal(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task || !shareModal) return;
  
  currentShareTask = task;
  const assigneeName = state.people.find(p => p.id === task.assigneeId)?.name || 'Unassigned';
  
  const periodDetails = formatTaskPeriod(task.startDate, task.dueDate);
  const periodString = periodDetails ? periodDetails.text : 'No time set';
  const statusString = task.completed ? 'Completed ✅' : 'Pending ⏳';
  
  const shareText = `📋 *Task:* ${task.title}\n👤 *Assigned To:* ${assigneeName}\n📅 *Schedule:* ${periodString}\n⚡ *Status:* ${statusString}`;
  
  const previewEl = document.getElementById('share-preview-text');
  if (previewEl) previewEl.textContent = shareText;
  shareModal.showModal();
}

const btnShareCopy = document.getElementById('btn-share-copy');
if (btnShareCopy) {
  btnShareCopy.addEventListener('click', () => {
    if (!currentShareTask) return;
    const previewEl = document.getElementById('share-preview-text');
    const text = previewEl ? previewEl.textContent : '';
    
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied', 'Task details copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Error', 'Failed to copy text', 'danger');
    });
  });
}

const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
if (btnShareWhatsapp) {
  btnShareWhatsapp.addEventListener('click', () => {
    if (!currentShareTask) return;
    const previewEl = document.getElementById('share-preview-text');
    const text = encodeURIComponent(previewEl ? previewEl.textContent : '');
    window.open(`https://wa.me/?text=${text}`, '_blank');
  });
}

const btnShareEmail = document.getElementById('btn-share-email');
if (btnShareEmail) {
  btnShareEmail.addEventListener('click', () => {
    if (!currentShareTask) return;
    const previewEl = document.getElementById('share-preview-text');
    const subject = encodeURIComponent(`Task Assigned: ${currentShareTask.title}`);
    const body = encodeURIComponent(previewEl ? previewEl.textContent : '');
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  });
}

const btnCloseShareModal = document.getElementById('btn-close-share-modal');
if (btnCloseShareModal && shareModal) {
  btnCloseShareModal.addEventListener('click', () => {
    shareModal.close();
  });
}

// Create Person
function addPerson(name) {
  const exists = state.people.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    showToast('Error', `${name} is already in the team`, 'danger');
    return;
  }

  const newPerson = {
    id: 'p_' + Date.now(),
    name,
    color: getRandomColor()
  };

  state.people.push(newPerson);
  saveToLocalStorage();
  updateTeamDropdowns();
  renderPeopleList();
  showToast('Welcome', `Added ${name} to team roster`, 'success');
}

// Delete Person
function deletePerson(id) {
  const person = state.people.find(p => p.id === id);
  if (!person) return;

  state.tasks.forEach(task => {
    if (task.assigneeId === id) {
      task.assigneeId = '';
    }
  });

  state.people = state.people.filter(p => p.id !== id);
  saveToLocalStorage();
  
  updateTeamDropdowns();
  renderPeopleList();
  renderTasks();
  
  showToast('Removed', `Removed ${person.name} from the team`, 'warning');
}

// --- Team Modal Handlers ---
const peopleModal = document.getElementById('people-modal');

const btnManagePeople = document.getElementById('btn-manage-people');
if (btnManagePeople && peopleModal) {
  btnManagePeople.addEventListener('click', () => {
    renderPeopleList();
    peopleModal.showModal();
  });
}

const btnClosePeopleModal = document.getElementById('btn-close-people-modal');
if (btnClosePeopleModal && peopleModal) {
  btnClosePeopleModal.addEventListener('click', () => {
    peopleModal.close();
  });
}

const peopleForm = document.getElementById('people-form');
if (peopleForm) {
  peopleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('person-name');
    const name = nameInput.value.trim();
    if (name) {
      addPerson(name);
      nameInput.value = '';
    }
  });
}

// --- Reminder Engine ---
function checkTaskReminders() {
  const now = new Date().getTime();
  
  state.tasks.forEach(task => {
    if (task.completed || !task.dueDate) return;

    const dueTime = new Date(task.dueDate).getTime();
    
    if (dueTime <= now && !state.notifiedTaskIds.has(task.id)) {
      state.notifiedTaskIds.add(task.id);
      
      const assigneeName = state.people.find(p => p.id === task.assigneeId)?.name || 'unassigned';
      const assigneeString = assigneeName !== 'unassigned' ? `Assigned to: ${assigneeName}` : 'Unassigned';

      playReminderChime();

      showToast(
        '🔔 Task Reminder',
        `"${task.title}" is due now! (${assigneeString})`,
        'warning'
      );

      triggerOSNotification(task.title, assigneeString);
    }
  });
}

function triggerOSNotification(title, bodyText) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification('TaskFlow Alert', {
      body: `"${title}" is due! - ${bodyText}`,
      icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%234f46e5" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    });
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// --- Theme Switcher Logic ---
function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  saveToLocalStorage();
}

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

// --- Event Handlers & Initializers ---

// Submit task creation form
const taskForm = document.getElementById('task-form');
if (taskForm) {
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('task-title');
    const assigneeSelect = document.getElementById('task-assignee');
    const categorySelect = document.getElementById('task-category');
    const startInput = document.getElementById('task-start-date');
    const dateInput = document.getElementById('task-due-date');
    const createModal = document.getElementById('create-task-modal');

    const title = titleInput.value.trim();
    const assigneeId = assigneeSelect.value;
    const category = categorySelect ? categorySelect.value : '';
    const startDate = startInput.value;
    const dueDate = dateInput.value;

    if (title) {
      const originalLength = state.tasks.length;
      addTask(title, assigneeId, startDate, dueDate, category);
      if (state.tasks.length > originalLength) {
        titleInput.value = '';
        assigneeSelect.value = '';
        if (categorySelect) categorySelect.value = '';
        startInput.value = '';
        dateInput.value = '';
        if (createModal) createModal.close();
        requestNotificationPermission();
      }
    }
  });
}

// Bind quick preset buttons for creation form
const btnPresetToday = document.getElementById('btn-preset-today');
if (btnPresetToday) {
  btnPresetToday.addEventListener('click', () => {
    const startInput = document.getElementById('task-start-date');
    const endInput = document.getElementById('task-due-date');
    const now = new Date();
    const later = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2 hours
    if (startInput) startInput.value = getLocalDateTimeString(now);
    if (endInput) endInput.value = getLocalDateTimeString(later);
    showToast('Presets Set', 'Dates configured for Today.', 'info');
  });
}

const btnPresetTomorrow = document.getElementById('btn-preset-tomorrow');
if (btnPresetTomorrow) {
  btnPresetTomorrow.addEventListener('click', () => {
    const startInput = document.getElementById('task-start-date');
    const endInput = document.getElementById('task-due-date');
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(17, 0, 0, 0);
    if (startInput) startInput.value = getLocalDateTimeString(start);
    if (endInput) endInput.value = getLocalDateTimeString(end);
    showToast('Presets Set', 'Dates configured for Tomorrow (9AM - 5PM).', 'info');
  });
}

// Bind quick preset buttons for edit modal form
const btnEditPresetToday = document.getElementById('btn-edit-preset-today');
if (btnEditPresetToday) {
  btnEditPresetToday.addEventListener('click', () => {
    const startInput = document.getElementById('edit-task-start-date');
    const endInput = document.getElementById('edit-task-due-date');
    const now = new Date();
    const later = new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (startInput) startInput.value = getLocalDateTimeString(now);
    if (endInput) endInput.value = getLocalDateTimeString(later);
  });
}

const btnEditPresetTomorrow = document.getElementById('btn-edit-preset-tomorrow');
if (btnEditPresetTomorrow) {
  btnEditPresetTomorrow.addEventListener('click', () => {
    const startInput = document.getElementById('edit-task-start-date');
    const endInput = document.getElementById('edit-task-due-date');
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(17, 0, 0, 0);
    if (startInput) startInput.value = getLocalDateTimeString(start);
    if (endInput) endInput.value = getLocalDateTimeString(end);
  });
}

// Google Authentication & User Profile Management Logic

function initGoogleAuth() {
  const clientId = state.user.clientId || '';
  const container = document.getElementById('google-signin-container');
  if (!container) return;
  if (!clientId) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'flex';
  
  if (window.google && window.google.accounts && window.google.accounts.id) {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-login-btn'),
        { theme: 'outline', size: 'large', width: 340 }
      );
    } catch (e) {
      console.warn('GIS rendering error (possibly origin mismatch):', e);
    }
  }
}

function handleGoogleCredentialResponse(response) {
  try {
    const jwt = response.credential;
    const base64Url = jwt.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    
    loginUser({
      id: 'g_' + payload.sub,
      name: payload.name,
      email: payload.email,
      avatar: payload.picture,
      bio: 'Signed in via Google Authentication.'
    });
  } catch (e) {
    console.error('Error parsing Google ID token:', e);
    showToast('Auth Error', 'Failed to authenticate Google user token', 'danger');
  }
}

function loginUser(userData, isGuest = false) {
  if (isGuest) {
    state.user.isLoggedIn = false;
    state.user.isGuest = true;
    state.user.id = 'guest';
    state.user.name = 'Guest User';
    state.user.email = 'guest@taskflow.local';
    state.user.avatar = '';
    state.user.bio = 'Temporary guest space.';
  } else {
    state.user.isLoggedIn = true;
    state.user.isGuest = false;
    state.user.id = userData.id || 'usr_' + Date.now();
    state.user.name = userData.name || 'TaskFlow User';
    state.user.email = userData.email || '';
    state.user.avatar = userData.avatar || '';
    state.user.bio = userData.bio || '';
    
    syncUserToPeople();
  }
  
  saveToLocalStorage();
  updateUIForAuthState();
  
  showToast(
    'Welcome to TaskFlow',
    isGuest ? 'You are browsing as a guest.' : `Signed in as ${state.user.name}`,
    'success'
  );
}

function syncUserToPeople() {
  if (!state.user.isLoggedIn) return;
  
  let person = state.people.find(p => p.id === state.user.id || p.email === state.user.email);
  if (person) {
    person.id = state.user.id;
    person.name = state.user.name;
    person.avatar = state.user.avatar;
  } else {
    state.people.push({
      id: state.user.id,
      name: state.user.name,
      email: state.user.email,
      avatar: state.user.avatar,
      color: getRandomColor()
    });
  }
  saveToLocalStorage();
  updateTeamDropdowns();
}

// Update the profile trigger card in sidebar footer
function updateSidebarProfile() {
  const avatarImg = document.getElementById('sidebar-avatar-img');
  const avatarPlaceholder = document.getElementById('sidebar-avatar-placeholder');
  const profileName = document.getElementById('sidebar-profile-name');
  const profilePlan = document.getElementById('sidebar-profile-plan');
  
  if (!profileName || !profilePlan) return;
  
  if (state.user.isLoggedIn) {
    profileName.textContent = state.user.name || 'Guest User';
    profilePlan.textContent = state.user.email || 'Free Plan';
    
    if (state.user.avatar) {
      if (avatarImg) {
        avatarImg.src = state.user.avatar;
        avatarImg.style.display = 'block';
      }
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
    } else {
      if (avatarImg) avatarImg.style.display = 'none';
      if (avatarPlaceholder) {
        avatarPlaceholder.textContent = getInitials(state.user.name || 'Guest User');
        avatarPlaceholder.style.display = 'flex';
      }
    }
  } else if (state.user.isGuest) {
    profileName.textContent = 'Guest User';
    profilePlan.textContent = 'Free Account';
    if (avatarImg) avatarImg.style.display = 'none';
    if (avatarPlaceholder) {
      avatarPlaceholder.textContent = 'G';
      avatarPlaceholder.style.display = 'flex';
    }
  }
}

function updateUIForAuthState() {
  const authScreen = document.getElementById('auth-screen');
  const appContainer = document.getElementById('app-container');
  
  if (!authScreen || !appContainer) return;
  
  if (state.user.isLoggedIn || state.user.isGuest) {
    authScreen.style.display = 'none';
    appContainer.style.display = 'flex';
    updateSidebarProfile();
    updateGreeting();
  } else {
    authScreen.style.display = 'flex';
    appContainer.style.display = 'none';
  }
}

function signOutUser() {
  const previousName = state.user.name;
  state.user.isLoggedIn = false;
  state.user.isGuest = false;
  state.user.id = '';
  state.user.name = '';
  state.user.email = '';
  state.user.avatar = '';
  state.user.bio = '';
  
  saveToLocalStorage();
  updateUIForAuthState();
  
  showToast('Signed Out', `Goodbye, ${previousName || 'User'}!`, 'warning');
}

// Dev Configurations Triggers
const btnDevToggle = document.getElementById('btn-dev-toggle');
if (btnDevToggle) {
  btnDevToggle.addEventListener('click', () => {
    const devConfig = document.getElementById('dev-config');
    if (devConfig) {
      devConfig.style.display = devConfig.style.display === 'none' ? 'flex' : 'none';
    }
  });
}

const btnSaveClientId = document.getElementById('btn-save-client-id');
if (btnSaveClientId) {
  btnSaveClientId.addEventListener('click', () => {
    const idValue = document.getElementById('google-client-id').value.trim();
    state.user.clientId = idValue;
    saveToLocalStorage();
    
    if (idValue) {
      showToast('Developer Config', 'OAuth Client ID saved. Preparing real Google Sign-In...', 'success');
      initGoogleAuth();
    } else {
      showToast('Developer Config', 'OAuth Client ID cleared.', 'danger');
      const gContainer = document.getElementById('google-signin-container');
      if (gContainer) gContainer.style.display = 'none';
    }
  });
}

// Top Bar Settings Button
const btnGlobeSettings = document.getElementById('btn-globe-settings');
if (btnGlobeSettings) {
  btnGlobeSettings.addEventListener('click', () => {
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    if (authScreen && appContainer) {
      authScreen.style.display = 'flex';
      appContainer.style.display = 'none';
      const devConfig = document.getElementById('dev-config');
      if (devConfig) devConfig.style.display = 'flex';
      showToast('Dev Settings', 'Opened Authentication config screen', 'info');
    }
  });
}

// Guest Flow button
const btnGuestLogin = document.getElementById('btn-guest-login');
if (btnGuestLogin) {
  btnGuestLogin.addEventListener('click', () => {
    loginUser({}, true);
  });
}

// Google Mock Selector Dialog
const mockGoogleModal = document.getElementById('mock-google-modal');
const btnGoogleDemo = document.getElementById('btn-google-demo');
if (btnGoogleDemo && mockGoogleModal) {
  btnGoogleDemo.addEventListener('click', () => {
    renderMockAccounts();
    mockGoogleModal.showModal();
  });
}

const btnCloseMockGoogleModal = document.getElementById('btn-close-mock-google-modal');
if (btnCloseMockGoogleModal && mockGoogleModal) {
  btnCloseMockGoogleModal.addEventListener('click', () => {
    mockGoogleModal.close();
  });
}

function renderMockAccounts() {
  const container = document.getElementById('mock-accounts-list');
  if (!container) return;
  container.innerHTML = '';
  
  MOCK_PROFILES.forEach(profile => {
    const item = document.createElement('div');
    item.className = 'mock-account-item';
    
    const initials = getInitials(profile.name);
    const avatarHtml = profile.avatar
      ? `<img src="${profile.avatar}" alt="${profile.name}" style="width: 100%; height: 100%; object-fit: cover;">`
      : initials;
      
    item.innerHTML = `
      <div class="mock-account-profile">
        <div class="mock-avatar">${avatarHtml}</div>
        <div class="mock-info">
          <div class="mock-name">${profile.name}</div>
          <div class="mock-email">${profile.email}</div>
        </div>
      </div>
      <span class="mock-badge">Demo</span>
    `;
    
    item.addEventListener('click', () => {
      loginUser({
        id: 'm_' + profile.name.toLowerCase().replace(/\s+/g, '_'),
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        bio: 'Simulated Google user account.'
      });
      if (mockGoogleModal) mockGoogleModal.close();
    });
    
    container.appendChild(item);
  });
}

const mockCustomAccountForm = document.getElementById('mock-custom-account-form');
if (mockCustomAccountForm) {
  mockCustomAccountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('mock-custom-name').value.trim();
    const email = document.getElementById('mock-custom-email').value.trim();
    
    if (name && email) {
      loginUser({
        id: 'm_' + name.toLowerCase().replace(/\s+/g, '_'),
        name: name,
        email: email,
        avatar: '',
        bio: 'Custom simulated account.'
      });
      if (mockGoogleModal) mockGoogleModal.close();
      
      document.getElementById('mock-custom-name').value = '';
      document.getElementById('mock-custom-email').value = '';
    }
  });
}

// Profile Editing Modal
const profileModal = document.getElementById('profile-modal');
const profileForm = document.getElementById('profile-form');
const sidebarProfileTrigger = document.getElementById('sidebar-profile-trigger');

if (sidebarProfileTrigger && profileModal) {
  sidebarProfileTrigger.addEventListener('click', () => {
    document.getElementById('profile-name').value = state.user.name || 'Guest User';
    document.getElementById('profile-email').value = state.user.email || '';
    document.getElementById('profile-bio').value = state.user.bio || '';
    updateProfileAvatarPreview();
    profileModal.showModal();
  });
}

const btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
if (btnCloseProfileModal && profileModal) {
  btnCloseProfileModal.addEventListener('click', () => {
    profileModal.close();
  });
}

function updateProfileAvatarPreview() {
  const previewImg = document.getElementById('profile-avatar-preview');
  const placeholder = document.getElementById('profile-avatar-placeholder');
  
  if (state.user.avatar) {
    if (previewImg) {
      previewImg.src = state.user.avatar;
      previewImg.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
  } else {
    if (previewImg) previewImg.style.display = 'none';
    if (placeholder) {
      placeholder.textContent = getInitials(state.user.name || 'Guest User');
      placeholder.style.display = 'flex';
    }
  }
}

const profileAvatarUpload = document.getElementById('profile-avatar-upload');
if (profileAvatarUpload) {
  profileAvatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToast('Image Too Large', 'Please upload a file smaller than 1MB.', 'warning');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        state.user.avatar = event.target.result;
        updateProfileAvatarPreview();
      };
      reader.readAsDataURL(file);
    }
  });
}

if (profileForm) {
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('profile-name').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    
    if (name) {
      state.user.name = name;
      state.user.bio = bio;
      
      saveToLocalStorage();
      syncUserToPeople();
      updateSidebarProfile();
      updateGreeting();
      
      if (profileModal) profileModal.close();
      showToast('Profile Saved', 'Successfully updated your user profile details.', 'success');
    }
  });
}

const btnProfileSignout = document.getElementById('btn-profile-signout');
if (btnProfileSignout) {
  btnProfileSignout.addEventListener('click', () => {
    if (profileModal) profileModal.close();
    signOutUser();
  });
}

// Notifications Bell mock interaction
const btnNotificationsMock = document.getElementById('btn-notifications-mock');
if (btnNotificationsMock) {
  btnNotificationsMock.addEventListener('click', () => {
    showToast('Reminders Status', 'Reminders check is running in background (every 10s). Alarm audio and OS notifications are active.', 'success');
  });
}

// Close dialogs when clicking on backdrops
window.addEventListener('click', (e) => {
  if (e.target === peopleModal) peopleModal.close();
  if (e.target === editModal) editModal.close();
  if (e.target === shareModal) shareModal.close();
  const createModal = document.getElementById('create-task-modal');
  if (e.target === createModal) createModal.close();
  if (e.target === profileModal) profileModal.close();
  if (e.target === mockGoogleModal) mockGoogleModal.close();
});

// Setup sidebar modal creation bindings
const btnFabAddTask = document.getElementById('btn-fab-add-task');
const btnSidebarAddTask = document.getElementById('btn-sidebar-add-task');
const btnCloseCreateModal = document.getElementById('btn-close-create-modal');
const createModal = document.getElementById('create-task-modal');

if (btnFabAddTask && createModal) {
  btnFabAddTask.addEventListener('click', () => {
    createModal.showModal();
  });
}
if (btnSidebarAddTask && createModal) {
  btnSidebarAddTask.addEventListener('click', () => {
    createModal.showModal();
  });
}
if (btnCloseCreateModal && createModal) {
  btnCloseCreateModal.addEventListener('click', () => {
    createModal.close();
  });
}

// Setup search bar listener
const taskSearchInput = document.getElementById('task-search-input');
if (taskSearchInput) {
  taskSearchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    renderTasks();
  });
}

// Setup category filter pills click events
const categoryPillList = document.querySelectorAll('.category-pill');
categoryPillList.forEach(pill => {
  pill.addEventListener('click', () => {
    categoryPillList.forEach(el => el.classList.remove('active'));
    pill.classList.add('active');
    state.filters.category = pill.dataset.category;
    renderTasks();
  });
});

// Setup sidebar navigation tab click events
const navItemList = document.querySelectorAll('.nav-item');
navItemList.forEach(item => {
  item.addEventListener('click', () => {
    navItemList.forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    state.filters.status = item.dataset.nav;
    
    // Update top bar breadcrumb title
    const breadcrumb = document.getElementById('breadcrumb-title');
    if (breadcrumb) {
      if (state.filters.status === 'all') breadcrumb.textContent = 'Inbox';
      else if (state.filters.status === 'today') breadcrumb.textContent = "Today's Focus";
      else if (state.filters.status === 'upcoming') breadcrumb.textContent = 'Upcoming Schedule';
      else if (state.filters.status === 'completed') breadcrumb.textContent = 'Completed Tasks';
    }
    
    renderTasks();
  });
});

// Settings & Help buttons footer notifications/dialog triggers
const btnSidebarSettings = document.getElementById('btn-sidebar-settings');
if (btnSidebarSettings && profileModal) {
  btnSidebarSettings.addEventListener('click', () => {
    document.getElementById('profile-name').value = state.user.name || 'Guest User';
    document.getElementById('profile-email').value = state.user.email || '';
    document.getElementById('profile-bio').value = state.user.bio || '';
    updateProfileAvatarPreview();
    profileModal.showModal();
  });
}

const btnSidebarHelp = document.getElementById('btn-sidebar-help');
if (btnSidebarHelp) {
  btnSidebarHelp.addEventListener('click', () => {
    showToast('Help Guide', 'Use the Sidebar to filter tasks, Category pills to drill down, or add tasks with the bottom-right FAB.', 'info');
  });
}

// Peak Focus Time Banner VIEW INSIGHTS button
const btnFocusInsights = document.getElementById('btn-focus-insights');
if (btnFocusInsights) {
  btnFocusInsights.addEventListener('click', () => {
    showToast('Focus Insights', 'You typically complete tasks faster on Tuesday and Thursday mornings. Plan your deep focus work accordingly!', 'success');
  });
}

// Page Initialization
window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  setTheme(state.theme);
  
  if (state.user.clientId) {
    const clientInput = document.getElementById('google-client-id');
    if (clientInput) clientInput.value = state.user.clientId;
  }
  
  updateUIForAuthState();
  initGoogleAuth();
  updateTeamDropdowns();
  renderTasks();

  setInterval(checkTaskReminders, 10000);
});
