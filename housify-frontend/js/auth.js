

document.addEventListener('DOMContentLoaded', () => {
  
  hideLoader();

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    document.getElementById('toggle-pw')?.addEventListener('click', () => togglePassword('password'));
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);

    document.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedRole = card.getAttribute('data-role');
      });
    });

    const pwInput = document.getElementById('password');
    pwInput.addEventListener('input', (e) => updateStrength(e.target.value));

    const confirmInput = document.getElementById('confirm-password');
    confirmInput.addEventListener('input', () => {
      const match = confirmInput.value === pwInput.value;
      document.getElementById('match-icon').classList.toggle('hidden', !match || !confirmInput.value);
    });
  }
});

let selectedRole = 'buyer';

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errorEl = document.getElementById('auth-error');
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  setLoading(btn, true);
  errorEl.classList.add('hidden');

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    localStorage.setItem('housify_token', data.token);
    localStorage.setItem('housify_user', JSON.stringify(data.user));

    showToast('Login successful!');

    const redirect = getParam('redirect');
    if (redirect) {
      window.location.href = redirect;
    } else {
      window.location.href = data.user.role === 'buyer' ? 'index.html' : 'dashboard.html';
    }

  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
    document.querySelector('.auth-card').classList.add('shake');
    setTimeout(() => document.querySelector('.auth-card').classList.remove('shake'), 400);
  } finally {
    setLoading(btn, false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('register-btn');
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm-password').value;

  if (password !== confirm) {
    showToast('Passwords do not match', 'error');
    return;
  }

  setLoading(btn, true);

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, role: selectedRole })
    });

    localStorage.setItem('housify_token', data.token);
    localStorage.setItem('housify_user', JSON.stringify(data.user));

    showToast('Account created successfully!');
    window.location.href = data.user.role === 'buyer' ? 'index.html' : 'dashboard.html';

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(btn, false);
  }
}

function togglePassword(id) {
  const input = document.getElementById(id);
  const icon = input.nextElementSibling.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

function updateStrength(pw) {
  const fill = document.getElementById('strength-fill');
  const text = document.getElementById('strength-text');
  
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  fill.className = 'fill';
  if (pw.length === 0) {
    text.textContent = 'Too Weak';
  } else if (score <= 1) {
    fill.classList.add('weak');
    text.textContent = 'Weak';
  } else if (score === 2) {
    fill.classList.add('fair');
    text.textContent = 'Fair';
  } else if (score === 3) {
    fill.classList.add('good');
    text.textContent = 'Good';
  } else {
    fill.classList.add('strong');
    text.textContent = 'Strong';
  }
}

function setLoading(btn, isLoading) {
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  
  if (isLoading) {
    btn.disabled = true;
    text.classList.add('hidden');
    spinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    text.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
}
