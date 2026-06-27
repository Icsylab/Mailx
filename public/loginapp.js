//login page controls
  const html = document.documentElement;
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');

  const saved = localStorage.getItem('mailx-theme');
  if (saved) { html.setAttribute('data-theme', saved); updateToggle(saved); }

  function toggleTheme() {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('mailx-theme', next);
    updateToggle(next);
  }

  function updateToggle(theme) {
    icon.textContent = theme === 'dark' ? '●' : '○';
    label.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }