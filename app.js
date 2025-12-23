document.addEventListener('DOMContentLoaded', () => {

  /* ========= ЭКРАНЫ ========= */
  const earnScreen = document.getElementById('earnScreen');
  const timerScreen = document.getElementById('timerScreen');

  /* ========= НАВИГАЦИЯ ========= */
  const earnBtn = document.getElementById('earnBtn');
  const timerBtn = document.getElementById('timerBtn');

  /* ========= КНОПКИ ========= */
  const incomeBtn = document.getElementById('incomeBtn');
  const expenseBtn = document.getElementById('expenseBtn');
  const resetBtn = document.querySelector('.reset');

  /* ========= МОДАЛКА ========= */
  const modal = document.getElementById('modal');
  const modalTitle = document.querySelector('.modal-title');
  const amountInput = document.getElementById('amountInput');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');

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
  }

  function showTimerScreen() {
    earnScreen.classList.add('hidden');
    timerScreen.classList.remove('hidden');
    timerBtn.classList.add('active');
    earnBtn.classList.remove('active');
  }

  earnBtn.addEventListener('click', showEarnScreen);
  timerBtn.addEventListener('click', showTimerScreen);

  /* ========= ДОХОД / РАСХОД ========= */
  incomeBtn.addEventListener('click', () => {
    currentMode = 'income';
    modalTitle.textContent = 'Введите сумму дохода';
    openModal();
  });

  expenseBtn.addEventListener('click', () => {
    currentMode = 'expense';
    modalTitle.textContent = 'Введите сумму расхода';
    openModal();
  });

  function openModal() {
    modal.classList.remove('hidden');
    amountInput.value = '';
    amountInput.focus();
  }

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
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
    } else {
      expenses.push({ date, time, amount: value });
      addRow(date, time, value, 'expense');
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
  let remainingTime = 600;

  function renderTimer() {
    const m = Math.floor(remainingTime / 60);
    const s = remainingTime % 60;
    timerTimeEl.textContent =
      `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startCourierTimer() {
    if (timerInterval) return;

    startTimerBtn.classList.add('hidden');
    stopTimerBtn.classList.remove('hidden');

    timerInterval = setInterval(() => {
      remainingTime--;
      renderTimer();

      if (remainingTime <= 0) {
        finishCourierTimer(true);
      }
    }, 1000);
  }

  function finishCourierTimer(done) {
    clearInterval(timerInterval);
    timerInterval = null;

    startTimerBtn.classList.remove('hidden');
    stopTimerBtn.classList.add('hidden');

    remainingTime = 600;
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
    grossEl.textContent = `${format(gross)} $`;
    netEl.textContent = `${format(gross - expense)} $`;
  }

  function format(num) {
    return num.toLocaleString('ru-RU');
  }

  /* ========= ЗАГРУЗКА ========= */
  loadData();

});
