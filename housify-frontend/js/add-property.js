
let allFiles = [];
let currentId = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  
  const urlId = getParam('id');
  if (urlId) {
    currentId = urlId;
    document.getElementById('page-title').textContent = 'Edit Your Property';
    document.getElementById('submit-btn').querySelector('.btn-text').textContent = 'Update Listing';
    fetchExistingData(urlId);
  }

  document.querySelectorAll('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-next');
      goToStep(next);
    });
  });

  document.querySelectorAll('.prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const prev = btn.getAttribute('data-prev');
      goToStep(prev);
    });
  });

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  document.getElementById('property-form').addEventListener('submit', handleSubmit);
});

function goToStep(num) {
  document.querySelectorAll('.step-content').forEach(c => c.classList.remove('open'));
  document.getElementById(`step-${num}`).classList.add('open');
  
  document.querySelectorAll('.step').forEach(s => {
    const sNum = s.getAttribute('data-step');
    s.classList.toggle('active', sNum <= num);
  });
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleFiles(files) {
  const previewGrid = document.getElementById('image-preview-grid');
  
  Array.from(files).forEach(file => {
    allFiles.push(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}">
        <button type="button" class="preview-remove"><i class="fas fa-times"></i></button>
      `;
      div.querySelector('.preview-remove').addEventListener('click', () => {
         div.remove();
         allFiles = allFiles.filter(f => f !== file);
      });
      previewGrid.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  setLoading(btn, true);

  try {
    
    const propertyData = {
      title: document.getElementById('prop-title').value,
      purpose: document.getElementById('prop-purpose').value,
      type: document.getElementById('prop-type').value,
      price: document.getElementById('prop-price').value,
      area: document.getElementById('prop-area').value,
      bhk: document.getElementById('prop-bhk').value,
      bathrooms: document.getElementById('prop-bath').value,
      furnished: document.getElementById('prop-furnished').value,
      description: document.getElementById('prop-desc').value,
      city: document.getElementById('prop-city').value,
      location: document.getElementById('prop-location').value,
      amenities: {}
    };

    document.querySelectorAll('input[name="amenities"]').forEach(chk => {
      propertyData.amenities[chk.value] = chk.checked;
    });

    let imageUrls = [];
    if (allFiles.length > 0) {
      const formData = new FormData();
      allFiles.forEach(file => formData.append('images', file));
      
      const uploadRes = await apiFetch('/upload', {
        method: 'POST',
        headers: { 'housify_token': localStorage.getItem('housify_token') }, 
        noContentType: true, 
        body: formData
      });
      imageUrls = uploadRes.urls;
    }

    propertyData.images = imageUrls;

    const method = currentId ? 'PUT' : 'POST';
    const url = currentId ? `/properties/${currentId}` : '/properties';
    
    await apiFetch(url, {
      method,
      body: JSON.stringify(propertyData)
    });

    showToast(currentId ? 'Property updated!' : 'Property published successfully!');
    window.location.href = 'dashboard.html';

  } catch (err) {
    showToast(err.message, 'error');
    setLoading(btn, false);
  }
}

async function fetchExistingData(id) {
  try {
    const data = await apiFetch(`/properties/${id}`);
    const p = data.property;

    document.getElementById('prop-title').value = p.title;
    document.getElementById('prop-purpose').value = p.purpose;
    document.getElementById('prop-type').value = p.type;
    document.getElementById('prop-price').value = p.price;
    document.getElementById('prop-area').value = p.area;
    document.getElementById('prop-bhk').value = p.bhk;
    document.getElementById('prop-bath').value = p.bathrooms;
    document.getElementById('prop-furnished').value = p.furnished;
    document.getElementById('prop-desc').value = p.description;
    document.getElementById('prop-city').value = p.city;
    document.getElementById('prop-location').value = p.location;

    document.querySelectorAll('input[name="amenities"]').forEach(chk => {
      chk.checked = p.amenities[chk.value];
    });

    const previewGrid = document.getElementById('image-preview-grid');
    p.images.forEach(img => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `<img src="http://localhost:5000${img}">`;
      previewGrid.appendChild(div);
    });

  } catch (err) {
    showToast('Failed to load property data', 'error');
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
