const ADMIN_EMAIL = 'admin@salbeauty.com';
const ADMIN_PASSWORD = 'admin123';

const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');

togglePasswordBtn?.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePasswordBtn.innerHTML = isPassword ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
});

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem('salbeauty_admin_auth', '1');
    window.location.href = 'dashboard.html';
    return;
  }
  alert('Email atau password salah. Gunakan admin@salbeauty.com / admin123');
});
