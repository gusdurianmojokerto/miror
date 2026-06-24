const express = require('express');
const { exec, spawn } = require('child_process');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.static('public'));

let scrcpyProcess = null;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function checkADBDevices() {
  return new Promise((resolve, reject) => {
    const adbPath = path.join(__dirname, 'adb.exe');
    exec(`"${adbPath}" devices`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      const lines = stdout.split('\n').slice(1).filter(line => line.trim());
      const devices = lines.map(line => {
        const parts = line.trim().split('\t');
        return { id: parts[0], status: parts[1] };
      }).filter(d => d.status === 'device');
      resolve(devices);
    });
  });
}

app.get('/api/check', async (req, res) => {
  try {
    const devices = await checkADBDevices();
    res.json({ 
      success: true, 
      devices: devices,
      hasDevice: devices.length > 0,
      isRunning: scrcpyProcess !== null
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/start', async (req, res) => {
  try {
    const devices = await checkADBDevices();
    
    if (devices.length === 0) {
      return res.json({ 
        success: false, 
        error: 'Tidak ada HP terdeteksi. Cek USB Debugging!' 
      });
    }
    
    if (scrcpyProcess) {
      return res.json({ 
        success: false, 
        error: 'Mirroring sudah berjalan' 
      });
    }
    
    const scrcpyPath = path.join(__dirname, 'scrcpy.exe');
    scrcpyProcess = spawn(scrcpyPath, [
      '--max-size=1920',
      '--window-title=Phone Mirror',
      '--turn-screen-off',
      '--stay-awake'
    ]);
    
    scrcpyProcess.on('close', (code) => {
      scrcpyProcess = null;
      console.log('Scrcpy stopped');
    });
    
    scrcpyProcess.on('error', (err) => {
      console.error('Scrcpy error:', err);
      scrcpyProcess = null;
    });
    
    res.json({ 
      success: true,
      message: 'Mirroring aktif! Layar HP ditampilkan di laptop'
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/stop', (req, res) => {
  if (scrcpyProcess) {
    scrcpyProcess.kill();
    scrcpyProcess = null;
    res.json({ 
      success: true,
      message: 'Mirroring dihentikan' 
    });
  } else {
    res.json({ 
      success: false, 
      error: 'Tidak ada mirroring aktif' 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Scrcpy Web Mirror Server             ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`📱 Buka di HP: http://${ip}:${PORT}`);
  console.log('');
  console.log('Langkah:');
  console.log('1. Colok HP ke laptop via USB');
  console.log('2. Aktifkan USB Debugging di HP');
  console.log('3. Buka URL di atas di browser HP');
  console.log('4. Klik tombol Connect');
  console.log('');
});
