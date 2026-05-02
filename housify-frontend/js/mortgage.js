

function initEMI(price) {
  const priceInput = document.getElementById('emi-price');
  const downSlider = document.getElementById('emi-down-slider');
  const downVal = document.getElementById('emi-down-val');
  const tenureSlider = document.getElementById('emi-tenure-slider');
  const tenureVal = document.getElementById('emi-tenure-val');
  
  if (!priceInput) return;

  priceInput.value = price;

  const calculate = () => {
    const P_total = parseInt(priceInput.value) || 0;
    const downPercent = parseInt(downSlider.value);
    const years = parseInt(tenureSlider.value);
    const annualRate = 8.5; 
    
    const downAmt = (P_total * downPercent) / 100;
    downVal.textContent = formatPrice(downAmt);
    tenureVal.textContent = `${years} Years`;

    const P = P_total - downAmt; 
    const r = annualRate / 12 / 100; 
    const n = years * 12; 

    let emi = 0;
    if (P > 0) {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;

    document.getElementById('emi-monthly').textContent = formatPrice(Math.round(emi));
    document.getElementById('emi-interest').textContent = formatPrice(Math.round(totalInterest));
    document.getElementById('emi-total').textContent = formatPrice(Math.round(totalPayable + downAmt));

    updateChart(P, totalInterest);
  };

  priceInput.addEventListener('input', calculate);
  downSlider.addEventListener('input', calculate);
  tenureSlider.addEventListener('input', calculate);

  calculate();
}

function updateChart(principal, interest) {
  const canvas = document.getElementById('emi-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const total = principal + interest;
  const pAngle = (principal / total) * 2 * Math.PI;
  
  canvas.width = 150;
  canvas.height = 150;
  ctx.clearRect(0, 0, 150, 150);

  ctx.beginPath();
  ctx.moveTo(75, 75);
  ctx.arc(75, 75, 70, -Math.PI/2, -Math.PI/2 + pAngle);
  ctx.fillStyle = '#1a6b4a';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(75, 75);
  ctx.arc(75, 75, 70, -Math.PI/2 + pAngle, 1.5 * Math.PI);
  ctx.fillStyle = '#f5a623';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(75, 75, 45, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
}
