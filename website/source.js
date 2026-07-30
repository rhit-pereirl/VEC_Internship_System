(function () {
  const root = document.documentElement;

  function getBody() {
    return document.body;
  }

  function applyTheme(isDark) {
    const body = getBody();
    root.classList.toggle('dark-theme', isDark);
    if (body) {
      body.classList.toggle('dark-theme', isDark);
    }
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  function updateToggleButton(button, isDark) {
    if (!button) return;
    button.innerHTML = isDark ? '☀️' : '🌙';
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-pressed', String(isDark));
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    applyTheme(isDark);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        const nextIsDark = !root.classList.contains('dark-theme');
        applyTheme(nextIsDark);
        updateToggleButton(button, nextIsDark);
      });
      updateToggleButton(button, root.classList.contains('dark-theme'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
