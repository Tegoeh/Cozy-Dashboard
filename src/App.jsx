import React, { useState, useEffect } from 'react';
import { BookOpen, Wallet, Dumbbell, Coins, Sparkles } from 'lucide-react';
import { useDashboardStore } from './store/useDashboardStore';
import HomeTab from './components/HomeTab';
import BelajarTab from './components/BelajarTab';
import KeuanganTab from './components/KeuanganTab';
import WorkoutTab from './components/WorkoutTab';
import GiziTab from './components/GiziTab';
import Settings from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { activeWorkout, testConnection, checkDailyReset, hydrationNotificationOption } = useDashboardStore();

  useEffect(() => {
    // Jalankan cek reset harian dan tes koneksi ke database Google Sheets di background saat aplikasi dimuat
    checkDailyReset();
    testConnection();
  }, []);

  useEffect(() => {
    if (hydrationNotificationOption === 'off') return;

    const hours = hydrationNotificationOption === '1h' ? 1 : 2;
    const intervalMs = hours * 60 * 60 * 1000;

    const timer = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification('Waktunya Minum Air! 💧', {
          body: 'Segarkan tubuh Anda dengan segelas air mineral hangat sekarang. Tetap cozy & sehat!',
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [hydrationNotificationOption]);

  const playCozyChime = (freq = 523.25, duration = 0.25) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  // --- KELAS DINAMIS UNTUK LAYOUT UTAMA ---
  // Jika sedang workout aktif (kamera AI berjalan): layar penuh, hilangkan border limit.
  // Jika sedang di tab workout biasa (Dashboard RPG): perluas batas lebar agar pas (max-width 768px).
  // Jika di tab home/belajar/keuangan/gizi: batasi mobile-first max-width 480px untuk HP.
  const getContainerClass = () => {
    if (activeWorkout) return 'app-container active-session';
    if (activeTab === 'workout') return 'app-container workout-mode';
    return 'app-container';
  };

  return (
    <div className={getContainerClass()}>
      
      {/* RENDER TAB VIEWS */}
      <div className="view-content flex-1">
        {activeTab === 'home' && (
          <HomeTab 
            onSwitchTab={setActiveTab} 
            onOpenSettings={() => setShowSettingsModal(true)} 
          />
        )}
        {activeTab === 'study' && <BelajarTab />}
        {activeTab === 'finance' && <KeuanganTab />}
        {activeTab === 'workout' && <WorkoutTab />}
        {activeTab === 'meal' && <GiziTab />}
      </div>

      {/* FLOATING BOTTOM NAV BAR - SEMBUNYIKAN JIKA SEDANG LATIHAN AKTIF (CAMERA AI) */}
      {!activeWorkout && (
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'study' ? 'active-study' : ''}`}
            onClick={() => {
              setActiveTab('study');
              playCozyChime(493.88, 0.15); // B4
            }}
          >
            <BookOpen size={18} />
            <span>BELAJAR</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'workout' ? 'active-study' : ''}`}
            onClick={() => {
              setActiveTab('workout');
              playCozyChime(440.00, 0.15); // A4
            }}
          >
            <Dumbbell size={18} />
            <span>WORKOUT</span>
          </button>

          {/* TOMBOL HOME DI TENGAH-TENGAH (SIMETRIS & MENONJOL) */}
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('home');
              playCozyChime(523.25, 0.15); // C5
            }}
          >
            <div style={{ 
              background: activeTab === 'home' ? 'var(--color-study)' : 'var(--color-primary)', 
              color: 'var(--bg-dark)', 
              width: '40px', 
              height: '40px', 
              minWidth: '40px',
              minHeight: '40px',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              top: '-14px',
              flexShrink: 0,
              border: '2px solid var(--bg-card)',
              transition: 'all 0.2s ease'
            }}>
              <Coins size={18} />
            </div>
            <span>HOME</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'finance' ? 'active-finance' : ''}`}
            onClick={() => {
              setActiveTab('finance');
              playCozyChime(587.33, 0.15); // D5
            }}
          >
            <Wallet size={18} />
            <span>KEUANGAN</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'meal' ? 'active-study' : ''}`}
            onClick={() => {
              setActiveTab('meal');
              playCozyChime(659.25, 0.15); // E5
            }}
          >
            <Sparkles size={18} />
            <span>GIZI AI</span>
          </button>
        </nav>
      )}
      {/* MODAL POPUP SETTINGS */}
      {showSettingsModal && (
        <div className="settings-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <Settings onBackToHome={() => setShowSettingsModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
}
