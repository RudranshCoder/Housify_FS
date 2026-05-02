

let currentProperty = null;
let currentPhotos = [];
let photoIdx = 0;

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  
  const propId = getParam('id');
  if (!propId) {
    window.location.href = 'listings.html';
    return;
  }

  fetchPropertyDetails(propId);
});

async function fetchPropertyDetails(id) {
  try {
    const data = await apiFetch(`/properties/${id}`);
    
    currentProperty = data.property;
    currentPhotos = currentProperty.images || [];
    
    renderPropertyUI(currentProperty);
    initEMI(currentProperty.price);
    initMap(currentProperty.city, currentProperty.location);
    fetchSimilarProperties(currentProperty.city, currentProperty._id);
    
    document.getElementById('property-loader').classList.add('hidden');
    document.getElementById('property-content').classList.remove('hidden');

  } catch (err) {
    console.error(err);
    showToast('Failed to load property details', 'error');
  }
}

function renderPropertyUI(prop) {
  document.title = `${prop.title} | Housify`;

  const mainImg = document.getElementById('main-gallery-img');
  const thumbRow = document.getElementById('thumbnail-row');
  
  const firstImage = getImageUrl(prop.images[0]);
  mainImg.innerHTML = `<img src="${firstImage}" id="active-image">`;
  mainImg.addEventListener('click', () => openLightbox(0));

  if (prop.images.length > 1) {
    thumbRow.innerHTML = prop.images.map((img, i) => `
      <div class="thumbnail ${i === 0 ? 'active' : ''}" onclick="swapImage('${getImageUrl(img)}', ${i})">
        <img src="${getImageUrl(img)}">
      </div>
    `).join('');
  } else {
    thumbRow.classList.add('hidden');
  }

  document.getElementById('prop-title').textContent = prop.title;
  document.getElementById('prop-address').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${prop.location || prop.city}`;
  document.getElementById('prop-status').textContent = prop.status;
  document.getElementById('prop-status').className = `badge ${prop.status}`;
  document.getElementById('prop-purpose').textContent = `For ${prop.purpose === 'sale' ? 'Sale' : 'Rent'}`;

  document.getElementById('stat-bhk').textContent = prop.bhk || 'N/A';
  document.getElementById('stat-bath').textContent = prop.bathrooms || 'N/A';
  document.getElementById('stat-area').textContent = prop.area;
  document.getElementById('stat-furnished').textContent = prop.furnished;
  document.getElementById('stat-type').textContent = prop.type;

  const descText = document.getElementById('desc-text');
  descText.textContent = prop.description;
  if (prop.description.length > 250) {
    document.getElementById('prop-description').classList.add('truncated');
    const rb = document.getElementById('read-more-btn');
    rb.classList.remove('hidden');
    rb.addEventListener('click', () => {
      const isTrunc = document.getElementById('prop-description').classList.toggle('truncated');
      rb.textContent = isTrunc ? 'Read More' : 'Read Less';
    });
  }

  const amGrid = document.getElementById('amenities-grid');
  const amLabels = {
    pool: 'Swimming Pool',
    parking: 'Dedicated Parking',
    lift: 'Elevator/Lift',
    garden: 'Private Garden',
    powerBackup: 'Power Backup',
    petFriendly: 'Pet Friendly',
    security: '24/7 Security',
    gym: 'Fitness Center'
  };

  amGrid.innerHTML = Object.keys(amLabels).map(key => `
    <div class="amenity-item">
      <i class="fas ${prop.amenities[key] ? 'fa-check-circle' : 'fa-times'}"></i>
      <span>${amLabels[key]}</span>
    </div>
  `).join('');

  document.getElementById('owner-name').textContent = prop.owner.name;
  document.getElementById('owner-initials').textContent = getInitials(prop.owner.name);
  document.getElementById('owner-role').textContent = prop.owner.role === 'owner' ? 'Property Owner' : 'Verified Agent';
  document.getElementById('owner-phone').textContent = prop.owner.phone || 'Not provided';
  document.getElementById('owner-email').textContent = prop.owner.email;

  const revealBtn = document.getElementById('reveal-contact-btn');
  revealBtn.addEventListener('click', () => {
    if (!localStorage.getItem('housify_token')) {
      showToast('Please login to view contact details', 'info');
      
      setTimeout(() => window.location.href = `login.html?redirect=${window.location.href}`, 1500);
      return;
    }
    document.getElementById('contact-masked').classList.add('hidden');
    document.getElementById('contact-real').classList.remove('hidden');
  });

  const enquiryBtn = document.getElementById('send-enquiry-btn');
  enquiryBtn.addEventListener('click', () => {
    if (!localStorage.getItem('housify_token')) {
       showToast('Please login to send an enquiry', 'info');
       return;
    }
    const modal = document.getElementById('enquiry-modal');
    document.getElementById('enquiry-msg').value = `I'm interested in "${prop.title}". Please contact me with more details.`;
    modal.classList.add('open');
  });

  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || el.classList.contains('modal-close')) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
      }
    });
  });

  document.getElementById('enquiry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Enquiry sent successfully! The owner will contact you.');
    document.getElementById('enquiry-modal').classList.remove('open');
  });
}

function getImageUrl(img) {
  if (!img) return 'assets/placeholder.jpg';
  if (img.startsWith('http')) return img;
  return 'http://localhost:5000' + img;
}

function swapImage(url, idx) {
  document.getElementById('active-image').src = url;
  document.querySelectorAll('.thumbnail').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
  });
  photoIdx = idx;
}

function openLightbox(idx) {
  photoIdx = idx;
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  lbImg.src = getImageUrl(currentPhotos[photoIdx]);
  lb.classList.add('open');
  updateLightboxCounter();
}

document.querySelector('.close-lightbox').addEventListener('click', () => {
  document.getElementById('lightbox').classList.remove('open');
});

document.querySelector('.lightbox-next').addEventListener('click', () => {
  photoIdx = (photoIdx + 1) % currentPhotos.length;
  document.getElementById('lightbox-img').src = getImageUrl(currentPhotos[photoIdx]);
  updateLightboxCounter();
});

document.querySelector('.lightbox-prev').addEventListener('click', () => {
  photoIdx = (photoIdx - 1 + currentPhotos.length) % currentPhotos.length;
  document.getElementById('lightbox-img').src = getImageUrl(currentPhotos[photoIdx]);
  updateLightboxCounter();
});

function updateLightboxCounter() {
  document.querySelector('.lightbox-counter').textContent = `${photoIdx + 1} / ${currentPhotos.length}`;
}

async function fetchSimilarProperties(city, currentId) {
  const grid = document.getElementById('similar-grid');
  document.getElementById('city-name-similar').textContent = city;

  try {
    const data = await apiFetch(`/properties?city=${city}&exclude=${currentId}&limit=4`);
    if (data.properties && data.properties.length > 0) {
      grid.innerHTML = data.properties.map(p => `
        <div style="min-width: 280px;">${renderPropertyCard(p)}</div>
      `).join('');
    } else {
      grid.innerHTML = '<p class="text-muted">No other properties found in this city.</p>';
    }
  } catch (err) {
    grid.innerHTML = '';
  }
}
