let currentDate = new Date();
let selectedYear = currentDate.getFullYear();
let selectedMonth = currentDate.getMonth();

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function updateHomeStats() {
  const greetingElement = document.getElementById('greeting');
  if (greetingElement) {
    greetingElement.textContent = getGreeting();
  }

  const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
  const markedDates = JSON.parse(localStorage.getItem('markedDates') || '[]');

  const totalWorkoutsElement = document.getElementById('totalWorkouts');
  if (totalWorkoutsElement) {
    totalWorkoutsElement.textContent = workouts.length;
  }

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const weekWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= startOfWeek;
  });

  const weekWorkoutsElement = document.getElementById('weekWorkouts');
  if (weekWorkoutsElement) {
    weekWorkoutsElement.textContent = weekWorkouts.length;
  }

  const streakDaysElement = document.getElementById('streakDays');
  if (streakDaysElement) {
    const streak = calculateStreak(markedDates);
    streakDaysElement.textContent = streak;

    const progressCircle = document.getElementById('progressCircle');
    if (progressCircle) {
      const circumference = 326.73;
      const progress = Math.min(streak / 30, 1);
      const offset = circumference * (1 - progress);
      progressCircle.style.strokeDashoffset = offset;
    }
  }
}

function calculateStreak(markedDates) {
  if (markedDates.length === 0) return 0;

  const sortedDates = markedDates
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecent = new Date(sortedDates[0]);
  mostRecent.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const previous = new Date(sortedDates[i - 1]);
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const diff = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function initCalendar() {
  renderCalendar();
}

function renderCalendar() {
  const calendar = document.getElementById('calendar');
  const currentMonthElement = document.getElementById('currentMonth');

  if (!calendar || !currentMonthElement) return;

  currentMonthElement.textContent = `${monthNames[selectedMonth]} ${selectedYear}`;

  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const markedDates = JSON.parse(localStorage.getItem('markedDates') || '[]');

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;
  const todayDate = today.getDate();

  let html = '';

  dayNames.forEach(day => {
    html += `<div class="calendar-day header">${day}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-day"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isMarked = markedDates.includes(dateStr);
    const isToday = isCurrentMonth && day === todayDate;

    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (isMarked) classes += ' marked';

    html += `<div class="${classes}">${day}</div>`;
  }

  calendar.innerHTML = html;
}

function previousMonth() {
  selectedMonth--;
  if (selectedMonth < 0) {
    selectedMonth = 11;
    selectedYear--;
  }
  renderCalendar();
}

function nextMonth() {
  selectedMonth++;
  if (selectedMonth > 11) {
    selectedMonth = 0;
    selectedYear++;
  }
  renderCalendar();
}

function markTodayAsCompleted() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const markedDates = JSON.parse(localStorage.getItem('markedDates') || '[]');

  if (markedDates.includes(dateStr)) {
    alert('Hari ini sudah ditandai sebagai hari latihan!');
    return;
  }

  markedDates.push(dateStr);
  localStorage.setItem('markedDates', JSON.stringify(markedDates));

  const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
  workouts.push({
    date: new Date().toISOString(),
    sessions: 1
  });
  localStorage.setItem('workouts', JSON.stringify(workouts));

  renderCalendar();

  alert('Hari ini berhasil ditandai sebagai hari latihan!');
}

if (typeof window !== 'undefined') {
  window.previousMonth = previousMonth;
  window.nextMonth = nextMonth;
  window.markTodayAsCompleted = markTodayAsCompleted;
  window.updateHomeStats = updateHomeStats;
  window.initCalendar = initCalendar;
}
