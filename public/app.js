let checkInterval = null;
let hasDevice = false;
let isRunning = false;

const statusEl = document.getElementById('status');
const deviceInfoEl = document.getElementById('deviceInfo');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');

function updateStatus(message, className) {
  statusEl.textContent = message;
  statusEl.className = `status ${className}`;
}

function showNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Scrcpy Mirror', {
      body: message,
      icon: '/icon.png'
    });
  }
}

async function checkDevice() {
  try {
    const response = await fetch('/api/check');
    const data = await response.json();
    
    if (data.success) {
      hasDevice = data.hasDevice;
      isRunning = data.isRunning;
      
      if (isRunning) {
        updateStatus('✅ Mirroring AKTIF - Layar HP ditampilkan', 'connected');
        btnStart.style.display = 'none';
        btnStop.style.display = 'block';
        deviceInfoEl.style.display = 'block';
        deviceInfoEl.className = 'device-info active';
        deviceInfoEl.innerHTML = `
          <div class="device-id">🟢 Status: Mirroring Aktif</div>
          <div class="device-status">Layar HP sedang ditampilkan di laptop</div>
        `;
      } else if (hasDevice) {
        updateStatus('📱 HP Terdeteksi! Siap untuk mirroring', 'ready');
        btnStart.disabled = false;
        btnStart.style.display = 'block';
        btnStop.style.display = 'none';
        deviceInfoEl.style.display = 'block';
        deviceInfoEl.className = 'device-info active';
        deviceInfoEl.innerHTML = `
          <div class="device-id">Device: ${data.devices[0].id}</div>
          <div class="device-status">Status: Connected via USB</div>
        `;
      } else {
        updateStatus('⚠️ Tidak ada HP terdeteksi. Colok USB & aktifkan USB Debugging', 'idle');
        btnStart.disabled = true;
        btnStart.style.display = 'block';
        btnStop.style.display = 'none';
        deviceInfoEl.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Check error:', error);
  }
}

btnStart.addEventListener('click', async () => {
  updateStatus('🔄 Memulai mirroring...', 'checking');
  btnStart.disabled = true;
  btnStart.innerHTML = '<span class="loading"></span>Starting...';
  
  try {
    const response = await fetch('/api/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      updateStatus('✅ Mirroring AKTIF! Layar HP ditampilkan di laptop', 'connected');
      showNotification('Mirroring dimulai! Layar HP sekarang ditampilkan di laptop');
      btnStart.style.display = 'none';
      btnStop.style.display = 'block';
      isRunning = true;
    } else {
      updateStatus('❌ Error: ' + data.error, 'error');
      btnStart.disabled = false;
      btnStart.innerHTML = '🚀 Start Mirroring';
    }
  } catch (error) {
    updateStatus('❌ Error: ' + error.message, 'error');
    btnStart.disabled = false;
    btnStart.innerHTML = '🚀 Start Mirroring';
  }
});

btnStop.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      updateStatus('⏹️ Mirroring dihentikan', 'idle');
      showNotification('Mirroring dihentikan');
      btnStop.style.display = 'none';
      btnStart.style.display = 'block';
      btnStart.innerHTML = '🚀 Start Mirroring';
      isRunning = false;
      checkDevice();
    }
  } catch (error) {
    updateStatus('❌ Error: ' + error.message, 'error');
  }
});

if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

checkDevice();
checkInterval = setInterval(checkDevice, 2000);
