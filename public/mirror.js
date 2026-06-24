import Adb from '@yume-chan/adb';
import AdbWebUsbBackend from '@yume-chan/adb-backend-webusb';
import { ScrcpyOptions1_24, ScrcpyVideoCodecId } from '@yume-chan/scrcpy';

const statusEl = document.getElementById('status');
const deviceInfoEl = document.getElementById('deviceInfo');
const btnScan = document.getElementById('btnScan');
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');
const screenVideo = document.getElementById('screen');

let adb = null;
let scrcpy = null;

function updateStatus(message, className) {
  statusEl.textContent = message;
  statusEl.className = `status ${className}`;
}

// Check WebUSB support
if (!navigator.usb) {
  updateStatus('❌ Browser tidak support WebUSB! Gunakan Chrome/Edge versi terbaru', 'error');
  btnScan.disabled = true;
}

btnScan.addEventListener('click', async () => {
  try {
    updateStatus('🔍 Scanning perangkat...', 'scanning');
    btnScan.innerHTML = '<span class="loading"></span>Scanning...';
    btnScan.disabled = true;
    
    // Select USB device
    const devices = await AdbWebUsbBackend.getDevices();
    let backend;
    
    if (devices.length === 0) {
      backend = await AdbWebUsbBackend.requestDevice();
    } else {
      backend = devices[0];
    }
    
    // Connect to ADB
    adb = await Adb.authenticate(backend);
    
    const deviceInfo = await adb.getDeviceInfo();
    
    updateStatus('✅ HP Terdeteksi!', 'connected');
    
    deviceInfoEl.style.display = 'block';
    deviceInfoEl.className = 'device-info';
    deviceInfoEl.innerHTML = `
      <strong>Device:</strong> ${deviceInfo.product || 'Android Device'}<br>
      <strong>Model:</strong> ${deviceInfo.model || 'Unknown'}<br>
      <strong>Android:</strong> ${deviceInfo.version || 'Unknown'}<br>
      <strong>Status:</strong> <span style="color: #28a745; font-weight: 600;">Ready to Mirror</span>
    `;
    
    btnScan.style.display = 'none';
    btnConnect.style.display = 'inline-block';
    
  } catch (error) {
    console.error('Scan error:', error);
    
    if (error.message.includes('No device selected')) {
      updateStatus('❌ Tidak ada perangkat dipilih. Coba lagi!', 'error');
    } else {
      updateStatus('❌ Error: ' + error.message, 'error');
    }
    
    btnScan.innerHTML = '🔍 Scan Perangkat';
    btnScan.disabled = false;
  }
});

btnConnect.addEventListener('click', async () => {
  try {
    updateStatus('🔄 Memulai mirroring...', 'scanning');
    btnConnect.disabled = true;
    btnConnect.innerHTML = '<span class="loading"></span>Connecting...';
    
    // Start scrcpy
    const options = new ScrcpyOptions1_24({
      videoCodec: ScrcpyVideoCodecId.H264,
      maxSize: 1920,
      bitRate: 8000000,
    });
    
    scrcpy = await adb.scrcpy(options);
    
    // Get video stream
    const videoStream = await scrcpy.videoStream;
    
    // Use WebCodecs to decode
    const decoder = new VideoDecoder({
      output(frame) {
        // Draw frame to canvas or video element
        screenVideo.srcObject = frame;
        frame.close();
      },
      error(e) {
        console.error('Decoder error:', e);
      }
    });
    
    decoder.configure({
      codec: 'avc1.42C028', // H.264 Baseline Profile
    });
    
    // Feed video packets to decoder
    for await (const packet of videoStream) {
      decoder.decode(new EncodedVideoChunk({
        type: packet.keyframe ? 'key' : 'delta',
        timestamp: packet.pts,
        data: packet.data
      }));
    }
    
    updateStatus('✅ Mirroring Aktif!', 'connected');
    btnConnect.style.display = 'none';
    btnDisconnect.style.display = 'inline-block';
    
    deviceInfoEl.innerHTML = `
      <strong>Status:</strong> <span style="color: #28a745; font-weight: 600;">🟢 Mirroring Active</span>
    `;
    
  } catch (error) {
    console.error('Connect error:', error);
    updateStatus('❌ Gagal start mirroring: ' + error.message, 'error');
    btnConnect.disabled = false;
    btnConnect.innerHTML = '✅ Connect & Mirror';
  }
});

btnDisconnect.addEventListener('click', async () => {
  try {
    if (scrcpy) {
      await scrcpy.close();
      scrcpy = null;
    }
    
    if (adb) {
      await adb.close();
      adb = null;
    }
    
    screenVideo.srcObject = null;
    
    updateStatus('⏹️ Disconnected', 'idle');
    deviceInfoEl.style.display = 'none';
    
    btnScan.style.display = 'inline-block';
    btnScan.innerHTML = '🔍 Scan Perangkat';
    btnScan.disabled = false;
    btnConnect.style.display = 'none';
    btnDisconnect.style.display = 'none';
    
  } catch (error) {
    console.error('Disconnect error:', error);
  }
});