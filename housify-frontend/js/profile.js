

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  
  const user = JSON.parse(localStorage.getItem('housify_user'));
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('prof-name').value = user.name;
  document.getElementById('prof-email').value = user.email;
  document.getElementById('prof-phone').value = user.phone || '';
  document.getElementById('profile-avatar').textContent = getInitials(user.name);

  document.getElementById('profile-form').addEventListener('submit', handleUpdate);
});

async function handleUpdate(e) {
  e.preventDefault();
  const btn = document.getElementById('save-profile-btn');
  
  const name = document.getElementById('prof-name').value;
  const phone = document.getElementById('prof-phone').value;
  const newPassword = document.getElementById('prof-new-password').value;
  const confirm = document.getElementById('prof-confirm-password').value;

  if (newPassword && newPassword !== confirm) {
    showToast('Passwords do not match', 'error');
    return;
  }

  setLoading(btn, true);

  try {
    const body = { name, phone };
    if (newPassword) body.password = newPassword;

    const data = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body)
    });

    localStorage.setItem('housify_user', JSON.stringify(data.user));
    showToast('Profile updated successfully!');
    
    document.getElementById('prof-new-password').value = '';
    document.getElementById('prof-confirm-password').value = '';

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(btn, false);
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
