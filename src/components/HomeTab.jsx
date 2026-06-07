import React, { useState } from 'react';
import { BookOpen, Wallet, Dumbbell, Award, Coins, Sparkles, Settings as SettingsIcon, Store, Trophy, Crown, Gem, CheckCircle, CheckCircle2, Scroll, Droplet, Sprout, Milk, Gamepad2, Heart, Moon, Smile, ShoppingCart, Swords } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { getLocalDateString } from '../utils/dateUtils';


// --- LOGO E-WALLET SVG PIXEL ART ---
const WalletLogo = ({ type, size = 20 }) => {
  const renderPixelLogo = (colors, grid) => (
    <svg width={size} height={size} viewBox="0 0 8 8" style={{ shapeRendering: 'crispEdges', borderRadius: '4px' }}>
      {grid.map((row, y) => 
        row.split('').map((char, x) => {
          const fill = colors[char];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />;
        })
      )}
    </svg>
  );

  switch (type.toLowerCase()) {
    case 'gopay':
      return renderPixelLogo(
        { '.': 'transparent', 'G': '#89b0c6', 'W': '#ffffff' },
        [
          "GGGGGGGG",
          "GGWWWWGG",
          "GGWGGWGG",
          "GGWGGWGG",
          "GGWWWWGG",
          "GGWGGGGG",
          "GGWGGGGG",
          "GGGGGGGG"
        ]
      );
    case 'spay':
      return renderPixelLogo(
        { '.': 'transparent', 'S': '#e8a7a1', 'W': '#ffffff' },
        [
          "SSSSSSSS",
          "SSWWWSSS",
          "SSWSSSSS",
          "SSWWWSSS",
          "SSSSWSSS",
          "SSWWWSSS",
          "SSSSSSSS",
          "SSSSSSSS"
        ]
      );
    case 'dana':
      return renderPixelLogo(
        { '.': 'transparent', 'D': '#9bbbc7', 'W': '#ffffff' },
        [
          "DDDDDDDD",
          "DDWWWDDD",
          "DDWDWDDD",
          "DDWDWDDD",
          "DDWDWDDD",
          "DDWWWDDD",
          "DDDDDDDD",
          "DDDDDDDD"
        ]
      );
    default:
      return renderPixelLogo(
        { '.': 'transparent', 'C': '#a1887f', 'G': '#eecda3', 'B': '#3d251e' },
        [
          "CCCCCCCC",
          "CCCCCGCC",
          "CCGGGGGC",
          "CGCCCCGC",
          "CGCCCCGC",
          "CGCCCCGC",
          "CCGGGGGC",
          "CCCCCCCC"
        ]
      );
  }
};

// --- MATRIX KUCING PIXEL ---
const CAT_STAGE_1 = [
  "................",
  ".....O....O.....",
  "....OOO..OOO....",
  "....OWOOOOOW....",
  "....O.B..B.O....",
  "....OO.PP.OO....",
  ".....OOOOOO.....",
  "....CCCCCCCC....",
  "...CWWWWWWWWC...",
  "..CCCCCCCCCCCC..",
  "..C..........C..",
  "..C.CCCCCC...C..",
  "...C......C.C...",
  "....CCCCCC.C....",
  "................",
  "................"
];

const CAT_STAGE_2 = [
  "................",
  "................",
  "................",
  "......OO........",
  "....OOOOOO......",
  "...OOOOOOOO.....",
  "..OO.B..B.OO....",
  "..OOPPPPPPOO....",
  "...OOOOOOOO.....",
  "....OOOOOOOOO...",
  "...OOOOOOOOOO...",
  "...OOOOOOOOOO...",
  "....OOOOOOOO....",
  ".....WW..WW.....",
  "................",
  "................"
];

const CAT_STAGE_3 = [
  "................",
  "....O......O....",
  "...OOO....OOO...",
  "...OWOOOOOOW...",
  "...O..B..B..O...",
  "...OO..PP..OO...",
  "....OOOOOOOO....",
  "....SSSSSSSS....",
  "....SOOOOSOS....",
  "...SSOOOOSOSS...",
  "...SSOOOOSOSS...",
  "...SSOOOOSOSS...",
  "...S.S....S.S...",
  "...W.W....W.W...",
  "................",
  "................"
];

const CAT_STAGE_4 = [
  "......UU........",
  ".....U..U.......",
  "......UU........",
  "....O......O....",
  "...OOO....OOO...",
  "...OWOOOOOOW...",
  "...O..B..B..O...",
  "...OO..PP..OO...",
  "....SSSSSSSS....",
  "...SSOOOOSOSS...",
  "...SSOOOOSOSS...",
  "...SSOOOOSOSS...",
  "...S.S....S.S...",
  "...W.W....W.W...",
  "...CCWWWWWWCC...",
  "....CCCCCCCC...."
];

const PixelCatRenderer = ({ matrix, size = 110 }) => {
  const colorMap = {
    '.': 'transparent',
    'O': '#d07c4d',
    'W': '#ffffff',
    'B': '#3d251e',
    'P': '#e8a7a1',
    'S': '#92b097',
    'U': '#cfbda8',
    'C': '#a39081',
    'G': '#eecda3'
  };

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ shapeRendering: 'crispEdges' }}>
      {matrix.map((row, y) => 
        row.split('').map((char, x) => {
          const fill = colorMap[char];
          if (!fill || fill === 'transparent') return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />;
        })
      )}
    </svg>
  );
};

export default function HomeTab({ onSwitchTab, onOpenSettings }) {
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopTab, setShopTab] = useState('decor');
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');

  const {
    subjects,
    studyHistory = [],
    wallets,
    debts,
    coins,
    rpgLevel,
    rpgXp,
    rpgBossesDefeated,
    rpgInventory = [],
    buyItem,
    waterMlToday,
    petMood,
    incrementWater,
    decrementWater,
    interactWithPet,
    dailyQuests = [],
    claimQuestReward,
    gratitudeJournal = [],
    saveGratitudeEntry
  } = useDashboardStore();

  const [hoveredQuestIdx, setHoveredQuestIdx] = useState(null);
  const [activeQuestId, setActiveQuestId] = useState('quest_boss');

  const getQuestMeta = (questId) => {
    switch (questId) {
      case 'quest_boss':
        return { 
          icon: <Swords size={16} className="text-amber-400" />, 
          tab: 'workout'
        };
      case 'quest_reps':
        return { 
          icon: <Dumbbell size={16} className="text-lime-400" />, 
          tab: 'workout'
        };
      case 'quest_water':
        return { 
          icon: <Droplet size={16} className="text-blue-400" />, 
          tab: 'home'
        };
      case 'quest_study':
        return { 
          icon: <BookOpen size={16} className="text-emerald-400" />, 
          tab: 'study'
        };
      case 'quest_finance':
        return { 
          icon: <Wallet size={16} className="text-rose-400" />, 
          tab: 'finance'
        };
      default:
        return { 
          icon: <Scroll size={16} className="text-zinc-400" />, 
          tab: 'home'
        };
    }
  };

  const DECOR_SHOP = [
    { name: "Mesin Espresso Pixel", cost: 15, desc: "Mesin espresso mini yang mengepul hangat.", symbol: "☕" },
    { name: "Rak Buku Kayu", cost: 30, desc: "Rak penuh buku referensi coding & komik lofi.", symbol: "📚" },
    { name: "Tanaman Gantung Sage", cost: 20, desc: "Tanaman hias hijau segar di pojok jendela.", symbol: "🌿" },
    { name: "Lampu Gantung Hangat", cost: 25, desc: "Lampu kuning hangat bergaya industrial cafe.", symbol: "💡" }
  ];

  const FOOD_SHOP = [
    { name: "Catnip Segar", cost: 5, desc: "Cemilan herbal segar. Membuat kucing sangat GEMBIRA! (+15 XP RPG)", symbol: "🌿", mood: "Gembira", type: "feed_catnip" },
    { name: "Ikan Salmon Panggang", cost: 10, desc: "Salmon fillet lezat kaya omega-3. Membuat kucing KENYANG! (+30 XP RPG)", symbol: "🐟", mood: "Kenyang", type: "feed_salmon" },
    { name: "Biskuit Kucing Madu", cost: 4, desc: "Biskuit mini berbentuk ikan yang renyah. Membuat kucing MANJA! (+10 XP)", symbol: "🍪", mood: "Manja", type: "feed_biscuit" }
  ];

  const totalStudyTime = subjects.reduce((sum, s) => sum + s.totalTime, 0);
  const totalHours = totalStudyTime / 3600;

  const todayStr = getLocalDateString();
  const todayStudyHistory = studyHistory.filter(h => h.date === todayStr);
  const totalStudyTimeToday = todayStudyHistory.reduce((sum, h) => sum + h.duration, 0);

  const todayJournalEntry = gratitudeJournal.find(j => j.date === todayStr);
  const hasWrittenJournalToday = !!todayJournalEntry;

  const getPetLevel = () => {
    if (totalHours < 1) return 1;
    if (totalHours < 5) return 2;
    if (totalHours < 12) return 3;
    return 4;
  };

  const petLevel = getPetLevel();

  const getPetInfo = () => {
    switch (petLevel) {
      case 1:
        return { name: "CUP NEKO (Kucing Cangkir)", desc: "Kucing kecil di dalam cangkir kopi susu hangat.", matrix: CAT_STAGE_1 };
      case 2:
        return { name: "SLEEPY NEKO (Kucing Tidur)", desc: "Kucing melingkar tidur pulas sehabis susu hangat.", matrix: CAT_STAGE_2 };
      case 3:
        return { name: "BARISTA NEKO (Kucing Barista)", desc: "Kucing barista memakai celemek hijau sage.", matrix: CAT_STAGE_3 };
      default:
        return { name: "MASTER BREW (Penyeduh Kopi)", desc: "Kucing Barista sedang menyeduh kopi V60 hangat.", matrix: CAT_STAGE_4 };
    }
  };

  const pet = getPetInfo();

  const totalAssets = Object.values(wallets).reduce((sum, val) => sum + val, 0);
  const totalDebts = debts.filter(d => !d.paid).reduce((sum, d) => sum + d.amount, 0);

  const achievements = [
    { id: "read_1", title: "Kutu Buku I", desc: "Belajar total 1 Jam", icon: <BookOpen size={18} />, unlocked: totalHours >= 1 },
    { id: "read_10", title: "Kutu Buku II", desc: "Belajar total 10 Jam", icon: <Award size={18} />, unlocked: totalHours >= 10 },
    { id: "fit_1", title: "Atlet Pemula", desc: "Kalahkan 1 bos RPG", icon: <Dumbbell size={18} />, unlocked: rpgBossesDefeated > 0 },
    { id: "fit_boss", title: "Atlet Legendaris", desc: "Kalahkan 3 bos RPG", icon: <Crown size={18} />, unlocked: rpgBossesDefeated >= 3 },
    { id: "rich", title: "Konglomerat", desc: "Saldo Rp 500.000+", icon: <Gem size={18} />, unlocked: totalAssets >= 500000 },
    { id: "no_debt", title: "Bebas Hutang", desc: "Tidak ada hutang aktif", icon: <CheckCircle size={18} />, unlocked: totalDebts === 0 }
  ];

  const formatRupiah = (val) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Hitung XP progress bar
  const xpNeeded = rpgLevel * 150;
  const xpPercent = Math.min((rpgXp / xpNeeded) * 100, 100);

  return (
    <div className="home-tab-view Content">
      
      {/* HEADER UTAMA DENGAN TOMBOL SETTINGS */}
      <div className="flex-row-between" style={{ padding: '6px 4px 12px 4px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '8px', 
            background: 'var(--color-study)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--bg-dark)'
          }}>
            <Coins size={16} />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'var(--font-pixel)', color: 'var(--text-primary)' }}>
            COZY CAFE
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* TOMBOL TOKO DEKORASI */}
          <button 
            className="btn btn-outline" 
            style={{ 
              width: '36px', 
              height: '36px', 
              minWidth: '36px',
              borderRadius: '50%', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderColor: 'var(--border-color)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => {
              setShowShopModal(true);
              try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.08);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.15);
              } catch(e){}
            }}
            title="Toko Dekorasi Cozy Cafe"
          >
            <Store size={18} />
          </button>

          {/* TOMBOL PENGATURAN */}
          <button 
            className="btn btn-outline" 
            style={{ 
              width: '36px', 
              height: '36px', 
              minWidth: '36px',
              borderRadius: '50%', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderColor: 'var(--border-color)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => {
              onOpenSettings();
              try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.08);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.15);
              } catch(e){}
            }}
            title="Pengaturan & Cadangan"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      {/* 1. WIDGET KUCING COZY CAFE */}
      <div className="card" style={{ 
        background: 'linear-gradient(to bottom right, #1c1815, #120f0d)',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.05 }}>
          <Award size={80} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '6px 0' }}>
          {/* GELEMBUNG DIALOG KUCING */}
          <div style={{
            position: 'relative',
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '8px 12px',
            maxWidth: '240px',
            fontSize: '0.72rem',
            color: 'var(--text-primary)',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
            animation: 'cozy-fade-in 0.25s ease-out'
          }}>
            {petMood === 'Kenyang' ? "Nyam... Salmon/susu ini lezat sekali! Aku ingin tidur... purrr~ 💤" :
             petMood === 'Gembira' ? "Miaw! Aku sangat gembira! Ayo semangat belajar dan olahraga hari ini! 🌟🐈" :
             petMood === 'Manja' ? "Purrr... elusanmu hangat sekali hooman. Aku sayang kamu! ❤️🐾" :
             "Halo hooman! Siap produktif hari ini? Jangan lupa minum air ya! ☕💧"}
            <div style={{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '8px',
              height: '8px',
              background: 'var(--bg-dark)',
              borderRight: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)'
            }}></div>
          </div>

          <div style={{ 
            width: '120px', 
            height: '120px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            animation: petMood === 'Gembira' ? 'cozy-wiggle 1.2s infinite' : 
                       petMood === 'Kenyang' ? 'cozy-breathe 4s infinite step-end' :
                       petMood === 'Manja' ? 'cozy-wiggle 2.2s infinite' :
                       petLevel === 1 ? 'cozy-wiggle 3s infinite' : 'cozy-breathe 2.5s infinite step-end',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.4)'
          }}>
            <PixelCatRenderer matrix={pet.matrix} size={100} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: 'var(--color-debt)', fontFamily: 'var(--font-pixel)', fontSize: '1.5rem' }}>
              [LV.{petLevel}] {pet.name}
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '280px', lineHeight: '1.2' }}>
              {pet.desc}
            </p>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-study" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', padding: '1px 10px' }}>
                BELAJAR: {totalHours.toFixed(2)} JAM
              </span>
              
              {/* RAK DEKORASI CAFE YANG AKTIF */}
              {rpgInventory.filter(item => item.type === 'decor').length > 0 && (
                <div style={{ 
                  marginTop: '4px', 
                  background: 'rgba(0,0,0,0.35)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  padding: '4px 8px', 
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {rpgInventory.filter(item => item.type === 'decor').map(item => (
                    <span key={item.id} title={item.name} style={{ fontSize: '1.1rem', cursor: 'help' }}>
                      {item.symbol}
                    </span>
                  ))}
                </div>
              )}

              {/* STATUS MOOD KUCING */}
              <div style={{ 
                marginTop: '8px', 
                fontSize: '0.72rem', 
                color: 'var(--text-secondary)',
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                justifyContent: 'center'
              }}>
                <span>Mood:</span>
                <span className="badge" style={{ 
                  padding: '2px 8px', 
                  fontSize: '0.7rem',
                  background: petMood === 'Kenyang' ? 'rgba(238,205,163,0.15)' : 
                              petMood === 'Gembira' ? 'rgba(162,199,181,0.15)' : 
                              petMood === 'Manja' ? 'rgba(231,181,176,0.15)' : 'rgba(255,255,255,0.05)',
                  color: petMood === 'Kenyang' ? 'var(--color-debt)' : 
                         petMood === 'Gembira' ? 'var(--color-income)' : 
                         petMood === 'Manja' ? 'var(--color-expense)' : 'var(--text-secondary)',
                  borderColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {petMood.toUpperCase()}
                  {petMood === 'Kenyang' && <Milk size={12} />}
                  {petMood === 'Gembira' && <Gamepad2 size={12} />}
                  {petMood === 'Manja' && <Heart size={12} />}
                  {petMood === 'Biasa' && <Moon size={12} />}
                </span>
              </div>

              {/* ACTION BUTTONS UNTUK PET INTERACTION */}
              <div style={{ 
                marginTop: '10px', 
                display: 'flex', 
                gap: '6px', 
                justifyContent: 'center',
                borderTop: '1px dashed var(--border-color)',
                paddingTop: '10px',
                width: '100%',
                maxWidth: '280px'
              }}>
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 8px', fontSize: '0.68rem', height: '28px', borderRadius: '6px', flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  onClick={() => {
                    const success = interactWithPet('feed', 2);
                    if (success === false) {
                      alert("Koin Cozy Anda tidak cukup! ☕");
                    } else {
                      try {
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const oscillator = audioCtx.createOscillator();
                        const gainNode = audioCtx.createGain();
                        oscillator.type = 'triangle';
                        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
                        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
                        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        oscillator.start();
                        oscillator.stop(audioCtx.currentTime + 0.2);
                      } catch(e){}
                    }
                  }}
                >
                  <Milk size={12} /> Susu (2C)
                </button>
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 8px', fontSize: '0.68rem', height: '28px', borderRadius: '6px', flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  onClick={() => {
                    const success = interactWithPet('play', 3);
                    if (success === false) {
                      alert("Koin Cozy Anda tidak cukup! ☕");
                    } else {
                      try {
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const oscillator = audioCtx.createOscillator();
                        const gainNode = audioCtx.createGain();
                        oscillator.type = 'triangle';
                        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.06); // E5
                        oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5
                        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        oscillator.start();
                        oscillator.stop(audioCtx.currentTime + 0.25);
                      } catch(e){}
                    }
                  }}
                >
                  <Gamepad2 size={12} /> Main (3C)
                </button>
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 8px', fontSize: '0.68rem', height: '28px', borderRadius: '6px', flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  onClick={() => {
                    interactWithPet('pet', 0);
                    try {
                      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                      const oscillator = audioCtx.createOscillator();
                      const gainNode = audioCtx.createGain();
                      oscillator.type = 'sine';
                      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                      oscillator.frequency.exponentialRampToValueAtTime(987.77, audioCtx.currentTime + 0.1);
                      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                      gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.05);
                      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                      oscillator.connect(gainNode);
                      gainNode.connect(audioCtx.destination);
                      oscillator.start();
                      oscillator.stop(audioCtx.currentTime + 0.15);
                    } catch(e){}
                  }}
                >
                  <Heart size={12} /> Elus (0C)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET PELACAK HIDRASI (COZY WATER TRACKER) */}
      <div className="card" style={{ margin: '12px 16px', background: 'linear-gradient(to bottom right, #131714, #0f1210)', borderColor: 'rgba(146, 176, 151, 0.15)' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-study)', display: 'flex', alignItems: 'center', gap: '6px', borderBottomColor: 'rgba(146, 176, 151, 0.15)' }}>
          <Droplet size={16} /> COZY WATER TRACKER
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Jaga tubuh tetap terhidrasi. Target 2000ml sehari untuk pertumbuhan otot & hidrasi otak!
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplet size={20} style={{ color: 'var(--color-balance)', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.9rem', fontFamily: 'var(--font-pixel)', color: 'var(--text-primary)' }}>
                {waterMlToday} / 2000 ML
              </strong>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                {waterMlToday >= 2000 ? (
                  <>Hidrasi Tercapai! <Sparkles size={10} style={{ color: 'var(--color-study)' }} /> (+2 Koin)</>
                ) : (
                  'Menyiram tanaman sage kafe Anda.'
                )}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', cursor: 'pointer', height: '24px', minWidth: '48px' }}
                onClick={() => decrementWater(250)}
                disabled={waterMlToday < 250}
              >
                -250ml
              </button>
              <button 
                className="btn btn-study" 
                style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '24px', minWidth: '48px' }}
                onClick={() => {
                  incrementWater(250);
                  try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(450, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1350, audioCtx.currentTime + 0.15);
                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.15);
                  } catch(e){}
                }}
              >
                +250ml
              </button>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', cursor: 'pointer', height: '24px', minWidth: '48px' }}
                onClick={() => decrementWater(700)}
                disabled={waterMlToday < 700}
              >
                -700ml
              </button>
              <button 
                className="btn btn-study" 
                style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '24px', minWidth: '48px' }}
                onClick={() => {
                  incrementWater(700);
                  try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(350, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1150, audioCtx.currentTime + 0.22);
                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.06);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.22);
                  } catch(e){}
                }}
              >
                +700ml
              </button>
            </div>
          </div>
        </div>

        {/* Visual Tanaman Sage Gantung (Pixel Art / Animasi CSS) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', padding: '6px', background: 'rgba(146, 176, 151, 0.05)', borderRadius: '10px', border: '1px dashed rgba(146, 176, 151, 0.2)' }}>
          <Sprout size={16} style={{ color: 'var(--color-study)', animation: 'cozy-breathe 3s infinite ease-in-out' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-study)' }}>
            Status Tanaman Sage: <strong>{waterMlToday >= 2000 ? 'Tumbuh Subur & Segar!' : waterMlToday >= 1000 ? 'Tumbuh Baik' : 'Butuh Air'}</strong>
          </span>
        </div>
      </div>

      {/* BENTO GRID: BELAJAR & WORKOUT */}
      <div className="cozy-bento-grid">
        {/* 2. STATS BELAJAR */}
        <div className="card" onClick={() => onSwitchTab('study')} style={{ cursor: 'pointer', margin: 0 }}>
          <div className="card-title-retro" style={{ color: 'var(--color-study)' }}>
            <BookOpen size={16} /> TARGET BELAJAR HARI INI
          </div>
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-pixel)', lineHeight: '1.1' }}>
              {formatTime(totalStudyTimeToday)}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Ketuk untuk stopwatch / Pomodoro
            </p>
          </div>
          
          <div style={{ marginTop: '10px', display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {subjects.map(s => {
              const todayDuration = todayStudyHistory
                .filter(h => h.date === todayStr && h.subjectId === s.id)
                .reduce((sum, h) => sum + h.duration, 0);
              return (
                <div key={s.id} style={{ 
                  background: 'rgba(0,0,0,0.15)', 
                  border: `1px solid ${s.color}`,
                  borderRadius: '8px',
                  padding: '4px 8px', 
                  fontSize: '0.68rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap'
                }}>
                  {s.name}: <span style={{ fontFamily: 'var(--font-pixel)', color: s.color }}>{formatTime(todayDuration)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. HERO STATS RPG WORKOUT */}
        <div className="card" onClick={() => onSwitchTab('workout')} style={{ cursor: 'pointer', margin: 0 }}>
          <div className="card-title-retro" style={{ color: 'var(--color-study)' }}>
            <Dumbbell size={16} /> STATUS HERO RPG
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              background: 'rgba(146, 176, 151, 0.1)', 
              border: '1px solid var(--color-study)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-study)',
              flexShrink: 0
            }}>
              <Dumbbell size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex-row-between" style={{ marginBottom: '2px', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 'bold' }}>LV.{rpgLevel}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {rpgXp}/{xpNeeded}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div style={{ width: `${xpPercent}%`, height: '100%', background: 'var(--color-study)', borderRadius: '3px' }}></div>
              </div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Bos Dikalahkan: <strong>{rpgBossesDefeated}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 💝 COZY GRATITUDE JOURNAL (BUKU HARIAN REFLEKSI) */}
      <div className="card" style={{ margin: '12px 16px', background: 'linear-gradient(to bottom right, #1a1512, #100d0b)', borderColor: 'rgba(238, 205, 163, 0.15)' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-debt)', display: 'flex', alignItems: 'center', gap: '6px', borderBottomColor: 'rgba(238, 205, 163, 0.15)' }}>
          <Heart size={16} style={{ color: 'var(--color-expense)' }} /> BUKU HARIAN REFLEKSI (GRATITUDE)
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Tuliskan 3 hal yang Anda syukuri hari ini untuk menjaga kesehatan mental positif. Dapatkan +5 Koin Cozy!
        </p>

        {hasWrittenJournalToday ? (
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '12px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-study)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Jurnal Syukur Hari Ini Telah Dicatat!
            </p>
            <ol style={{ paddingLeft: '18px', margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {todayJournalEntry.entries.map((item, idx) => (
                <li key={idx} style={{ fontStyle: 'italic' }}>"{item}"</li>
              ))}
            </ol>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '15px', textAlign: 'center' }}>1.</span>
              <input 
                type="text" 
                placeholder="Hal pertama yang disyukuri..." 
                value={gratitude1} 
                onChange={(e) => setGratitude1(e.target.value)}
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', fontSize: '0.75rem', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '15px', textAlign: 'center' }}>2.</span>
              <input 
                type="text" 
                placeholder="Hal kedua yang disyukuri..." 
                value={gratitude2} 
                onChange={(e) => setGratitude2(e.target.value)}
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', fontSize: '0.75rem', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '15px', textAlign: 'center' }}>3.</span>
              <input 
                type="text" 
                placeholder="Hal ketiga yang disyukuri..." 
                value={gratitude3} 
                onChange={(e) => setGratitude3(e.target.value)}
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', fontSize: '0.75rem', color: 'var(--text-primary)' }}
              />
            </div>

            <button 
              className="btn btn-study" 
              style={{ width: '100%', marginTop: '6px', fontSize: '0.72rem', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => {
                if (!gratitude1.trim() || !gratitude2.trim() || !gratitude3.trim()) {
                  alert("Harap isi ketiga hal yang Anda syukuri ya! ❤️");
                  return;
                }
                saveGratitudeEntry(gratitude1, gratitude2, gratitude3);
                setGratitude1('');
                setGratitude2('');
                setGratitude3('');
              }}
            >
              <Heart size={12} /> Simpan Refleksi & Klaim +5 Koin
            </button>
          </div>
        )}
      </div>

      {/* 📜 PAPAN MISI HARIAN COZY CAFE (VERSI IKON GAME-LIKE) */}
      <div className="card">
        <div className="card-title-retro" style={{ color: 'var(--color-study)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Scroll size={16} /> PAPAN MISI HARIAN COZY CAFE
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Klik ikon misi harian di bawah untuk melihat detail, klaim reward, atau langsung mengakses fiturnya!
        </p>

        {/* Baris Ikon Quest Horizontal */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '10px 0',
          borderBottom: '1px dashed var(--border-color)',
          marginBottom: '12px'
        }}>
          {dailyQuests.map((quest, idx) => {
            const meta = getQuestMeta(quest.id);
            const isSelected = activeQuestId === quest.id;
            
            // Tentukan warna border dan status
            let borderStyle = '1px solid var(--border-color)';
            let glowColor = 'transparent';
            
            if (quest.claimed) {
              borderStyle = '2px solid var(--color-study)';
            } else if (quest.completed) {
              borderStyle = '2px solid #eab308'; // Amber glow
              glowColor = 'rgba(234, 179, 8, 0.2)';
            } else if (quest.current > 0) {
              borderStyle = '1px solid var(--color-primary)';
            }

            if (isSelected) {
              borderStyle = quest.completed && !quest.claimed 
                ? '2px solid #eab308' 
                : `2px solid var(--color-study)`;
              glowColor = quest.completed && !quest.claimed 
                ? 'rgba(234, 179, 8, 0.35)' 
                : 'rgba(146, 176, 151, 0.25)';
            }

            return (
              <div 
                key={quest.id}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveQuestId(quest.id)}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: isSelected ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
                    border: borderStyle,
                    boxShadow: isSelected ? `0 0 10px ${glowColor}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.08)' : 'none'
                  }}
                >
                  {/* Badge notifikasi jika siap diklaim */}
                  {quest.completed && !quest.claimed && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      border: '1px solid var(--bg-card)',
                      boxShadow: '0 0 5px rgba(239,68,68,0.8)'
                    }} className="animate-pulse"></span>
                  )}
                  {/* Overlay checkmark jika sudah diklaim */}
                  {quest.claimed && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      background: 'var(--color-study)',
                      color: 'var(--bg-dark)',
                      borderRadius: '50%',
                      width: '14px',
                      height: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      border: '1px solid var(--bg-card)'
                    }}>✓</span>
                  )}
                  {meta.icon}
                </button>
                <span style={{ 
                  fontSize: '0.58rem', 
                  fontFamily: 'var(--font-pixel)', 
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' 
                }}>
                  {quest.id === 'quest_water' 
                    ? `${Math.round(quest.current/100)}/${Math.round(quest.target/100)}` 
                    : `${quest.current}/${quest.target}`
                  }
                </span>
              </div>
            );
          })}
        </div>

        {/* Panel Detail Quest Terpilih */}
        {(() => {
          const selectedQuest = dailyQuests.find(q => q.id === activeQuestId) || dailyQuests[0];
          if (!selectedQuest) return null;
          const meta = getQuestMeta(selectedQuest.id);
          const progressPct = Math.min(100, (selectedQuest.current / selectedQuest.target) * 100);
          const canNavigate = meta.tab !== 'home';

          return (
            <div style={{
              background: 'rgba(0,0,0,0.1)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px',
              animation: 'cozy-fade-in 0.25s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {meta.icon}
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {selectedQuest.text}
                  </span>
                </div>
                {selectedQuest.claimed ? (
                  <span className="badge badge-study" style={{ fontSize: '0.62rem', flexShrink: 0 }}>✓ KLAIMED</span>
                ) : selectedQuest.completed ? (
                  <span className="badge" style={{ background: '#eab308', color: 'var(--bg-dark)', fontSize: '0.62rem', fontWeight: 'bold', flexShrink: 0 }}>SIAP KLAIM</span>
                ) : (
                  <span className="badge badge-study" style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', flexShrink: 0 }}>PROGRES</span>
                )}
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '10px' }}>
                <div className="flex-row-between" style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                  <span>PROGRES</span>
                  <span>{selectedQuest.current} / {selectedQuest.target} {selectedQuest.id === 'quest_water' ? 'ml' : ''}</span>
                </div>
                <div className="cozy-progress-container" style={{ height: '6px', marginTop: '4px' }}>
                  <div className="cozy-progress-bar" style={{ 
                    width: `${progressPct}%`,
                    background: selectedQuest.completed ? 'var(--color-study)' : 'var(--color-primary)' 
                  }}></div>
                </div>
              </div>

              {/* Hadiah & Tombol Aksi */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>HADIAH MISI</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--color-study)', fontFamily: 'var(--font-pixel)' }}>
                    🪙 +{selectedQuest.rewardCoins} Cozy | ⚡ +{selectedQuest.rewardXp} XP
                  </span>
                </div>

                {selectedQuest.completed && !selectedQuest.claimed ? (
                  <button
                    type="button"
                    className="btn btn-study"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(234, 179, 8, 0.2)',
                      background: '#eab308',
                      borderColor: '#eab308',
                      color: 'var(--bg-dark)'
                    }}
                    onClick={() => claimQuestReward(selectedQuest.id)}
                  >
                    KLAIM HADIAH
                  </button>
                ) : !selectedQuest.completed && canNavigate ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSwitchTab(meta.tab)}
                  >
                    JALANKAN MISI ➔
                  </button>
                ) : null}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 🏆 PIALA PRESTASI RETRO CAFE */}
      <div className="card">
        <div className="card-title-retro" style={{ color: 'var(--color-study)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={16} /> PIALA PRESTASI RETRO CAFE
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Pencapaian belajar, latihan, dan pengelolaan kas keuangan Anda.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {achievements.map((ach, idx) => (
            <div key={idx} style={{
              background: ach.unlocked ? 'rgba(146, 176, 151, 0.08)' : 'rgba(0,0,0,0.15)',
              border: ach.unlocked ? '1px solid var(--color-study)' : '1px dashed var(--border-color)',
              borderRadius: '10px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: ach.unlocked ? 1 : 0.45,
              transition: 'all 0.2s ease'
            }}>
              <div style={{ 
                color: ach.unlocked ? 'var(--color-study)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: ach.unlocked ? 'rgba(146, 176, 151, 0.15)' : 'rgba(255,255,255,0.03)',
                padding: '6px',
                borderRadius: '50%',
                border: ach.unlocked ? '1px solid var(--color-study)' : '1px solid var(--border-color)',
                flexShrink: 0
              }}>
                {ach.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: '0.74rem', color: ach.unlocked ? 'var(--text-primary)' : 'var(--text-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {ach.title}
                </strong>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {ach.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. KEUANGAN SUMMARY */}
      <div className="card" onClick={() => onSwitchTab('finance')} style={{ cursor: 'pointer' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-debt)' }}>
          <Wallet size={16} /> SALDO KAS & DOMPET DIGITAL
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>TOTAL SALDO GABUNGAN</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-pixel)', lineHeight: '1.1' }}>
              {formatRupiah(totalAssets)}
            </p>
          </div>
          {totalDebts > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-expense)' }}>HUTANG AKTIF</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-expense)', fontFamily: 'var(--font-pixel)', lineHeight: '1.1' }}>
                {formatRupiah(totalDebts)}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WalletLogo type="gopay" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>GoPay</p>
              <strong style={{ fontSize: '0.85rem', fontFamily: 'var(--font-pixel)' }}>{formatRupiah(wallets.gopay)}</strong>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WalletLogo type="spay" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ShopeePay</p>
              <strong style={{ fontSize: '0.85rem', fontFamily: 'var(--font-pixel)' }}>{formatRupiah(wallets.spay)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL POPUP TOKO DEKORASI */}
      {showShopModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '380px',
            margin: 0,
            background: 'linear-gradient(to bottom right, #1c1815, #120f0d)',
            border: '2px solid var(--border-color)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '85vh',
            overflowY: 'auto',
            animation: 'cozy-fade-in 0.2s ease-out'
          }}>
            <div className="flex-row-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 'bold', fontFamily: 'var(--font-pixel)', color: 'var(--color-study)' }}>
                <Store size={16} style={{ display: 'inline', marginRight: '4px' }} /> COZY DECOR SHOP
              </span>
              <button 
                className="btn btn-outline" 
                style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                onClick={() => {
                  setShowShopModal(false);
                  try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.08);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.15);
                  } catch(e){}
                }}
              >
                TUTUP [X]
              </button>
            </div>

            <div className="flex-row-between" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>SALDO KOIN COZY:</span>
              <span style={{ fontFamily: 'var(--font-pixel)', color: 'var(--color-study)', fontSize: '1.05rem' }}>
                <Coins size={16} style={{ display: 'inline', marginRight: '4px', color: 'var(--color-study)', verticalAlign: 'middle' }} /> {coins} C
              </span>
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
              Belanjakan koin Cozy hasil belajar & workout Anda untuk menghias kafe virtual barista kucing Anda!
            </p>

            {/* TAB SELECTOR TOKO */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '8px', gap: '4px' }}>
              <button 
                type="button"
                className={`btn ${shopTab === 'decor' ? 'btn-study' : 'btn-outline'}`}
                style={{ flex: 1, padding: '6px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                onClick={() => setShopTab('decor')}
              >
                🏠 DEKORASI
              </button>
              <button 
                type="button"
                className={`btn ${shopTab === 'food' ? 'btn-study' : 'btn-outline'}`}
                style={{ flex: 1, padding: '6px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                onClick={() => setShopTab('food')}
              >
                🐟 CEMILAN KUCING
              </button>
            </div>

            {shopTab === 'decor' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                {DECOR_SHOP.map((decor, idx) => {
                  const hasPurchased = rpgInventory.some(item => item.name === decor.name);
                  return (
                    <div key={idx} className="flex-row-between" style={{ 
                      background: 'rgba(0,0,0,0.15)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '10px', 
                      padding: '8px 12px',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.6rem' }}>{decor.symbol}</span>
                        <div>
                          <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{decor.name}</strong>
                          <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{decor.desc}</p>
                        </div>
                      </div>
                      
                      <button
                        className="btn"
                        style={{ 
                          padding: '6px 10px', 
                          fontSize: '0.68rem', 
                          borderRadius: '6px',
                          background: hasPurchased ? 'rgba(255,255,255,0.05)' : 'var(--color-study)',
                          color: hasPurchased ? 'var(--text-muted)' : 'var(--bg-dark)',
                          borderColor: hasPurchased ? 'var(--border-color)' : 'var(--color-study)',
                          cursor: hasPurchased ? 'default' : 'pointer'
                        }}
                        disabled={hasPurchased}
                        onClick={() => {
                          if (coins < decor.cost) {
                            alert("Koin Cozy Anda tidak cukup! Terus belajar atau workout untuk mengumpulkan koin! ☕💪");
                            return;
                          }
                          const success = buyItem(decor.name, decor.cost, 'decor', { symbol: decor.symbol });
                          if (success !== false) {
                            alert(`Berhasil membeli ${decor.name}! Dekorasi telah dipasang di cafe kucing Anda! 🎉`);
                          }
                        }}
                      >
                        {hasPurchased ? 'DIPASANG' : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShoppingCart size={11} /> {decor.cost} C
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                {FOOD_SHOP.map((food, idx) => (
                  <div key={idx} className="flex-row-between" style={{ 
                    background: 'rgba(0,0,0,0.15)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '10px', 
                    padding: '8px 12px',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.6rem' }}>{food.symbol}</span>
                      <div>
                        <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{food.name}</strong>
                        <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{food.desc}</p>
                      </div>
                    </div>
                    
                    <button
                      className="btn btn-study"
                      style={{ 
                        padding: '6px 10px', 
                        fontSize: '0.68rem', 
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (coins < food.cost) {
                          alert("Koin Cozy Anda tidak cukup! ☕");
                          return;
                        }
                        const success = interactWithPet(food.type, food.cost);
                        if (success !== false) {
                          alert(`Yummy! Anda menyuapi ${pet.name} dengan ${food.name}! Mood kucing berubah menjadi ${food.mood.toUpperCase()}! 🐈✨`);
                          try {
                            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                            const oscillator = audioCtx.createOscillator();
                            const gainNode = audioCtx.createGain();
                            oscillator.type = 'triangle';
                            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
                            oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
                            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                            gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                            oscillator.connect(gainNode);
                            gainNode.connect(audioCtx.destination);
                            oscillator.start();
                            oscillator.stop(audioCtx.currentTime + 0.3);
                          } catch(e){}
                        }
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShoppingCart size={11} /> {food.cost} C
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      <style>{`
        @keyframes cozy-wiggle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-3deg) translateY(-2px); }
        }
        @keyframes cozy-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes cozy-fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
