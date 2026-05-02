

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  hideLoader();

  initStatsObserver();

  fetchFeaturedProperties();

  initTestimonials();

  const searchForm = document.getElementById('hero-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const city = document.getElementById('search-location').value;
      const purpose = document.getElementById('search-purpose').value;
      const type = document.getElementById('search-type').value;
      
      window.location.href = `listings.html?city=${encodeURIComponent(city)}&purpose=${purpose}${type ? '&type='+type : ''}`;
    });
  }

  document.querySelectorAll('.city-card').forEach(card => {
    card.addEventListener('click', () => {
      const city = card.getAttribute('data-city');
      window.location.href = `listings.html?city=${encodeURIComponent(city)}`;
    });
  });

  document.getElementById('alert-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast("You're subscribed! We'll alert you for new properties.");
    e.target.reset();
  });
});

async function fetchFeaturedProperties() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  renderSkeletons(grid, 6);

  const DEMO_PROPERTIES = [
    { _id: 'd1', title: 'Uber-Luxury Penthouse', city: 'Mumbai', location: 'Lower Parel', price: 125000000, purpose: 'sale', type: 'apartment', bhk: 5, area: 5500, images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80'], amenities: { pool: true, gym: true } },
    { _id: 'd2', title: 'Modern Villa in Whitefield', city: 'Bangalore', location: 'Whitefield', price: 52000000, purpose: 'sale', type: 'villa', bhk: 4, area: 3800, images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'], amenities: { garden: true, gym: true } },
    { _id: 'd3', title: 'Designer 3BHK Koregaon Park', city: 'Pune', location: 'Koregaon Park', price: 32000000, purpose: 'sale', type: 'apartment', bhk: 3, area: 1850, images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'], amenities: { security: true, parking: true } },
    { _id: 'd4', title: 'Luxurious Villa Jubilee Hills', city: 'Hyderabad', location: 'Jubilee Hills', price: 95000000, purpose: 'sale', type: 'villa', bhk: 5, area: 6000, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'], amenities: { pool: true, gym: true } },
    { _id: 'd5', title: 'Charming Studio South Mumbai', city: 'Mumbai', location: 'Colaba', price: 65000, purpose: 'rent', type: 'apartment', bhk: 1, area: 450, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'], amenities: { security: true } },
    { _id: 'd6', title: 'Tech-Savvy 2BHK Smart Home', city: 'Bangalore', location: 'HSR Layout', price: 48000, purpose: 'rent', type: 'apartment', bhk: 2, area: 1150, images: ['https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80'], amenities: { lift: true, security: true } }
  ];

  try {
    const data = await apiFetch('/properties?limit=6');
    if (data.properties && data.properties.length > 0) {
      grid.innerHTML = data.properties.map(p => renderPropertyCard(p)).join('');
    } else {
      grid.innerHTML = DEMO_PROPERTIES.map(p => renderPropertyCard(p)).join('');
    }
  } catch (err) {
    grid.innerHTML = DEMO_PROPERTIES.map(p => renderPropertyCard(p)).join('');
  }
}

function initStatsObserver() {
  const stats = document.querySelectorAll('.stat-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const countTo = parseInt(target.getAttribute('data-target'));
        if (countTo) animateValue(target, 0, countTo, 2000);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => observer.observe(s));
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    obj.innerHTML = value.toLocaleString() + '+';
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

const testimonials = [
  { id: 1, name: 'Siddharth Roy', role: 'Homebuyer', company: 'Bangalore', content: 'Housify made finding my dream villa in Whitefield effortless. The high-res images and verified details gave me complete confidence before visiting.', rating: 5, avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&q=80' },
  { id: 2, name: 'Priya Mehta', role: 'Property Seller', company: 'Mumbai', content: 'I listed my South Mumbai apartment and had three verified buyers visiting within a week. The sleek UI really highlights premium properties well.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { id: 3, name: 'Amit Desai', role: 'Investor', company: 'Pune', content: 'As someone who invests in luxury real estate, the insights and filtering features on Housify are unmatched. It is my go-to platform.', rating: 4, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { id: 4, name: 'Neha Sharma', role: 'Tenant', company: 'Hyderabad', content: 'Found a perfectly automated smart home in HITEC City. The platform is transparent, no hidden brokerage fees to worry about.', rating: 5, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' },
  { id: 5, name: 'Rohan Kapoor', role: 'Architect', company: 'Delhi', content: 'The visual presentation of properties here is a cut above the rest. It truly respects the architectural beauty of the homes listed.', rating: 5, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' }
];

let currentTestimonial = 0;

function initTestimonials() {
  const cardsContainer = document.getElementById('testimonial-cards');
  const dotsContainer = document.getElementById('testimonial-dots');
  if (!cardsContainer || !dotsContainer) return;

  function render() {
    cardsContainer.innerHTML = testimonials.map((t, index) => `
      <div class="testimonial-card ${index === currentTestimonial ? 'active' : ''}">
        <div class="testimonial-card-stars">
          ${'<i class="fas fa-star"></i>'.repeat(t.rating)}
        </div>
        <div class="testimonial-card-quote">
          <i class="fas fa-quote-left"></i>
          <p>"${t.content}"</p>
        </div>
        <div class="testimonial-divider"></div>
        <div class="testimonial-author-flex">
          <img src="${t.avatar}" class="testimonial-avatar" alt="${t.name}" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=80'">
          <div class="testimonial-author-info">
            <h3>${t.name}</h3>
            <p>${t.role}, ${t.company}</p>
          </div>
        </div>
      </div>
    `).join('');

    dotsContainer.innerHTML = testimonials.map((_, index) => `
      <button class="testimonial-dot ${index === currentTestimonial ? 'active' : ''}" data-index="${index}"></button>
    `).join('');

    dotsContainer.querySelectorAll('.testimonial-dot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentTestimonial = parseInt(e.target.getAttribute('data-index'));
        render();
      });
    });
  }

  render();

  let interval = setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    render();
  }, 3000);

  const layout = document.querySelector('.testimonial-layout');
  if (layout) {
    layout.addEventListener('mouseenter', () => clearInterval(interval));
    layout.addEventListener('mouseleave', () => {
      interval = setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        render();
      }, 3000);
    });
  }
}
