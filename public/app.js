let deviceIP = null;
let laptopIP = null;

const statusEl = document.getElementById('status');
const connectionInfoEl = document.getElementById('connectionInfo');
const deviceIPEl = document.getElementById('deviceIP');
const connectionStatusEl = document.getElementById('connectionStatus');
const btnEnable = document.getElementById('btnEnable');
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');
const serverInfoEl = document.getElementById('serverInfo');

function updateStatus(message, className) {
  statusEl.textContent = message;
  statusEl.className = `status ${className}`;
}

btnEnable.addEventListener('click', async () => {
  updateStatus('Mengaktifkan koneksi wireless...', 'scanning');
  btnEnable.innerHTML = '<span class="loading"></span>Processing...';
  btnEnable.disabled = true;
  
  try {
    const response = await fetch('/api/enable-wireless', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      deviceIP = data.deviceIP;
      laptopIP = data.laptopIP;
      
      connectionInfoEl.style.display = 'block';
      deviceIPEl.textContent = `${deviceIP}:${data.port}`;
      connectionStatusEl.textContent = 'Wireless diaktifkan! Cabut kabel USB sekarang';
      
      updateStatus('Wireless diaktifkan! Cabut kabel USB lalu klik Connect', 'connected');
      
      btnEnable.style.display = 'none';
      btnConnect.style.display = 'block';
      
      serverInfoEl.innerHTML = `
        <strong>Penting:</strong><br>
        1. Cabut kabel USB dari HP<br>
        2. Pastikan HP dan laptop terhubung ke WiFi yang sama<br>
        3. Klik tombol Connect di bawah
      `;
    } else {
      updateStatus('Error: ' + data.error, 'error');
      btnEnable.innerHTML = 'Enable Wireless';
      btnEnable.disabled = false;
    }
  } catch (error) {
    updateStatus('Error: ' + error.message, 'error');
    btnEnable.innerHTML = 'Enable Wireless';
    btnEnable.disabled = false;
  }
});

btnConnect.addEventListener('click', () => {
  if (!deviceIP || !laptopIP) {
    updateStatus('Data koneksi tidak lengkap', 'error');
    return;
  }
  
  updateStatus('Menghubungkan ke laptop...', 'scanning');
  connectionStatusEl.textContent = 'Menghubungkan...';
  
  const scrcpyUrl = `intent://connect?ip=${laptopIP}&port=5555#Intent;scheme=scrcpy;package=com.genymobile.scrcpy;end`;
  
  const adbConnectCommand = `adb connect ${laptopIP}:5555`;
  
  updateStatus('Silakan jalankan scrcpy di laptop atau buka aplikasi scrcpy di HP', 'connected');
  connectionStatusEl.innerHTML = `
    <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 5px;">
      <strong>Jalankan di laptop:</strong><br>
      <code style="font-size: 11px; word-break: break-all;">scrcpy --tcpip=${deviceIP}:5555</code>
    </div>
  `;
  
  btnConnect.style.display = 'none';
  btnDisconnect.style.display = 'block';
  
  serverInfoEl.innerHTML = `
    <strong>Koneksi aktif!</strong><br>
    Buka command prompt di laptop dan jalankan:<br>
    <code>scrcpy --tcpip=${deviceIP}:5555</code>
  `;
});

btnDisconnect.addEventListener('click', () => {
  updateStatus('Koneksi diputus', 'idle');
  connectionInfoEl.style.display = 'none';
  btnDisconnect.style.display = 'none';
  btnEnable.style.display = 'block';
  btnEnable.innerHTML = 'Enable Wireless';
  btnEnable.disabled = false;
  
  serverInfoEl.textContent = `Server: ${window.location.host}`;
  deviceIP = null;
  laptopIP = null;
});

serverInfoEl.textContent = `Server: ${window.location.host}`;
