const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5555;

app.use(express.json());
app.use(express.static('public'));

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

function enableTcpip() {
  return new Promise((resolve, reject) => {
    exec(path.join(__dirname, 'adb.exe') + ' tcpip 5555', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

function getDeviceIP() {
  return new Promise((resolve, reject) => {
    exec(path.join(__dirname, 'adb.exe') + ' shell ip route', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      const match = stdout.match(/src\s+(\d+\.\d+\.\d+\.\d+)/);
      if (match) {
        resolve(match[1]);
      } else {
        reject(new Error('Could not get device IP'));
      }
    });
  });
}

app.post('/api/enable-wireless', async (req, res) => {
  try {
    await enableTcpip();
    const deviceIP = await getDeviceIP();
    res.json({ 
      success: true, 
      deviceIP: deviceIP,
      port: 5555,
      laptopIP: getLocalIP()
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('========================================');
  console.log('  Scrcpy Web Mirror Server');
  console.log('========================================');
  console.log('');
  console.log(`Server berjalan di: http://${ip}:${PORT}`);
  console.log('');
  console.log('Instruksi:');
  console.log('1. Sambungkan HP ke laptop via USB');
  console.log('2. Aktifkan USB Debugging di HP');
  console.log(`3. Buka http://${ip}:${PORT} di browser HP`);
  console.log('4. Ikuti petunjuk di layar HP');
  console.log('');
});
