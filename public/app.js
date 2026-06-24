let devices = [];
let serverURL = localStorage.getItem('serverURL') || 'http://localhost:8080';

const statusEl = document.getElementById('status');
const devicesEl = document.getElementById('devices');
const serverURLInput = document.getElementById('serverURL');
const btnScan = document.getElementById('btnScan');
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');

serverURLInput.value = serverURL;

function updateStatus(message, className) {
  statusEl.textContent = message;
  statusEl.className = `status ${className}`;
}

function displayDevices() {
  if (devices.length === 0) {
    devicesEl.innerHTML = '<div class="no-devices">Tidak ada perangkat terdeteksi</div>';
    return;
  }
  
  devicesEl.innerHTML = devices.map(device => `
    <div class="device-item found">
      <div class="device-id">📱 ${device.id}</div>
      <div class="device-status">Status: Ready</div>
    </div>
  `).join('');
}

serverURLInput.addEventListener('change', () => {
  serverURL = serverURLInput.value.trim();
  localStorage.setItem('serverURL', serverURL);
});

btnScan.addEventListener('click', async () => {
  updateStatus('🔍 Scanning perangkat...', 'scanning');
  btnScan.innerHTML = '<span class="loading"></span>Scanning...';
  btnScan.disabled = true;
  
  try {
    const response = await fetch(`${serverURL}/api/check`);
    const data = await response.json();
    
    if (data.success && data.hasDevice) {
      devices = data.devices;
      displayDevices();
      updateStatus(`✅ Ditemukan ${devices.length} perangkat!`, 'ready');
      btnConnect.disabled = false;
    } else {
      devicesEl.innerHTML = '<div class="no-devices">❌ Tidak ada HP terdeteksi. Cek USB Debugging!</div>';
      updateStatus('⚠️ Tidak ada perangkat. Pastikan USB Debugging aktif', 'error');
      btnConnect.disabled = true;
    }
  } catch (error) {
    updateStatus('❌ Error: Tidak bisa terhubung ke server lokal!', 'error');
    devicesEl.innerHTML = '<div class="no-devices">⚠️ Server lokal tidak berjalan. Jalankan "npm start" di laptop!</div>';
  }
  
  btnScan.innerHTML = '🔍 Scan Perangkat';
  btnScan.disabled = false;
});

btnConnect.addEventListener('click', async () => {
  if (devices.length === 0) {
    updateStatus('❌ Tidak ada perangkat. Scan dulu!', 'error');
    return;
  }
  
  updateStatus('🔄 Memulai mirroring...', 'scanning');
  btnConnect.disabled = true;
  btnConnect.innerHTML = '<span class="loading"></span>Connecting...';
  
  try {
    const response = await fetch(`${serverURL}/api/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      updateStatus('✅ Mirroring AKTIF! Cek layar laptop', 'connected');
      btnScan.disabled = true;
      btnConnect.style.display = 'none';
      btnDisconnect.style.display = 'block';
    } else {
      updateStatus('❌ Error: ' + data.error, 'error');
      btnConnect.disabled = false;
      btnConnect.innerHTML = '✅ Connect';
    }
  } catch (error) {
    updateStatus('❌ Error: ' + error.message, 'error');
    btnConnect.disabled = false;
    btnConnect.innerHTML = '✅ Connect';
  }
});

btnDisconnect.addEventListener('click', async () => {
  try {
    const response = await fetch(`${serverURL}/api/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      updateStatus('⏹️ Mirroring dihentikan', 'idle');
      btnScan.disabled = false;
      btnConnect.style.display = 'block';
      btnConnect.disabled = devices.length === 0;
      btnConnect.innerHTML = '✅ Connect';
      btnDisconnect.style.display = 'none';
    }
  } catch (error) {
    updateStatus('❌ Error: ' + error.message, 'error');
  }
});
