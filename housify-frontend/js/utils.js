

function formatPrice(num) {
  if (!num) return '₹0';
  if (num >= 10000000) {
    return '₹' + (num / 10000000).toFixed(1).replace(/\.0$/, '') + ' Cr';
  }
  if (num >= 100000) {
    return '₹' + (num / 100000).toFixed(1).replace(/\.0$/, '') + ' Lakh';
  }
  return '₹' + num.toLocaleString('en-IN');
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  return "just now";
}

function getInitials(name) {
  if (!name) return 'H';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function setParam(key, value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.pushState({}, '', url);
}

function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'exclamation-circle' : 'info-circle');
  
  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function showLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) loader.classList.remove('hidden');
}

function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) loader.classList.add('hidden');
}

function renderPropertyCard(prop) {
  const isFavourite = false; 
  const statusClass = prop.status === 'available' ? 'success' : (prop.status === 'sold' ? 'danger' : 'accent');
  
  const image = (prop.images && prop.images.length > 0 && prop.images[0]) 
    ? (prop.images[0].startsWith('http') ? prop.images[0] : 'http://127.0.0.1:5000' + prop.images[0])
    : (typeof PLACEHOLDER_IMG !== 'undefined' ? PLACEHOLDER_IMG : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80');

  return `
    <div class="card property-card" data-id="${prop._id}">
      <div class="card-img-area" style="height: 200px; position: relative; overflow: hidden;">
        <img src="${image}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;">
        <div class="price-badge" style="position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.6); color: white; padding: 4px 12px; border-radius: 50px; font-weight: 700; font-size: 14px;">
          ${formatPrice(prop.price)}
        </div>
        <button class="fav-btn ${isFavourite ? 'active' : ''}" style="position: absolute; top: 15px; right: 15px; background: white; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${isFavourite ? 'var(--danger)' : '#ccc'};">
          <i class="${isFavourite ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <div class="purpose-badge" style="position: absolute; bottom: 15px; left: 15px; background: ${prop.purpose === 'sale' ? 'var(--success)' : '#3182ce'}; color: white; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
          For ${prop.purpose === 'sale' ? 'Sale' : 'Rent'}
        </div>
      </div>
      <div class="card-body" style="padding: 20px;">
        <h3 style="font-size: 16px; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prop.title}</h3>
        <div class="prop-tags" style="display: flex; gap: 8px; margin-bottom: 15px;">
           <span class="tag"><i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i> ${prop.city}</span>
           <span class="tag">${prop.type}</span>
        </div>
        <div class="prop-stats" style="display: flex; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 15px; color: var(--text-secondary); font-size: 13px;">
          <span><i class="fas fa-bed"></i> ${prop.bhk || 0} BHK</span>
          <span><i class="fas fa-bath"></i> ${prop.bathrooms || 0} Bath</span>
          <span><i class="fas fa-vector-square"></i> ${prop.area} sqft</span>
        </div>
        <a href="property.html?id=${prop._id}" class="view-link" style="display: block; text-align: center; margin-top: 15px; text-decoration: none; color: var(--primary); font-weight: 600; font-size: 14px;">View Details →</a>
      </div>
    </div>
  `;
}

function renderSkeletons(container, count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="card skeleton-card">
        <div class="skeleton" style="height: 200px; border-radius: 0;"></div>
        <div style="padding: 20px;">
          <div class="skeleton" style="height: 20px; width: 80%; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 14px; width: 40%; margin-bottom: 20px;"></div>
          <div style="display: flex; justify-content: space-between;">
            <div class="skeleton" style="height: 15px; width: 25%;"></div>
            <div class="skeleton" style="height: 15px; width: 25%;"></div>
            <div class="skeleton" style="height: 15px; width: 25%;"></div>
          </div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function initNavbar() {
  const authContainer = document.querySelector('.nav-auth');
  if (!authContainer) return;

  const user = JSON.parse(localStorage.getItem('housify_user'));
  const token = localStorage.getItem('housify_token');

  if (token && user) {
    const initials = getInitials(user.name);
    authContainer.innerHTML = `
      <div class="user-menu">
        <div class="user-avatar">${initials}</div>
        <div class="user-dropdown">
          <a href="profile.html">My Profile</a>
          ${(user.role === 'seller' || user.role === 'agent') ? '<a href="dashboard.html">Dashboard</a>' : ''}
          <a href="dashboard.html">Saved Properties</a>
          <a href="#" id="logout-btn" class="logout-btn">Logout</a>
        </div>
      </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('housify_token');
      localStorage.removeItem('housify_user');
      showToast('Logged out successfully');
      setTimeout(() => window.location.href = 'index.html', 1000);
    });
  } else {
    authContainer.innerHTML = `
      <a href="login.html" class="btn btn-outline">Login</a>
      <a href="register.html" class="btn btn-accent">Register</a>
    `;
  }

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentPurpose = getParam('purpose');

  document.querySelectorAll('.nav-menu a').forEach(link => {
    const linkPath = link.getAttribute('href').split('?')[0];
    const linkPurpose = new URLSearchParams(link.getAttribute('href').split('?')[1] || '').get('purpose');

    link.classList.remove('active');

    if (linkPath === currentPath) {
      if (linkPath === 'listings.html') {
        
        if (linkPurpose === currentPurpose) {
          link.classList.add('active');
        }
      } else {
        link.classList.add('active');
      }
    }
  });

  const toggle = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');

  if (toggle && drawer && overlay) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      drawer.classList.toggle('open');
      overlay.classList.toggle('visible');
    });

    overlay.addEventListener('click', () => {
      toggle.classList.remove('active');
      drawer.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }
}

window.addEventListener('scroll', () => {
  const btn = document.getElementById('scroll-top');
  const nav = document.querySelector('.navbar');
  
  if (window.scrollY > 300) {
    btn?.classList.add('visible');
  } else {
    btn?.classList.remove('visible');
  }

  if (window.scrollY > 60) {
    nav?.classList.add('scrolled');
  } else {
    nav?.classList.remove('scrolled');
  }
});

document.getElementById('scroll-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
