import React, { useState, useEffect, useRef } from 'react';
import { Timer, PlusCircle, Calendar, BarChart2, BookOpen, Clock, Pause, Square, Trash2, Coffee, Volume2, VolumeX, Moon } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { getLocalDateString } from '../utils/dateUtils';

// --- MATRIX KUCING PIXEL UNTUK FOCUS MODE (BISA EVOLUSI) ---
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

// --- SUB-KOMPONEN GRAFIK TREN BELAJAR ---
function StudyTrendChart({ studyHistory }) {
  // Kelompokkan total durasi belajar (dalam menit) per tanggal
  const dailyDurations = {};
  studyHistory.forEach(h => {
    if (h.date) {
      dailyDurations[h.date] = (dailyDurations[h.date] || 0) + h.duration;
    }
  });

  const sortedDates = Object.keys(dailyDurations).sort((a, b) => a.localeCompare(b));

  if (sortedDates.length < 2) {
    return (
      <div className="card" style={{ margin: '0', textAlign: 'center', padding: '24px 12px' }}>
        <Clock style={{ width: '32px', height: '32px', color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Tren Waktu Belajar</h3>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '240px', margin: '4px auto 0 auto', lineHeight: '1.3' }}>
          Mulai belajar di minimal 2 hari yang berbeda untuk memproyeksikan grafik tren kenaikan/penurunan waktu belajar harian Anda.
        </p>
      </div>
    );
  }

  const trendData = sortedDates.map(date => ({
    date,
    minutes: Math.round(dailyDurations[date] / 60)
  }));

  // Batasi maksimal 7 titik data terakhir agar grafik tidak terlalu padat di HP
  const displayData = trendData.slice(-7);

  // SVG Dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const minutesList = displayData.map(d => d.minutes);
  const minM = Math.min(...minutesList);
  const maxM = Math.max(...minutesList);
  
  const yMin = Math.max(0, minM - 10);
  const yMax = maxM + 10;
  const yRange = yMax - yMin || 1;

  const points = displayData.map((item, idx) => {
    const x = paddingLeft + (idx / (displayData.length - 1 || 1)) * chartWidth;
    const y = paddingTop + (1 - (item.minutes - yMin) / yRange) * chartHeight;
    return { x, y, minutes: item.minutes, date: item.date };
  });

  let linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
  let areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  // Hitung tren persentase kenaikan/penurunan (titik terakhir vs sebelumnya)
  const latest = minutesList[minutesList.length - 1];
  const previous = minutesList[minutesList.length - 2];
  const diff = latest - previous;
  const pct = previous > 0 ? Math.round((diff / previous) * 100) : 0;
  const isUp = diff >= 0;

  return (
    <div className="card" style={{ margin: '0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="flex-row-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={16} style={{ color: 'var(--color-study)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
            TREN PRODUKTIVITAS BELAJAR
          </span>
        </div>
        <span className={`badge ${isUp ? 'badge-study' : 'badge-expense'}`} style={{ fontSize: '0.68rem', padding: '2px 8px', fontFamily: 'var(--font-pixel)' }}>
          {isUp ? `📈 +${Math.abs(pct)}%` : `📉 -${Math.abs(pct)}%`}
        </span>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
        Sesi belajar terakhir mencatat durasi total <strong style={{ color: 'var(--text-primary)' }}>{latest} menit</strong>, mengalami {isUp ? 'kenaikan' : 'penurunan'} dibandingkan sesi sebelumnya yaitu <strong style={{ color: 'var(--text-muted)' }}>{previous} menit</strong>.
      </p>

      {/* SVG Line Chart */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', minWidth: '300px', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-study)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-study)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const val = yMax - ratio * yRange;
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} style={{ stroke: 'rgba(255,255,255,0.04)' }} strokeWidth="1" strokeDasharray="4 4" />
                <text x={paddingLeft - 8} y={y + 3} style={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', fontSize: '10px' }} textAnchor="end">
                  {Math.round(val)}m
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          <path d={areaPath} fill="url(#studyGradient)" />

          {/* Main Line */}
          <path d={linePath} fill="none" style={{ stroke: 'var(--color-study)' }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots & Labels */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="5" style={{ fill: 'var(--color-study)', fillOpacity: 0.15 }} />
              <circle cx={p.x} cy={p.y} r="3" style={{ fill: 'var(--color-study)', stroke: 'var(--bg-card)' }} strokeWidth="1.5" />
              
              {/* Value label */}
              <text x={p.x} y={p.y - 7} style={{ fill: 'var(--text-primary)', fontFamily: 'var(--font-pixel)', fontSize: '10px', fontWeight: 'bold' }} textAnchor="middle">
                {p.minutes}m
              </text>

              {/* Date label */}
              <text x={p.x} y={svgHeight - paddingBottom + 14} style={{ fill: 'var(--text-muted)', fontSize: '8px', fontWeight: 'bold' }} textAnchor="middle">
                {p.date.substring(8, 10)}/{p.date.substring(5, 7)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function BelajarTab() {
  const {
    subjects,
    studyHistory = [],
    selectedSubjectId,
    timerRunning,
    timerType,
    pomoSession,
    pomoTimeLeft,
    addSubject,
    deleteSubject,
    setSelectedSubjectId,
    setTimerRunning,
    setTimerType,
    setPomoSession,
    setPomoTimeLeft,
    incrementSubjectTime,
    addCoins,
    updateQuestProgress
  } = useDashboardStore();

  const activeSubj = (subjects || []).find(s => s.id === selectedSubjectId) || (subjects || [])[0] || { id: 999, name: 'Fokus', color: '#92b097', totalTime: 0 };

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#92b097');
  const timerRef = useRef(null);

  // Refs & state untuk soundscape ambient cafe prosedural, mixer, dan lofi radio
  const audioCtxRef = useRef(null);
  const rainNodeRef = useRef(null);
  const rainGainRef = useRef(null);
  const chatterNodeRef = useRef(null);
  const chatterGainRef = useRef(null);
  const chimeIntervalRef = useRef(null);
  
  const [ambientActive, setAmbientActive] = useState(false);
  const [lofiPlaying, setLofiPlaying] = useState(false);
  const [lofiVolume, setLofiVolume] = useState(0.5);
  const [volumeRain, setVolumeRain] = useState(0.4);
  const [volumeChimes, setVolumeChimes] = useState(0.3);
  const [volumeChatter, setVolumeChatter] = useState(0.2);

  const lofiAudioRef = useRef(null);

  // Sync chimes volume value with a ref to bypass stale closure in intervals
  const volumeChimesRef = useRef(volumeChimes);
  useEffect(() => {
    volumeChimesRef.current = volumeChimes;
  }, [volumeChimes]);

  // Efek untuk menyelaraskan volume audio rain secara real-time
  useEffect(() => {
    if (rainGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      rainGainRef.current.gain.linearRampToValueAtTime(volumeRain * 0.16, now + 0.1);
    }
  }, [volumeRain]);

  // Efek untuk menyelaraskan volume audio chatter secara real-time
  useEffect(() => {
    if (chatterGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      chatterGainRef.current.gain.linearRampToValueAtTime(volumeChatter * 0.12, now + 0.1);
    }
  }, [volumeChatter]);

  // Efek untuk menyelaraskan volume radio lofi
  useEffect(() => {
    if (lofiAudioRef.current) {
      lofiAudioRef.current.volume = lofiVolume;
    }
  }, [lofiVolume]);

  const toggleLofiRadio = () => {
    if (!lofiAudioRef.current) return;
    if (lofiPlaying) {
      lofiAudioRef.current.pause();
      setLofiPlaying(false);
    } else {
      lofiAudioRef.current.play()
        .then(() => setLofiPlaying(true))
        .catch(err => {
          console.error("Gagal memutar radio Lofi:", err);
          alert("Gagal memutar stasiun radio Lofi. Pastikan koneksi internet Anda aktif! 📻");
        });
    }
  };

  const startAmbient = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const bufferSize = 2 * audioCtx.sampleRate;

      // 1. GENERATE BROWN NOISE (Derau Hujan)
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain scaling
      }

      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, audioCtx.currentTime);

      const rainGain = audioCtx.createGain();
      rainGain.gain.setValueAtTime(volumeRain * 0.16, audioCtx.currentTime);

      noiseSource.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(audioCtx.destination);
      
      noiseSource.start();
      rainNodeRef.current = noiseSource;
      rainGainRef.current = rainGain;

      // 1.5. GENERATE COZY CHATTER NOISE (Obrolan Kafe Samar)
      const chatterBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const chatterOutput = chatterBuffer.getChannelData(0);
      let chatterLastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        chatterOutput[i] = (chatterLastOut + (0.05 * white)) / 1.05;
        chatterLastOut = chatterOutput[i];
        chatterOutput[i] *= 2.0;
      }
      
      const chatterSource = audioCtx.createBufferSource();
      chatterSource.buffer = chatterBuffer;
      chatterSource.loop = true;

      const chatterFilter = audioCtx.createBiquadFilter();
      chatterFilter.type = 'bandpass';
      chatterFilter.frequency.setValueAtTime(250, audioCtx.currentTime);
      chatterFilter.Q.setValueAtTime(1.0, audioCtx.currentTime);

      const chatterGain = audioCtx.createGain();
      chatterGain.gain.setValueAtTime(volumeChatter * 0.12, audioCtx.currentTime);

      chatterSource.connect(chatterFilter);
      chatterFilter.connect(chatterGain);
      chatterGain.connect(audioCtx.destination);

      chatterSource.start();
      chatterNodeRef.current = chatterSource;
      chatterGainRef.current = chatterGain;

      // 2. RANDOM CAFE CHIMES (Denting gelas/cangkir acak)
      const playRandomChime = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const now = audioCtxRef.current.currentTime;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        const freqList = [1200, 1500, 1800, 2200];
        const randomFreq = freqList[Math.floor(Math.random() * freqList.length)];
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(randomFreq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.015 * volumeChimesRef.current, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      };

      const scheduleNextChime = () => {
        const nextTime = 4000 + Math.random() * 6000;
        chimeIntervalRef.current = setTimeout(() => {
          playRandomChime();
          scheduleNextChime();
        }, nextTime);
      };
      scheduleNextChime();

    } catch (e) {
      console.error("Gagal menginisialisasi audio ambient prosedural:", e);
    }
  };

  const stopAmbient = () => {
    if (rainNodeRef.current) {
      try { rainNodeRef.current.stop(); } catch(e){}
      rainNodeRef.current = null;
    }
    if (chatterNodeRef.current) {
      try { chatterNodeRef.current.stop(); } catch(e){}
      chatterNodeRef.current = null;
    }
    if (chimeIntervalRef.current) {
      clearTimeout(chimeIntervalRef.current);
      chimeIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch(e){}
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAmbient();
      if (lofiAudioRef.current) {
        try { lofiAudioRef.current.pause(); } catch(e){}
      }
    };
  }, []);

  // Format waktu ke HH:MM:SS
  const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format ke durasi ringkas (Jam dan Menit)
  const formatHoursMinutes = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs > 0) {
      return `${hrs} jam ${mins} menit`;
    }
    return `${mins} menit`;
  };

  // Format ke MM:SS (untuk Pomodoro)
  const formatMMSS = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio Synth untuk alarm/chime
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

  const playCafeBell = () => {
    playCozyChime(523.25, 0.3);
    setTimeout(() => playCozyChime(659.25, 0.3), 120);
    setTimeout(() => playCozyChime(783.99, 0.4), 240);
  };

  // Logic Timer Belajar
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        if (timerType === 'stopwatch') {
          // Tambahkan waktu belajar ke subjek aktif
          incrementSubjectTime(selectedSubjectId, 1);
          // Tambah koin Cozy setiap 1 menit (60 detik)
          const currentSubject = activeSubj;
          if (currentSubject && (currentSubject.totalTime + 1) % 60 === 0) {
            addCoins(1);
            playCozyChime(587.33, 0.15); // Chime koin
          }
        } else {
          // Pomodoro
          setPomoTimeLeft(pomoTimeLeft - 1);
          if (pomoTimeLeft <= 1) {
            playCafeBell();
            if (pomoSession === 'study') {
              alert("SESI FOKUS SELESAI! SAATNYA ISTIRAHAT CAFE 5 MENIT ☕");
              setPomoSession('break');
              setPomoTimeLeft(5 * 60);
              // Tambahkan 25 menit (1500 detik) belajar ke subjek aktif
              incrementSubjectTime(selectedSubjectId, 25 * 60);
              addCoins(25); // Bonus Pomodoro koin
              updateQuestProgress('quest_study', 1);
            } else {
              alert("WAKTU ISTIRAHAT SELESAI! MARI KEMBALI FOKUS BELAJAR 🚀");
              setPomoSession('study');
              setPomoTimeLeft(25 * 60);
            }
          }
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerRunning, timerType, selectedSubjectId, pomoTimeLeft, pomoSession, subjects]);

  const handleAddSubjectSubmit = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    addSubject(newSubjectName, newSubjectColor);
    setNewSubjectName('');
    playCozyChime(523.25, 0.1);
  };

  // --- LOGIC STATISTIK & RIWAYAT ---
  const currentMonthStr = getLocalDateString().substring(0, 7); // Format "YYYY-MM"
  
  // Filter history khusus bulan ini
  const thisMonthHistory = studyHistory.filter(h => h.date && h.date.startsWith(currentMonthStr));
  
  // Hitung total jam belajar bulan ini
  const totalSecsThisMonth = thisMonthHistory.reduce((sum, h) => sum + h.duration, 0);
  const totalHrsThisMonth = (totalSecsThisMonth / 3600).toFixed(1);

  // Jam belajar per subjek khusus bulan ini
  const getSubjectTimeThisMonth = (subjectId) => {
    return thisMonthHistory
      .filter(h => h.subjectId === subjectId)
      .reduce((sum, h) => sum + h.duration, 0);
  };

  // Kelompokkan riwayat belajar berdasarkan tanggal (tanggal terbaru di atas)
  const getGroupedHistory = () => {
    const groups = {};
    thisMonthHistory.forEach(h => {
      if (!groups[h.date]) {
        groups[h.date] = [];
      }
      groups[h.date].push(h);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };
  const groupedHistory = getGroupedHistory();

  // Dapatkan nama bulan Indonesia
  const getIndonesianMonthName = () => {
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return monthNames[new Date().getMonth()];
  };

  // --- LAYOUT ALTERNATIF FOKUS MODE LAYAR PENUH ---
  if (timerRunning) {
    const todayStr = getLocalDateString();
    
    // Hitung level evolusi kucing berdasarkan total jam belajar global
    const totalStudyTime = subjects.reduce((sum, s) => sum + s.totalTime, 0);
    const totalHours = totalStudyTime / 3600;
    
    const getPetLevel = () => {
      if (totalHours < 1) return 1;
      if (totalHours < 5) return 2;
      if (totalHours < 12) return 3;
      return 4;
    };
    
    const petLevel = getPetLevel();
    
    const getPetMatrix = () => {
      switch (petLevel) {
        case 1: return CAT_STAGE_1;
        case 2: return CAT_STAGE_2;
        case 3: return CAT_STAGE_3;
        default: return CAT_STAGE_4;
      }
    };
    
    const petMatrix = getPetMatrix();

    // Durasi belajar subjek ini khusus HARI INI
    const todaySubjDuration = studyHistory
      .filter(h => h.date === todayStr && h.subjectId === selectedSubjectId)
      .reduce((sum, h) => sum + h.duration, 0);
      
    // Total belajar seluruh subjek khusus HARI INI
    const totalStudyTimeToday = studyHistory
      .filter(h => h.date === todayStr)
      .reduce((sum, h) => sum + h.duration, 0);

    return (
      <div className="focus-session-view" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '82vh',
        gap: '20px',
        padding: '24px 16px',
        background: 'radial-gradient(circle, #211c18 0%, #0c0a09 100%)',
        borderRadius: '16px',
        color: 'var(--text-primary)',
        animation: 'cozy-fade-in 0.4s ease'
      }}>
        {/* Kucing Barista Piksel Evolutif Melingkar Nafas */}
        <div style={{ 
          width: '130px', 
          height: '130px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          border: `2px solid ${activeSubj?.color || 'var(--border-color)'}`,
          borderRadius: '24px',
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.5), inset 0 4px 8px rgba(0,0,0,0.5)`,
          animation: 'cozy-breathe 2.5s infinite step-end'
        }}>
          <PixelCatRenderer matrix={petMatrix} size={110} />
        </div>

        {/* Informasi Fokus & Subjek */}
        <div style={{ textAlign: 'center' }}>
          <span className="badge" style={{ 
            background: activeSubj?.color || 'var(--color-study)', 
            color: 'var(--bg-dark)', 
            fontSize: '0.74rem',
            padding: '4px 12px',
            borderRadius: '8px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            <Coffee size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> SEDANG FOKUS: {(activeSubj?.name || '').toUpperCase()}
          </span>
          
          <h2 style={{ 
            fontSize: '3.6rem', 
            fontFamily: 'var(--font-pixel)', 
            color: activeSubj?.color || 'var(--text-primary)',
            marginTop: '12px',
            lineHeight: 1,
            letterSpacing: '1px',
            textShadow: `0 4px 12px rgba(0,0,0,0.5)`
          }}>
            {timerType === 'stopwatch' 
              ? formatTime(activeSubj?.totalTime || 0)
              : formatMMSS(pomoTimeLeft)
            }
          </h2>
          
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {timerType === 'stopwatch' ? 'stopwatch produktivitas berjalan' : (pomoSession === 'study' ? 'sesi fokus belajar' : 'waktu istirahat')}
          </p>
        </div>

        {/* Statistik Belajar Hari Ini */}
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '16px', 
          padding: '12px 18px',
          width: '100%',
          maxWidth: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div className="flex-row-between" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span>Belajar Subjek Ini (Hari Ini):</span>
            <strong style={{ color: activeSubj?.color }}>{formatHoursMinutes(todaySubjDuration)}</strong>
          </div>
          <div className="flex-row-between" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '6px', marginTop: '2px' }}>
            <span>Total Belajar Hari Ini:</span>
            <strong style={{ color: 'var(--color-study)' }}>{formatHoursMinutes(totalStudyTimeToday)}</strong>
          </div>
        </div>

        {/* Audio Ambient & Radio Lofi Controller (Focus Mode) */}
        <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn btn-outline"
            style={{ 
              width: '100%', 
              fontSize: '0.7rem', 
              padding: '8px 12px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              color: ambientActive ? 'var(--color-study)' : 'var(--text-secondary)',
              borderColor: ambientActive ? 'var(--color-study)' : 'var(--border-color)',
              background: ambientActive ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer'
            }}
            onClick={() => {
              if (ambientActive) {
                stopAmbient();
                setAmbientActive(false);
              } else {
                startAmbient();
                setAmbientActive(true);
              }
              playCozyChime(523.25, 0.1);
            }}
          >
            {ambientActive ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <VolumeX size={14} /> MATIKAN AMBIENT CAFE
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Volume2 size={14} /> SEDUH SUARA LATAR CAFE
              </span>
            )}
          </button>

          {/* Slider Mixer Prosedural (Hanya jika Ambient Aktif) */}
          {ambientActive && (
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '10px', 
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--text-secondary)' }}>
                <span>🌧️ Hujan: {Math.round(volumeRain * 100)}%</span>
                <span>🗣️ Kafe: {Math.round(volumeChatter * 100)}%</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={volumeRain} 
                  onChange={(e) => setVolumeRain(Number(e.target.value))}
                  style={{ flex: 1, height: '3px', background: 'var(--border-color)', borderRadius: '1.5px', outline: 'none' }}
                />
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={volumeChatter} 
                  onChange={(e) => setVolumeChatter(Number(e.target.value))}
                  style={{ flex: 1, height: '3px', background: 'var(--border-color)', borderRadius: '1.5px', outline: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Radio Lofi Card (Focus Mode) */}
          <div style={{ 
            background: 'linear-gradient(to bottom right, #130f1a, #0d0912)', 
            border: '1px solid rgba(168, 85, 247, 0.15)', 
            borderRadius: '10px', 
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <button
              className={`btn ${lofiPlaying ? 'btn-study' : 'btn-outline'}`}
              style={{ padding: '3px 8px', fontSize: '0.62rem', height: '22px', borderRadius: '4px', cursor: 'pointer' }}
              onClick={toggleLofiRadio}
            >
              {lofiPlaying ? 'PAUSE' : 'LOFI'}
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Moon size={10} style={{ color: 'var(--color-study)', flexShrink: 0 }} />
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={lofiVolume} 
                onChange={(e) => setLofiVolume(Number(e.target.value))}
                style={{ flex: 1, height: '3px', background: 'var(--border-color)', borderRadius: '1.5px', outline: 'none' }}
                disabled={!lofiPlaying}
              />
            </div>
          </div>
        </div>

        {/* Kontrol Sesi */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '280px', marginTop: '8px' }}>
          <button 
            className="btn" 
            style={{ 
              flex: 1, 
              background: 'var(--color-study)', 
              color: 'var(--bg-dark)', 
              borderColor: 'var(--color-study)',
              borderRadius: '12px',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onClick={() => {
              setTimerRunning(false);
              playCozyChime(392, 0.1);
            }}
          >
            <Pause size={14} /> JEDA
          </button>
          
          <button 
            className="btn" 
            style={{ 
              flex: 1, 
              background: 'var(--color-expense)', 
              color: 'var(--bg-dark)', 
              borderColor: 'var(--color-expense)',
              borderRadius: '12px',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onClick={() => {
              if (window.confirm("Apakah Anda ingin menyelesaikan sesi fokus ini?")) {
                setTimerRunning(false);
                if (timerType === 'pomodoro') {
                  const partialPomo = 25 * 60 - pomoTimeLeft;
                  if (partialPomo > 10) {
                    incrementSubjectTime(selectedSubjectId, partialPomo);
                    addCoins(Math.floor(partialPomo / 60));
                  }
                }
                playCozyChime(261.63, 0.3); // Chime selesai
              }
            }}
          >
            <Square size={14} /> SELESAI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 16px' }}>
      
      {/* 1. TIMER CARD */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-study)' }}>
          <Timer size={16} /> TIMER SEDUH FOKUS
        </div>

        {/* Stopwatch vs Pomodoro Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            className="btn" 
            style={{ 
              flex: 1, 
              background: timerType === 'stopwatch' ? 'var(--color-study)' : 'transparent',
              color: timerType === 'stopwatch' ? 'var(--bg-dark)' : 'var(--text-primary)',
              borderRadius: '10px',
              fontSize: '0.75rem',
              padding: '8px'
            }}
            onClick={() => {
              setTimerRunning(false);
              setTimerType('stopwatch');
            }}
          >
            STOPWATCH (YPT)
          </button>
          <button 
            className="btn" 
            style={{ 
              flex: 1, 
              background: timerType === 'pomodoro' ? 'var(--color-study)' : 'transparent',
              color: timerType === 'pomodoro' ? 'var(--bg-dark)' : 'var(--text-primary)',
              borderRadius: '10px',
              fontSize: '0.75rem',
              padding: '8px'
            }}
            onClick={() => {
              setTimerRunning(false);
              setTimerType('pomodoro');
              setPomoSession('study');
              setPomoTimeLeft(25 * 60);
            }}
          >
            POMODORO (25M)
          </button>
        </div>

        <div className="form-group">
          <label>SUBJEK BELAJAR AKTIF:</label>
          <select 
            className="form-control" 
            value={selectedSubjectId} 
            onChange={(e) => {
              setTimerRunning(false);
              setSelectedSubjectId(Number(e.target.value));
            }}
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Timer Box */}
        <div className="timer-container" style={{ margin: '14px 0' }}>
          <div className="timer-pixel-box" style={{ 
            borderColor: activeSubj?.color || 'var(--border-color)',
            width: '100%',
            maxWidth: '240px'
          }}>
            <div className="timer-time" style={{ 
              color: activeSubj?.color || 'var(--text-primary)',
              fontSize: '2.8rem'
            }}>
              {timerType === 'stopwatch' 
                ? formatTime(activeSubj?.totalTime || 0)
                : formatMMSS(pomoTimeLeft)
              }
            </div>
            <div className="timer-label" style={{ fontSize: '0.65rem' }}>
              {timerType === 'stopwatch' ? 'stopwatch' : (pomoSession === 'study' ? 'seduh fokus' : 'waktu istirahat')}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn" 
            style={{ 
              flex: 1, 
              background: timerRunning ? 'var(--color-expense)' : 'var(--color-study)',
              color: 'var(--bg-dark)',
              borderColor: timerRunning ? 'var(--color-expense)' : 'var(--color-study)',
              borderRadius: '12px',
              padding: '12px'
            }} 
            onClick={() => {
              setTimerRunning(!timerRunning);
              playCozyChime(523.25, 0.1);
            }}
          >
            {timerRunning ? 'PAUSE BELAJAR' : 'MULAI SEKARANG'}
          </button>
          {timerType === 'pomodoro' && (
            <button 
              className="btn btn-outline" 
              style={{ borderRadius: '12px', padding: '12px' }}
              onClick={() => {
                setTimerRunning(false);
                setPomoSession('study');
                setPomoTimeLeft(25 * 60);
                playCozyChime(392, 0.1);
              }}
            >
              RESET
            </button>
          )}
        </div>

        {/* Cozy Lofi Radio & Soundscape Mixer */}
        <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '14px', width: '100%', maxWidth: '280px' }}>
          <audio 
            ref={lofiAudioRef} 
            src="https://stream.zeno.fm/fkpx419yp78uv" 
            preload="none"
            crossOrigin="anonymous"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Tombol Utama Ambient */}
            <button
              className="btn btn-outline"
              style={{ 
                width: '100%', 
                fontSize: '0.72rem', 
                padding: '8px 12px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px',
                color: ambientActive ? 'var(--color-study)' : 'var(--text-secondary)',
                borderColor: ambientActive ? 'var(--color-study)' : 'var(--border-color)',
                background: ambientActive ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (ambientActive) {
                  stopAmbient();
                  setAmbientActive(false);
                } else {
                  startAmbient();
                  setAmbientActive(true);
                }
                playCozyChime(523.25, 0.1);
              }}
            >
              {ambientActive ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <VolumeX size={14} /> MATIKAN AMBIENT CAFE
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Volume2 size={14} /> SEDUH SUARA LATAR CAFE
                </span>
              )}
            </button>

            {/* Slider Soundscape Mixer (Hanya jika Ambient Aktif) */}
            {ambientActive && (
              <div style={{ 
                background: 'rgba(0,0,0,0.25)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '10px', 
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                animation: 'cozy-fade-in 0.2s ease-out'
              }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: 'var(--color-study)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ☕ Ambient Mixer
                </span>
                
                {/* Rain Volume */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                    <span>🌧️ Hujan</span>
                    <span>{Math.round(volumeRain * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05" 
                    value={volumeRain} 
                    onChange={(e) => setVolumeRain(Number(e.target.value))}
                    style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', outline: 'none' }}
                  />
                </div>

                {/* Chatter Volume */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                    <span>🗣️ Obrolan Kafe</span>
                    <span>{Math.round(volumeChatter * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05" 
                    value={volumeChatter} 
                    onChange={(e) => setVolumeChatter(Number(e.target.value))}
                    style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', outline: 'none' }}
                  />
                </div>

                {/* Chimes Volume */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                    <span>🛎️ Denting Cangkir</span>
                    <span>{Math.round(volumeChimes * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05" 
                    value={volumeChimes} 
                    onChange={(e) => setVolumeChimes(Number(e.target.value))}
                    style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* Lofi Radio Player */}
            <div style={{ 
              background: 'linear-gradient(to bottom right, #130f1a, #0d0912)', 
              border: '1px solid rgba(168, 85, 247, 0.15)', 
              borderRadius: '10px', 
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: 'var(--color-study)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                  <Moon size={10} /> Cozy Lofi Radio
                </span>
                {lofiPlaying && (
                  <span style={{ fontSize: '0.55rem', color: 'var(--color-income)', fontFamily: 'var(--font-pixel)', animation: 'cozy-breathe 1.5s infinite alternate' }}>
                    LIVE 📻
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <button
                  className={`btn ${lofiPlaying ? 'btn-study' : 'btn-outline'}`}
                  style={{ padding: '4px 8px', fontSize: '0.65rem', height: '24px', borderRadius: '5px', flexShrink: 0 }}
                  onClick={toggleLofiRadio}
                >
                  {lofiPlaying ? 'PAUSE' : 'PUTAR'}
                </button>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <input 
                    type="range" min="0" max="1" step="0.05" 
                    value={lofiVolume} 
                    onChange={(e) => setLofiVolume(Number(e.target.value))}
                    style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', outline: 'none' }}
                    disabled={!lofiPlaying}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TREN GRAFIK PRODUKTIVITAS BELAJAR */}
      <StudyTrendChart studyHistory={studyHistory} />

      {/* 3. DAFTAR SUBJEK BELAJAR (AKUMULASI GLOBAL) */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro">
          <BookOpen size={16} /> AKUMULASI WAKTU BELAJAR
        </div>
        <div className="cozy-flex-col" style={{ marginTop: '8px', gap: '8px' }}>
          {subjects.map(s => (
            <div key={s.id} className="flex-row-between" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{s.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <strong style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', color: s.color }}>
                  {formatTime(s.totalTime)}
                </strong>
                
                {subjects.length > 1 && (
                  <button 
                    className="btn"
                    style={{ 
                      padding: '4px', 
                      borderRadius: '6px', 
                      background: 'rgba(231,181,176,0.1)', 
                      color: 'var(--color-expense)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => {
                      if (window.confirm(`Apakah Anda yakin ingin menghapus subjek "${s.name}"?`)) {
                        deleteSubject(s.id);
                      }
                    }}
                    title="Hapus Subjek"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Subject */}
        <form onSubmit={handleAddSubjectSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Tambahkan subjek baru..." 
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              style={{ fontSize: '0.8rem', height: '36px' }}
            />
            <input 
              type="color" 
              style={{ width: '36px', height: '36px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'none', cursor: 'pointer', flexShrink: 0 }}
              value={newSubjectColor}
              onChange={(e) => setNewSubjectColor(e.target.value)}
            />
            <button type="submit" className="btn btn-study" style={{ padding: '0 12px', borderRadius: '10px', height: '36px' }}>
              <PlusCircle size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* 4. STATISTIK BULAN INI */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-debt)' }}>
          <BarChart2 size={16} /> STATISTIK BELAJAR: {getIndonesianMonthName().toUpperCase()}
        </div>

        <div style={{ textAlign: 'center', margin: '6px 0 16px 0' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TOTAL PRODUKTIVITAS BULAN INI:</span>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '2.4rem', color: 'var(--color-debt)', marginTop: '2px', lineHeight: '1' }}>
            {totalHrsThisMonth} <span style={{ fontSize: '1.2rem' }}>JAM</span>
          </h2>
        </div>

        <div className="cozy-flex-col" style={{ gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>KONTRIBUSI WAKTU PER SUBJEK:</span>
          
          {subjects.map(s => {
            const secsThisMonth = getSubjectTimeThisMonth(s.id);
            const ratio = totalSecsThisMonth > 0 ? (secsThisMonth / totalSecsThisMonth) * 100 : 0;
            
            return (
              <div key={s.id}>
                <div className="flex-row-between" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }}></span>
                    {s.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem' }}>
                    {formatHoursMinutes(secsThisMonth)} ({Math.round(ratio)}%)
                  </span>
                </div>
                <div className="cozy-progress-container" style={{ height: '8px' }}>
                  <div className="cozy-progress-bar" style={{ width: `${ratio}%`, background: s.color }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RIWAYAT BELAJAR HARIAN */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-balance)' }}>
          <Calendar size={16} /> LOG TIMELINE HARIAN
        </div>

        {groupedHistory.length === 0 ? (
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>
            Belum ada aktivitas belajar yang terekam di bulan ini. Hidupkan timer untuk mulai menyeduh fokus Anda! ☕
          </p>
        ) : (
          <div style={{ 
            position: 'relative', 
            borderLeft: '2px dashed var(--border-color)', 
            marginLeft: '12px', 
            paddingLeft: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '14px',
            marginTop: '8px'
          }}>
            {groupedHistory.map(([dateStr, items]) => {
              const dateObj = new Date(dateStr);
              const totalSecsDay = items.reduce((sum, item) => sum + item.duration, 0);

              return (
                <div key={dateStr} style={{ position: 'relative' }}>
                  
                  {/* Timeline Dot */}
                  <div style={{ 
                    position: 'absolute', 
                    left: '-28px', 
                    top: '4px', 
                    width: '14px', 
                    height: '14px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-card)', 
                    border: '2px solid var(--color-study)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-study)' }}></div>
                  </div>

                  {/* Day Container */}
                  <div style={{ 
                    background: 'rgba(0,0,0,0.15)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    padding: '10px 12px'
                  }}>
                    <div className="flex-row-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="badge badge-study" style={{ fontSize: '0.65rem', padding: '1px 6px', fontFamily: 'var(--font-pixel)' }}>
                        <Clock size={10} style={{ marginRight: '2px' }} /> {formatHoursMinutes(totalSecsDay)}
                      </span>
                    </div>

                    <div className="cozy-flex-col" style={{ gap: '4px' }}>
                      {items.map(item => (
                        <div key={item.id} className="flex-row-between" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: item.subjectColor }}></span>
                            {item.subjectName}
                          </span>
                          <span style={{ fontFamily: 'var(--font-pixel)', color: item.subjectColor }}>{formatTime(item.duration)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
