const express = require('express');
const { exec, spawn } = require('child_process');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5555;

app.use(express.json());
app.use(express.static('public'));

let scrcpyProcess = null;
let connectedDevices = [];

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

app.post('/api/scan', async (req, res) => {
  try {
    connectedDevices = await checkADBDevices();
    res.json({ 
      success: true, 
      devices: connectedDevices
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/connect', async (req, res) => {
  try {
    if (connectedDevices.length === 0) {
      return res.json({ 
        success: false, 
        error: 'Tidak ada perangkat terdeteksi. Scan dulu!' 
      });
    }
    
    if (scrcpyProcess) {
      return res.json({ 
        success: false, 
        error: 'Mirroring sudah aktif' 
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
    });
    
    res.json({ 
      success: true,
      message: 'Mirroring dimulai! Cek layar laptop'
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/disconnect', (req, res) => {
  if (scrcpyProcess) {
    scrcpyProcess.kill();
    scrcpyProcess = null;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Tidak ada mirroring aktif' });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ 
    success: true,
    isConnected: scrcpyProcess !== null,
    serverIP: getLocalIP()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('========================================');
  console.log('  Scrcpy Web Mirror Server');
  console.log('========================================');
  console.log('');
  console.log(`Server: http://${ip}:${PORT}`);
  console.log('');
  console.log('Cara pakai:');
  console.log('1. Sambungkan HP ke laptop via USB');
  console.log('2. Aktifkan USB Debugging di HP');
  console.log(`3. Buka http://${ip}:${PORT} di browser HP`);
  console.log('4. Klik Scan → Connect');
  console.log('');
});
