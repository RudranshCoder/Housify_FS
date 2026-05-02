

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFilters();
  initPriceSlider();
  initViewToggle();

  fetchListings();

  const filterOpenBtn = document.getElementById('mobile-filter-open');
  const sidebar = document.getElementById('sidebar-filters');
  
  filterOpenBtn?.addEventListener('click', () => {
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  document.body.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== filterOpenBtn) {
      sidebar.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.getElementById('apply-filters-btn').addEventListener('click', () => {
    fetchListings();
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('sort-select').addEventListener('change', () => fetchListings());
});

let filterState = {
  page: 1,
  limit: 10,
  purpose: '',
  type: '',
  city: '',
  minPrice: 0,
  maxPrice: 50000000, 
  bhk: [],
  furnished: '',
  amenities: [],
  minArea: '',
  maxArea: '',
  sort: 'newest'
};

function initFilters() {
  
  const urlParams = new URLSearchParams(window.location.search);
  filterState.city = urlParams.get('city') || '';
  filterState.purpose = urlParams.get('purpose') || '';
  filterState.type = urlParams.get('type') || '';
  
  document.getElementById('filter-search').value = filterState.city;

  if (filterState.purpose) {
    document.querySelector(`#filter-purpose .pill[data-value="${filterState.purpose}"]`)?.classList.add('active');
  }
  if (filterState.type) {
    document.querySelectorAll('#filter-type .pill').forEach(p => p.classList.remove('active'));
    document.querySelector(`#filter-type .pill[data-value="${filterState.type}"]`)?.classList.add('active');
  }

  setupPillToggle('filter-purpose', (val) => { filterState.purpose = val; });
  setupPillToggle('filter-type', (val) => { filterState.type = val; });
  setupPillToggle('filter-furnished', (val) => { filterState.furnished = val; });

  document.querySelectorAll('#filter-bhk .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const val = btn.getAttribute('data-value');
      if (btn.classList.contains('active')) {
        filterState.bhk.push(val);
      } else {
        filterState.bhk = filterState.bhk.filter(b => b !== val);
      }
    });
  });

  document.getElementById('filter-search').addEventListener('input', debounce((e) => {
    filterState.city = e.target.value;
    fetchListings();
  }, 400));
}

function setupPillToggle(id, callback) {
  const container = document.getElementById(id);
  container.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      callback(btn.getAttribute('data-value'));
    });
  });
}

function initPriceSlider() {
  const minSlider = document.getElementById('price-min');
  const maxSlider = document.getElementById('price-max');
  const minVal = document.getElementById('price-min-val');
  const maxVal = document.getElementById('price-max-val');
  
  function updateSlider() {
    let min = parseInt(minSlider.value) * 100000; 
    let max = parseInt(maxSlider.value) * 100000;
    
    if (min > max) {
      
      minSlider.value = maxSlider.value;
      min = max;
    }
    
    filterState.minPrice = min;
    filterState.maxPrice = max;
    
    minVal.textContent = formatPrice(min);
    maxVal.textContent = max >= 50000000 ? '₹5 Cr+' : formatPrice(max);
  }

  minSlider.addEventListener('input', updateSlider);
  maxSlider.addEventListener('input', updateSlider);
  updateSlider();
}

function initViewToggle() {
  const gridBtn = document.getElementById('view-grid');
  const listBtn = document.getElementById('view-list');
  const grid = document.getElementById('homes-grid');

  gridBtn.addEventListener('click', () => {
     gridBtn.classList.add('active');
     listBtn.classList.remove('active');
     grid.classList.remove('list-view');
  });

  listBtn.addEventListener('click', () => {
     listBtn.classList.add('active');
     gridBtn.classList.remove('active');
     grid.classList.add('list-view');
  });
}

const DEMO_LISTINGS = [
  { _id: 'd1', title: 'Uber-Luxury Penthouse', city: 'Mumbai', location: 'Lower Parel', price: 125000000, purpose: 'sale', type: 'apartment', bhk: 5, bathrooms: 6, area: 5500, images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80'], amenities: { pool: true, gym: true } },
  { _id: 'd2', title: 'Modern Villa in Whitefield', city: 'Bangalore', location: 'Whitefield', price: 52000000, purpose: 'sale', type: 'villa', bhk: 4, bathrooms: 4, area: 3800, images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'], amenities: { garden: true, gym: true } },
  { _id: 'd3', title: 'Designer 3BHK Koregaon Park', city: 'Pune', location: 'Koregaon Park', price: 32000000, purpose: 'sale', type: 'apartment', bhk: 3, bathrooms: 3, area: 1850, images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'], amenities: { security: true, parking: true } },
  { _id: 'd4', title: 'Luxurious Villa Jubilee Hills', city: 'Hyderabad', location: 'Jubilee Hills', price: 95000000, purpose: 'sale', type: 'villa', bhk: 5, bathrooms: 6, area: 6000, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'], amenities: { pool: true, gym: true } },
  { _id: 'd5', title: 'Charming Studio South Mumbai', city: 'Mumbai', location: 'Colaba', price: 65000, purpose: 'rent', type: 'apartment', bhk: 1, bathrooms: 1, area: 450, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'], amenities: { security: true } },
  { _id: 'd6', title: 'Tech-Savvy 2BHK Smart Home', city: 'Bangalore', location: 'HSR Layout', price: 48000, purpose: 'rent', type: 'apartment', bhk: 2, bathrooms: 2, area: 1150, images: ['https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80'], amenities: { lift: true, security: true } },
  { _id: 'd7', title: 'Quiet Family House — Aundh', city: 'Pune', location: 'Aundh', price: 42000, purpose: 'rent', type: 'house', bhk: 3, bathrooms: 2, area: 2100, images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'], amenities: { garden: true, parking: true } },
  { _id: 'd8', title: 'Office Space in HITEC City', city: 'Hyderabad', location: 'HITEC City', price: 250000, purpose: 'rent', type: 'commercial', bhk: 0, bathrooms: 2, area: 3000, images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'], amenities: { powerBackup: true, parking: true } }
];

async function fetchListings() {
  const grid = document.getElementById('homes-grid');
  const emptyState = document.getElementById('empty-state');
  
  renderSkeletons(grid, 6);
  emptyState.classList.add('hidden');

  filterState.sort = document.getElementById('sort-select').value;
  filterState.minArea = document.getElementById('filter-min-area').value;
  filterState.maxArea = document.getElementById('filter-max-area').value;

  const checkedAmenities = Array.from(document.querySelectorAll('.checkbox-grid input:checked')).map(i => i.value);
  
  let q = `?limit=${filterState.limit}&page=${filterState.page}&sort=${filterState.sort}`;
  if (filterState.city) q += `&city=${filterState.city}`;
  if (filterState.purpose) q += `&purpose=${filterState.purpose}`;
  if (filterState.type) q += `&type=${filterState.type}`;
  if (filterState.furnished) q += `&furnished=${filterState.furnished}`;
  if (filterState.minPrice) q += `&minPrice=${filterState.minPrice}`;
  if (filterState.maxPrice < 50000000) q += `&maxPrice=${filterState.maxPrice}`;
  if (filterState.bhk.length) q += `&bhk=${filterState.bhk.join(',')}`;
  if (filterState.minArea) q += `&minArea=${filterState.minArea}`;
  if (filterState.maxArea) q += `&maxArea=${filterState.maxArea}`;
  if (checkedAmenities.length) q += `&amenities=${checkedAmenities.join(',')}`;

  try {
    const data = await apiFetch('/properties' + q);
    
    document.getElementById('results-count').textContent = `Showing ${data.total} properties`;
    document.getElementById('results-query-desc').textContent = filterState.city ? `Listings in ${filterState.city}` : 'All listings in India';

    if (data.properties && data.properties.length > 0) {
      grid.innerHTML = data.properties.map(p => renderPropertyCard(p)).join('');
      renderPagination(data.pages, data.page);
    } else {
      // Fallback to demo listings if DB is empty
      let filtered = DEMO_LISTINGS;
      if (filterState.city) filtered = filtered.filter(p => p.city.toLowerCase().includes(filterState.city.toLowerCase()));
      if (filterState.purpose) filtered = filtered.filter(p => p.purpose === filterState.purpose);
      if (filterState.type) filtered = filtered.filter(p => p.type === filterState.type);
      if (filterState.bhk.length) filtered = filtered.filter(p => filterState.bhk.includes(String(p.bhk)));

      document.getElementById('results-count').textContent = `Showing ${filtered.length} properties`;
      
      if (filtered.length > 0) {
        grid.innerHTML = filtered.map(p => renderPropertyCard(p)).join('');
      } else {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
      }
      document.getElementById('pagination').innerHTML = '';
    }

    updateFilterBadge();

  } catch (err) {
    let filtered = DEMO_LISTINGS;
    if (filterState.city) filtered = filtered.filter(p => p.city.toLowerCase().includes(filterState.city.toLowerCase()));
    if (filterState.purpose) filtered = filtered.filter(p => p.purpose === filterState.purpose);
    if (filterState.type) filtered = filtered.filter(p => p.type === filterState.type);
    if (filterState.bhk.length) filtered = filtered.filter(p => filterState.bhk.includes(String(p.bhk)));

    document.getElementById('results-count').textContent = `Showing ${filtered.length} properties`;
    document.getElementById('results-query-desc').textContent = filterState.city ? `Listings in ${filterState.city}` : 'All listings in India';

    if (filtered.length > 0) {
      grid.innerHTML = filtered.map(p => renderPropertyCard(p)).join('');
    } else {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
    }
    document.getElementById('pagination').innerHTML = '';
    updateFilterBadge();
  }
}

function updateFilterBadge() {
  let count = 0;
  if (filterState.purpose) count++;
  if (filterState.type) count++;
  if (filterState.minPrice > 0 || filterState.maxPrice < 50000000) count++;
  if (filterState.bhk.length) count++;
  if (filterState.furnished) count++;
  if (filterState.minArea || filterState.maxArea) count++;
  
  const checked = document.querySelectorAll('.checkbox-grid input:checked').length;
  count += checked;

  document.getElementById('active-filter-badge').textContent = count;
  document.getElementById('mobile-filter-badge').textContent = count;
}

function renderPagination(totalPages, currentPage) {
  const container = document.getElementById('pagination');
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  container.innerHTML = html;
}

function goToPage(page) {
  filterState.page = page;
  fetchListings();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFilters() {
  window.location.href = 'listings.html';
}
