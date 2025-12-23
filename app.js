document.addEventListener('DOMContentLoaded', () => {

  /* ========= ЭКРАНЫ ========= */
  const earnScreen = document.getElementById('earnScreen');
  const timerScreen = document.getElementById('timerScreen');

  /* ========= НАВИГАЦИЯ ========= */
  const earnBtn = document.getElementById('earnBtn');
  const timerBtn = document.getElementById('timerBtn');

  const navIndicator = document.querySelector('.nav-indicator');

  /* ========= КНОПКИ ========= */
  const resetBtn = document.querySelector('.reset');
  const addBtn = document.getElementById('addBtn');
  const addBtnWrapper = document.querySelector('.bottom-actions');


  /* ========= МОДАЛКИ ========= */
  const modal = document.getElementById('modal');
  const typeModal = document.getElementById('typeModal');

  const modalTitle = document.querySelector('.modal-title');
  const amountInput = document.getElementById('amountInput');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  const chooseIncome = document.getElementById('chooseIncome');
  const chooseExpense = document.getElementById('chooseExpense');

  moveIndicator(0);
  
  /* ===== HOVER FEEDBACK FOR TYPE MODAL ===== */
chooseIncome.addEventListener('mouseenter', () => {
  setTypeHighlight('income');
});

chooseIncome.addEventListener('mouseleave', () => {
  typeModal.classList.remove('income-active');
});

chooseExpense.addEventListener('mouseenter', () => {
  setTypeHighlight('expense');
});

chooseExpense.addEventListener('mouseleave', () => {
  typeModal.classList.remove('expense-active');
});

  function setTypeHighlight(type) {
  typeModal.classList.remove('income-active', 'expense-active');
  if (type === 'income') {
    typeModal.classList.add('income-active');
  }
  if (type === 'expense') {
    typeModal.classList.add('expense-active');
  }
}

  /* ========= СПИСОК И ИТОГИ ========= */
  const list = document.getElementById('list');
  const grossEl = document.querySelector('.gross');
  const netEl = document.querySelector('.net');

  /* ========= ТАЙМЕР ========= */
  const timerTimeEl = document.getElementById('timerTime');
  const startTimerBtn = document.getElementById('startTimerBtn');
  const stopTimerBtn = document.getElementById('stopTimerBtn');

  let incomes = [];
  let expenses = [];
  let currentMode = 'income';

  /* ========= LOCAL STORAGE ========= */
  const STORAGE_KEY = 'n3_helper_data';

  function saveData() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ incomes, expenses })
    );
  }

  function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);
    incomes = data.incomes || [];
    expenses = data.expenses || [];

    list.innerHTML = '';
    incomes.forEach(i => addRow(i.date, i.time, i.amount, 'income'));
    expenses.forEach(e => addRow(e.date, e.time, e.amount, 'expense'));

    updateTotals();
  }

  /* ========= ЭКРАНЫ ========= */
function showEarnScreen() {
  earnScreen.classList.remove('hidden');
  timerScreen.classList.add('hidden');
  earnBtn.classList.add('active');
  timerBtn.classList.remove('active');

  addBtnWrapper.classList.remove('hidden'); // ПОКАЗАТЬ кнопку
}

function showTimerScreen() {
  earnScreen.classList.add('hidden');
  timerScreen.classList.remove('hidden');
  timerBtn.classList.add('active');
  earnBtn.classList.remove('active');

  addBtnWrapper.classList.add('hidden'); // СКРЫТЬ кнопку
}

earnBtn.addEventListener('click', () => {
  showEarnScreen();
  moveIndicator(0);
});

timerBtn.addEventListener('click', () => {
  showTimerScreen();
  moveIndicator(1);
});

function moveIndicator(index) {
  navIndicator.style.transform =
    `translateX(${index * 100}%)`;

  earnBtn.classList.toggle('active', index === 0);
  timerBtn.classList.toggle('active', index === 1);
}

  /* ========= МОДАЛКИ ========= */
  function openModal() {
    modal.classList.remove('hidden');
    amountInput.value = '';
    amountInput.focus();
  }

  addBtn.addEventListener('click', () => {
    typeModal.classList.remove('hidden');
  });

function vibrate(ms = 15) {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

chooseIncome.addEventListener('click', () => {
  vibrate(15);
  setTypeHighlight('income');
  currentMode = 'income';
  modalTitle.textContent = 'Введите сумму дохода';
  typeModal.classList.add('hidden');
  openModal();
});

chooseExpense.addEventListener('click', () => {
  vibrate(15);
  setTypeHighlight('expense');
  currentMode = 'expense';
  modalTitle.textContent = 'Введите сумму расхода';
  typeModal.classList.add('hidden');
  openModal();
});

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // ===== ЗАКРЫТИЕ МОДАЛОК ПО КЛИКУ ВНЕ ОКНА =====
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

typeModal.addEventListener('click', (e) => {
  if (e.target === typeModal) {
    typeModal.classList.add('hidden');
  }
});


  confirmBtn.addEventListener('click', () => {
    const value = Number(amountInput.value);
    if (!value || value <= 0) return;

    const now = new Date();
    const date = now.toLocaleDateString('ru-RU');
    const time = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (currentMode === 'income') {
      incomes.push({ date, time, amount: value });
      addRow(date, time, value, 'income');
      netEl.classList.remove('glow-red');
      netEl.classList.add('glow-green');
    } else {
      expenses.push({ date, time, amount: value });
      addRow(date, time, value, 'expense');
      netEl.classList.remove('glow-green');
      netEl.classList.add('glow-red');
    }

    updateTotals();
    saveData();
    modal.classList.add('hidden');
  });

  /* ========= ОБНУЛЕНИЕ ========= */
  resetBtn.addEventListener('click', () => {
    if (!confirm('Обнулить всю текущую сессию?')) return;

    incomes = [];
    expenses = [];
    list.innerHTML = '';
    grossEl.textContent = '0 $';
    netEl.textContent = '0 $';
    localStorage.removeItem(STORAGE_KEY);
  });

  /* ========= ТАЙМЕР ========= */
  let timerInterval = null;
  const TIMER_DURATION = 600; // для теста можешь поставить 60
  let remainingTime = TIMER_DURATION;

  
  const circle = document.querySelector('.progress-ring__progress');
  const timerCircle = document.querySelector('.timer-circle');
const CIRCUMFERENCE = 440;

circle.style.strokeDasharray = CIRCUMFERENCE;
circle.style.strokeDashoffset = 0;

function renderTimer() {
  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;

  timerTimeEl.textContent =
    `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  // ===== ПРОГРЕСС КРУГА =====
  const progress = remainingTime / TIMER_DURATION;
  circle.style.strokeDashoffset =
    CIRCUMFERENCE * (1 - progress);

  // ===== ПУЛЬСАЦИЯ ПОСЛЕДНИХ 10 СЕК =====
  if (remainingTime <= 10 && remainingTime > 0) {
    timerCircle.classList.add('pulse');
  } else {
    timerCircle.classList.remove('pulse');
  }
}

  function startCourierTimer() {
  if (timerInterval) return;

  startTimerBtn.classList.add('hidden');
  stopTimerBtn.classList.remove('hidden');

  timerInterval = setInterval(() => {

    if (remainingTime <= 0) {
      remainingTime = 0;
      renderTimer();
      finishCourierTimer(true);
      return;
    }

    remainingTime--;
    renderTimer();

  }, 1000);
}

  function finishCourierTimer(done) {
    timerCircle.classList.remove('pulse');
    clearInterval(timerInterval);
    timerInterval = null;

    startTimerBtn.classList.remove('hidden');
    stopTimerBtn.classList.add('hidden');

    remainingTime = TIMER_DURATION;
    renderTimer();

    if (!done) return;

    const now = new Date();
    const date = now.toLocaleDateString('ru-RU');
    const time = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const row = document.createElement('div');
    row.className = 'row timer';
    row.textContent = `${date}  ${time}  Курьер  10 мин`;
    list.prepend(row);
  }

  startTimerBtn.addEventListener('click', startCourierTimer);
  stopTimerBtn.addEventListener('click', () => finishCourierTimer(false));
  renderTimer();

  /* ========= ВСПОМОГАТЕЛЬНЫЕ ========= */
  function addRow(date, time, amount, type) {
    const row = document.createElement('div');
    row.className = `row ${type}`;
    const sign = type === 'income' ? '+' : '−';
    row.textContent = `${date}  ${time}  ${sign}${format(amount)} $`;
    list.prepend(row);
  }

function updateTotals() {
  const gross = incomes.reduce((s, i) => s + i.amount, 0);
  const expense = expenses.reduce((s, e) => s + e.amount, 0);
  const net = gross - expense;

  grossEl.textContent = `${format(gross)} $`;
  netEl.textContent = `${format(net)} $`;

  // ===== GLOW ПО ДЕЙСТВИЮ =====
  netEl.classList.remove('glow-green', 'glow-red', 'glow-fade');

  // reflow для перезапуска анимации
  void netEl.offsetWidth;

  // ВАЖНО: выбираем цвет по действию
  const glowClass =
    currentMode === 'income' ? 'glow-green' : 'glow-red';

  // ЗАЖИГАЕМ glow
  netEl.classList.add(glowClass);

const card = netEl.closest('.total-block');
card.classList.remove('card-glow-green', 'card-glow-red');

const cardGlowClass =
  currentMode === 'income'
    ? 'card-glow-green'
    : 'card-glow-red';

card.classList.add(cardGlowClass);


  // запускаем плавное затухание
  setTimeout(() => {
    netEl.classList.add('glow-fade');
  }, 800);

  // убираем классы ПОСЛЕ полного fade
  setTimeout(() => {
  netEl.classList.remove('glow-green', 'glow-red', 'glow-fade');
  card.classList.remove('card-glow-green', 'card-glow-red');
}, 2200);
}


  function format(num) {
    return num.toLocaleString('ru-RU');
  }

  /* ========= ЗАГРУЗКА ========= */
  loadData();

});
