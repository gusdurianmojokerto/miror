let devices = [];
let isConnected = false;

const statusEl = document.getElementById('status');
const devicesEl = document.getElementById('devices');
const btnScan = document.getElementById('btnScan');
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');
const serverInfoEl = document.getElementById('serverInfo');

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
    <div class="device-item active">
      <div class="device-id">${device.id}</div>
      <div class="device-status">Status: Connected</div>
    </div>
  `).join('');
}

btnScan.addEventListener('click', async () => {
  updateStatus('Scanning perangkat...', 'scanning');
  btnScan.innerHTML = '<span class="loading"></span>Scanning...';
  btnScan.disabled = true;
  
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      devices = data.devices;
      displayDevices();
      updateStatus(
        devices.length > 0 
          ? `Ditemukan ${devices.length} perangkat` 
          : 'Tidak ada perangkat terdeteksi',
        devices.length > 0 ? 'idle' : 'error'
      );
      btnConnect.disabled = devices.length === 0;
    } else {
      updateStatus('Error: ' + data.error, 'error');
    }
  } catch (error) {
    updateStatus('Error: ' + error.message, 'error');
  }
  
  btnScan.innerHTML = 'Scan Perangkat';
  btnScan.disabled = false;
});

btnConnect.addEventListener('click', async () => {
  if (devices.length === 0) {
    updateStatus('Tidak ada perangkat. Scan dulu!', 'error');
    return;
  }
  
  updateStatus('Memulai mirroring...', 'scanning');
  btnConnect.disabled = true;
  
  try {
    const response = await fetch('/api/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      isConnected = true;
      updateStatus('Mirroring aktif! Lihat layar laptop', 'connected');
      btnScan.disabled = true;
      btnConnect.style.display = 'none';
      btnDisconnect.style.display = 'block';
    } else {
      updateStatus('Error: ' + data.error, 'error');
      btnConnect.disabled = false;
    }
  } catch (error) {
    updateStatus('Error: ' + error.message, 'error');
    btnConnect.disabled = false;
  }
});

btnDisconnect.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      isConnected = false;
      updateStatus('Mirroring dihentikan', 'idle');
      btnScan.disabled = false;
      btnConnect.style.display = 'block';
      btnConnect.disabled = devices.length === 0;
      btnDisconnect.style.display = 'none';
    }
  } catch (error) {
    updateStatus('Error: ' + error.message, 'error');
  }
});

fetch('/api/status')
  .then(res => res.json())
  .then(data => {
    if (data.success && data.serverIP) {
      serverInfoEl.textContent = `Server: ${data.serverIP}:${window.location.port || 5555}`;
    }
  })
  .catch(() => {
    serverInfoEl.textContent = 'Server info tidak tersedia';
  });
