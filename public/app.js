let devices = [];
let isConnected = false;
let serverURL = localStorage.getItem('serverURL') || '';

const statusEl = document.getElementById('status');
const devicesEl = document.getElementById('devices');
const serverURLInput = document.getElementById('serverURL');
const btnSaveServer = document.getElementById('btnSaveServer');
const btnScan = document.getElementById('btnScan');
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');
const serverInfoEl = document.getElementById('serverInfo');

if (serverURL) {
  serverURLInput.value = serverURL;
  updateStatus('Siap. Masukkan IP server laptop lalu klik Scan', 'idle');
}

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

btnSaveServer.addEventListener('click', async () => {
  const url = serverURLInput.value.trim();
  if (!url) {
    updateStatus('Masukkan URL server laptop!', 'error');
    return;
  }
  
  serverURL = url.replace(/\/$/, '');
  localStorage.setItem('serverURL', serverURL);
  
  updateStatus('Memeriksa koneksi...', 'scanning');
  
  try {
    const response = await fetch(`${serverURL}/api/health`);
    const data = await response.json();
    
    if (data.success) {
      updateStatus('Terhubung ke server! Klik Scan untuk mulai', 'connected');
      btnScan.disabled = false;
    } else {
      updateStatus('Server tidak merespons', 'error');
    }
  } catch (error) {
    updateStatus('Tidak bisa terhubung ke server. Cek URL!', 'error');
  }
});

btnScan.addEventListener('click', async () => {
  if (!serverURL) {
    updateStatus('Set URL server dulu!', 'error');
    return;
  }
  
  updateStatus('Scanning perangkat...', 'scanning');
  btnScan.innerHTML = '<span class="loading"></span>Scanning...';
  btnScan.disabled = true;
  
  try {
    const response = await fetch(`${serverURL}/api/scan`, {
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
    const response = await fetch(`${serverURL}/api/connect`, {
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
    const response = await fetch(`${serverURL}/api/disconnect`, {
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
