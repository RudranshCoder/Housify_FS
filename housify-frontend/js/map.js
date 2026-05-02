

function initMap(city, address) {
  const mapDiv = document.getElementById('property-map');
  if (!mapDiv) return;

  const TOKEN = 'pk.eyJ1IjoiY29kZXJ1ZHJhIiwiYSI6ImNscXZreTJxMzBkejUycXFyaWh1Nmt3aGgifQ.placeholder'; 
  mapboxgl.accessToken = TOKEN;

  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address || city)}.json?access_token=${TOKEN}`)
    .then(res => res.json())
    .then(data => {
      if (!data.features || data.features.length === 0) throw new Error('Location not found');
      
      const coords = data.features[0].center; 
      
      const map = new mapboxgl.Map({
        container: 'property-map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coords,
        zoom: 13
      });

      new mapboxgl.Marker({ color: '#1a6b4a' })
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup().setHTML(`<h4>Property Location</h4><p>${address || city}</p>`))
        .addTo(map);

      addPOIs(map, coords);

      document.getElementById('google-maps-link').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || city)}`;
    })
    .catch(err => {
      console.error('Map Load Error:', err.message);
      mapDiv.innerHTML = `
        <div class="flex-center" style="height:100%; background:#f1f3f5; flex-direction:column; color:var(--text-muted); text-align:center; padding:20px;">
          <i class="fas fa-map-marked-alt" style="font-size:40px; margin-bottom:15px;"></i>
          <p>Map unavailable. Please check your internet connection or Mapbox token.</p>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || city)}" target="_blank" style="margin-top:10px; color:var(--primary); font-weight:600;">View on Google Maps →</a>
        </div>
      `;
    });
}

function addPOIs(map, center) {
  const pois = [
    { name: 'City Hospital', color: '#e53e3e', offset: [0.008, 0.005] },
    { name: 'St. Xavier School', color: '#3182ce', offset: [-0.005, -0.008] },
    { name: 'Metro Station', color: '#f5a623', offset: [0.002, 0.012] }
  ];

  pois.forEach(poi => {
    new mapboxgl.Marker({ color: poi.color, scale: 0.8 })
      .setLngLat([center[0] + poi.offset[0], center[1] + poi.offset[1]])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${poi.name}</strong>`))
      .addTo(map);
  });
}
