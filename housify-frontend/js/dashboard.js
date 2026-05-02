

let currentUser = null;
let currentTab = 'active';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  
  currentUser = JSON.parse(localStorage.getItem('housify_user'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  renderUserInfo();
  fetchDashboardData();

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      fetchDashboardData();
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('delete-modal').classList.remove('open');
    });
  });
});

function renderUserInfo() {
  document.getElementById('user-name-display').textContent = currentUser.name;
  document.getElementById('user-role-display').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  document.getElementById('profile-name').textContent = currentUser.name;
  document.getElementById('profile-email').textContent = currentUser.email;
  document.getElementById('user-avatar-initials').textContent = getInitials(currentUser.name);

  if (currentUser.role === 'buyer') {
    document.getElementById('main-section-title').textContent = 'My Favourites';
    document.getElementById('add-prop-btn-nav').classList.add('hidden');
    document.getElementById('dashboard-tabs').classList.add('hidden');
    document.getElementById('enquiries-section').classList.add('hidden');
  }
}

async function fetchDashboardData() {
  const isBuyer = currentUser.role === 'buyer';
  const listEl = document.getElementById('db-listings-list');
  const statsEl = document.getElementById('stats-container');

  try {
    if (isBuyer) {
      
      const data = await apiFetch('/favourites');
      renderSellerStats(data.properties.length, 0); 
      renderListings(data.properties.map(f => f.property), true);
    } else {
      
      const data = await apiFetch(`/properties/my?status=${currentTab}`);
      const statsData = await apiFetch('/properties/my/stats');
      
      renderSellerStats(statsData.totalListings, statsData.totalViews);
      renderListings(data.properties, false);
      renderEnquiries();
    }
  } catch (err) {
    listEl.innerHTML = `<p class="error text-center" style="padding:40px">${err.message}</p>`;
  }
}

function renderSellerStats(count, views) {
  const container = document.getElementById('stats-container');
  const isBuyer = currentUser.role === 'buyer';

  const stats = isBuyer ? [
    { label: 'Total Saved', val: count, icon: 'fa-heart', color: 'blue' },
    { label: 'Recent Views', val: 12, icon: 'fa-eye', color: 'green' },
    { label: 'Alerts Active', val: 2, icon: 'fa-bell', color: 'orange' },
    { label: 'Contacted', val: 0, icon: 'fa-comment', color: 'purple' }
  ] : [
    { label: 'Active Listings', val: count, icon: 'fa-home', color: 'blue' },
    { label: 'Total Views', val: views, icon: 'fa-eye', color: 'green' },
    { label: 'Enquiries', val: 5, icon: 'fa-envelope', color: 'orange' },
    { label: 'Sold/Rented', val: 2, icon: 'fa-check-circle', color: 'purple' }
  ];

  container.innerHTML = stats.map(s => `
    <div class="db-stat-card ${s.color}">
      <div class="icon"><i class="fas ${s.icon}"></i></div>
      <div>
        <h3>${s.val}</h3>
        <p>${s.label}</p>
      </div>
    </div>
  `).join('');

  document.getElementById('stat-props-count').textContent = count;
  document.getElementById('stat-views-count').textContent = views;
}

function renderListings(items, isBuyer) {
  const listEl = document.getElementById('db-listings-list');
  
  if (!items.length) {
    listEl.innerHTML = `
      <div class="text-center" style="padding: 60px;">
        <i class="fas ${isBuyer ? 'fa-heart' : 'fa-home'}" style="font-size: 48px; color: var(--border); margin-bottom: 20px;"></i>
        <p class="text-muted">No ${isBuyer ? 'saved properties' : 'listings'} found.</p>
        <a href="listings.html" class="btn btn-outline btn-sm margin-top-20">Browse Properties</a>
      </div>
    `;
    return;
  }

  listEl.innerHTML = items.map(p => `
    <div class="db-list-item" id="item-${p._id}">
      <img src="${p.images[0] ? 'http://localhost:5000'+p.images[0] : 'assets/placeholder.jpg'}" class="db-item-img">
      <div class="db-item-info">
        <h4>${p.title}</h4>
        <p><i class="fas fa-map-marker-alt"></i> ${p.city}</p>
        <p class="margin-top-5"><strong>${formatPrice(p.price)}</strong> • ${p.bhk} BHK • ${p.purpose}</p>
      </div>
      <div class="db-actions">
        <a href="property.html?id=${p._id}" class="btn btn-outline btn-sm" title="View"><i class="fas fa-eye"></i></a>
        ${!isBuyer ? `
          <a href="edit-property.html?id=${p._id}" class="btn btn-outline btn-sm" title="Edit"><i class="fas fa-edit"></i></a>
          <button class="btn btn-outline btn-sm btn-danger" onclick="confirmDelete('${p._id}')" title="Delete"><i class="fas fa-trash"></i></button>
        ` : `
          <button class="btn btn-outline btn-sm btn-danger" onclick="removeFav('${p._id}')" title="Remove"><i class="fas fa-heart"></i></button>
        `}
      </div>
    </div>
  `).join('');
}

function renderEnquiries() {
  const listEl = document.getElementById('enquiries-list');
  
  const enquiries = [
    { name: 'Suresh Kumar', msg: 'Is the price negotiable?', date: '2 hours ago' },
    { name: 'Meera Jain', msg: 'Interested in a site visit.', date: '1 day ago' }
  ];

  listEl.innerHTML = enquiries.map(e => `
    <div class="enquiry-item">
      <h5>${e.name}</h5>
      <p>"${e.msg}"</p>
      <small class="text-muted">${e.date}</small>
    </div>
  `).join('');
}

let deleteId = null;
function confirmDelete(id) {
  deleteId = id;
  document.getElementById('delete-modal').classList.add('open');
}

document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
  if (!deleteId) return;
  try {
    await apiFetch(`/properties/${deleteId}`, { method: 'DELETE' });
    showToast('Property deleted');
    document.getElementById(`item-${deleteId}`).remove();
    document.getElementById('delete-modal').classList.remove('open');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

async function removeFav(propId) {
  try {
    
    await apiFetch(`/favourites/${propId}`, { method: 'DELETE' });
    showToast('Removed from favourites');
    document.getElementById(`item-${propId}`).remove();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
