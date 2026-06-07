import { useState } from 'react';
import { 
  Play, Scale, Trophy, Zap, CheckCircle2, 
  Award, Activity, Edit3, Coins, Swords, Shield, Dumbbell, Coffee, Scroll, Flame
} from 'lucide-react';
import { findExerciseInProgression } from '../utils/progressionDb';
import { getLocalDateString } from '../utils/dateUtils';

export default function Dashboard({ 
  jadwal, 
  progressHistory, 
  mealHistory = [],
  onStartWorkout, 
  onReplaceJadwalExercise = () => {},
  connectionStatus,
  targetCalories,
  targetProtein,
  weight,
  setWeight,
  height,
  setHeight,
  lastPhysiqueUpdate,
  setLastPhysiqueUpdate,
  personalRecords = { pullup: 0, pushup: 0, dips: 0, lsit: 0, plank: 0, handstand: 0 },
  onUpdatePR,
  recoveryToday = null,
  onUpdateRecovery,
  rpgLevel = 1,
  rpgXp = 0,
  rpgCoins = 0,
  rpgBossesDefeated = 0,
  rpgBadges = [],
  rpgInventory = [],
  rpgEquipped = { weapon: null, armor: null, shield: null },
  dailyQuests = [],
  onBuyItem = () => {},
  onEquipItem = () => {},
  onClaimQuestReward = () => {}
}) {
  const [selectedDayOverride, setSelectedDayOverride] = useState(null);
  const [dashboardSubTab, setDashboardSubTab] = useState('workout'); // 'workout' | 'shop' | 'quests'
  
  // State untuk form input update BB/TB
  const [taskWeight, setTaskWeight] = useState(weight);
  const [taskHeight, setTaskHeight] = useState(height);
  const [taskSuccess, setTaskSuccess] = useState(false);

  // State baru untuk Recovery Tracker
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [sleepRating, setSleepRating] = useState(3);
  const [sorenessRating, setSorenessRating] = useState(3);
  const [energyRating, setEnergyRating] = useState(3);

  // State baru untuk PR Milestone
  const [showPRModal, setShowPRModal] = useState(false);
  const [editingPRKey, setEditingPRKey] = useState('pullup');
  const [editingPRValue, setEditingPRValue] = useState(0);

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    const score = Math.round(((sleepRating + (6 - sorenessRating) + energyRating) / 15) * 100);
    let status = 'sedang';
    let rekomendasi = 'Kondisi Cukup. Disarankan latihan dengan volume sedang, fokus pada teknik gerakan, atau deload.';
    
    if (score >= 80) {
      status = 'prima';
      rekomendasi = 'Kondisi Prima! Tubuh Anda siap untuk latihan intens atau memecahkan rekor pribadi (PR).';
    } else if (score < 50) {
      status = 'istirahat';
      rekomendasi = 'Wajib Istirahat (Rest Day). Otot & tendon membutuhkan pemulihan penuh untuk menghindari cedera.';
    }
    
    onUpdateRecovery({
      score,
      sleep: sleepRating,
      soreness: sorenessRating,
      energy: energyRating,
      status,
      rekomendasi
    });
    setShowRecoveryModal(false);
  };

  const handlePRSubmit = (e) => {
    e.preventDefault();
    onUpdatePR(editingPRKey, Number(editingPRValue));
    setShowPRModal(false);
  };

  const getPRLabel = (key) => {
    switch (key) {
      case 'pullup': return 'Pull-up (Repetisi)';
      case 'pushup': return 'Push-up (Repetisi)';
      case 'dips': return 'Dips (Repetisi)';
      case 'lsit': return 'L-Sit (Detik)';
      case 'plank': return 'Plank (Detik)';
      case 'handstand': return 'Handstand (Detik)';
      default: return key;
    }
  };

  const getIndonesianDay = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  };

  const currentDay = selectedDayOverride || getIndonesianDay();
  const workoutToday = jadwal.filter(item => item.Hari.toLowerCase() === currentDay.toLowerCase());
  const isRestDay = workoutToday.length === 0;

  const getTodayIntake = () => {
    const todayStr = getLocalDateString(new Date());
    const todayMeals = mealHistory.filter(meal => {
      const timestampVal = meal.timestamp || meal.Timestamp || meal.Tanggal || Date.now();
      const mealDateStr = getLocalDateString(timestampVal);
      return mealDateStr === todayStr;
    });
    
    const calories = todayMeals.reduce((acc, meal) => acc + (meal.calories || 0), 0);
    const protein = todayMeals.reduce((acc, meal) => acc + (meal.protein || 0), 0);
    
    return { calories, protein };
  };

  const { calories: todayCalories, protein: todayProtein } = getTodayIntake();
  const calPercent = Math.min(Math.round((todayCalories / targetCalories) * 100), 100);
  const protPercent = Math.min(Math.round((todayProtein / targetProtein) * 100), 100);
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

  const getBmiCategory = (bmiValue) => {
    const val = parseFloat(bmiValue);
    if (val < 18.5) return { text: "Sangat Kurus", color: "var(--color-expense)" };
    if (val < 25.0) return { text: "Normal", color: "var(--color-study)" };
    return { text: "Kelebihan Berat", color: "var(--color-debt)" };
  };
  const bmiCat = getBmiCategory(bmi);

  const handlePhysiqueSubmit = (e) => {
    e.preventDefault();
    setWeight(Number(taskWeight));
    setHeight(Number(taskHeight));
    setLastPhysiqueUpdate(new Date().toISOString());
    setTaskSuccess(true);
    setTimeout(() => setTaskSuccess(false), 3000);
  };

  // List Item Toko RPG
  const shopItems = [
    { id: "weapon_iron_sword", name: "Iron Sword", type: "weapon", cost: 60, damage: 15, defense: 0, desc: "Pedang besi barista. Menambah damage latihan ke bos sebesar +15%." },
    { id: "weapon_fire_claymore", name: "Fire Claymore", type: "weapon", cost: 130, damage: 35, defense: 0, desc: "Claymore api menyala. Menambah damage latihan ke bos sebesar +35%." },
    { id: "shield_wooden", name: "Wooden Shield", type: "shield", cost: 40, damage: 0, defense: 10, desc: "Perisai kayu ringan. Mengurangi damage yang diterima dari bos sebesar 10%." },
    { id: "shield_steel", name: "Steel Shield", type: "shield", cost: 100, damage: 0, defense: 25, desc: "Perisai baja tebal. Mengurangi damage yang diterima dari bos sebesar 25%." },
    { id: "armor_matcha", name: "Matcha sage belt", type: "armor", cost: 80, damage: 0, defense: 15, desc: "Sabuk hijau matcha rajutan cozy. Meningkatkan bonus XP yang diperoleh sebesar +15%." },
    { id: "armor_vest", name: "Barista steel vest", type: "armor", cost: 200, damage: 0, defense: 30, desc: "Celemek besi barista berat. Meningkatkan bonus XP yang diperoleh sebesar +30%." }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 16px' }}>
      
      {/* 1. RPG HERO PROFILE CARD */}
      <div className="card" style={{ 
        background: 'linear-gradient(to bottom right, #1c1815, #120f0d)',
        position: 'relative',
        margin: '0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="badge badge-study" style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.0rem', display: 'inline-flex', alignItems: 'center' }}>
              {rpgLevel >= 10 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={12} /> GRAVITY DEFIER
                </span>
              ) : rpgLevel >= 6 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={12} /> ATHLETE
                </span>
              ) : rpgLevel >= 3 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Swords size={12} /> SKILLED TRAINEE
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={12} /> NOVICE
                </span>
              )}
            </span>
            <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.8rem', color: 'var(--text-primary)', marginTop: '8px' }}>
              HERO LEVEL {rpgLevel}
            </h2>
          </div>
          
          <div className="cozy-flex-row">
            <div className="badge badge-debt" style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', padding: '2px 10px' }}>
              <Coins size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {rpgCoins}
            </div>
            <div className="badge badge-expense" style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', padding: '2px 10px' }}>
              <Swords size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {rpgBossesDefeated}
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div style={{ marginTop: '16px' }}>
          <div className="flex-row-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>PROGRESS PENGALAMAN (XP)</span>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>{rpgXp} / {rpgLevel * 150} XP</span>
          </div>
          <div className="cozy-progress-container">
            <div 
              className="cozy-progress-bar" 
              style={{ width: `${Math.min((rpgXp / (rpgLevel * 150)) * 100, 100)}%`, background: 'var(--color-study)' }}
            ></div>
          </div>
        </div>

        {/* Perlengkapan Aktif */}
        <div style={{ marginTop: '14px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>PERLENGKAPAN AKTIF:</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>SENJATA</p>
              <strong style={{ fontSize: '0.7rem', color: 'var(--color-study)', display: 'block', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={rpgEquipped?.weapon?.name || 'Kosong'}>
                {rpgEquipped?.weapon ? `⚔️ ${rpgEquipped.weapon.name}` : 'Kosong'}
              </strong>
            </div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>PERISAI</p>
              <strong style={{ fontSize: '0.7rem', color: 'var(--color-balance)', display: 'block', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={rpgEquipped?.shield?.name || 'Kosong'}>
                {rpgEquipped?.shield ? `🛡️ ${rpgEquipped.shield.name}` : 'Kosong'}
              </strong>
            </div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ARMOR</p>
              <strong style={{ fontSize: '0.7rem', color: 'var(--color-expense)', display: 'block', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={rpgEquipped?.armor?.name || 'Kosong'}>
                {rpgEquipped?.armor ? `👕 ${rpgEquipped.armor.name}` : 'Kosong'}
              </strong>
            </div>
          </div>
        </div>

        {/* Lencana Pencapaian */}
        {rpgBadges && rpgBadges.length > 0 && (
          <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>LENCANA DIPEROLEH:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {rpgBadges.map((badge, idx) => (
                <span key={idx} className="badge badge-study" style={{ fontSize: '0.7rem' }}>
                  <Shield size={10} style={{ marginRight: '4px' }} /> {badge}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. SUB-TAB LOCAL NAVIGATOR */}
      <div className="cozy-sub-nav" style={{ padding: '0', borderBottom: 'none' }}>
        <button 
          onClick={() => setDashboardSubTab('workout')}
          className={`cozy-sub-tab-btn ${dashboardSubTab === 'workout' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Dumbbell size={14} /> LATIHAN & FISIK
        </button>
        <button 
          onClick={() => setDashboardSubTab('shop')}
          className={`cozy-sub-tab-btn ${dashboardSubTab === 'shop' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Coins size={14} /> TOKO RPG
        </button>
        <button 
          onClick={() => setDashboardSubTab('quests')}
          className={`cozy-sub-tab-btn ${dashboardSubTab === 'quests' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Scroll size={14} /> MISI HARIAN
        </button>
      </div>

      {/* 3. SUB-TAB CONTENTS */}
      {dashboardSubTab === 'workout' && (
        <div className="cozy-flex-col">
          
          {/* Kartu Profil Fisik & BMI */}
          <div className="card" style={{ margin: '0' }}>
            <div className="card-title-retro" style={{ color: 'var(--color-study)' }}>
              <Scale size={16} /> DATA FISIK & TARGET NUTRISI
            </div>
            
            <div className="cozy-grid-3" style={{ margin: '8px 0 16px 0' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>BERAT & BMI</span>
                <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-pixel)', display: 'block', margin: '4px 0' }}>
                  {weight}kg / {bmi}
                </strong>
                <span className="badge" style={{ fontSize: '0.68rem', padding: '1px 6px', color: bmiCat.color, background: 'rgba(0,0,0,0.3)' }}>{bmiCat.text}</span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>TARGET KALORI</span>
                <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-pixel)', display: 'block', margin: '4px 0', color: 'var(--color-debt)' }}>
                  {targetCalories}
                </strong>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>kkal/hari</span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>TARGET PROTEIN</span>
                <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-pixel)', display: 'block', margin: '4px 0', color: 'var(--color-study)' }}>
                  {targetProtein}g
                </strong>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>sintesis otot</span>
              </div>
            </div>

            {/* Kalori & Protein Progress */}
            <div className="cozy-flex-col">
              <div>
                <div className="flex-row-between" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span>ASUPAN KALORI HARI INI</span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>{todayCalories} / {targetCalories} kkal</span>
                </div>
                <div className="cozy-progress-container">
                  <div className="cozy-progress-bar" style={{ width: `${calPercent}%`, background: 'var(--color-debt)' }}></div>
                </div>
              </div>

              <div>
                <div className="flex-row-between" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span>ASUPAN PROTEIN HARI INI</span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>{todayProtein} / {targetProtein}g</span>
                </div>
                <div className="cozy-progress-container">
                  <div className="cozy-progress-bar" style={{ width: `${protPercent}%`, background: 'var(--color-study)' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Kartu Pemulihan & Kesiapan Latihan */}
          <div className="card" style={{ margin: '0' }}>
            <div className="flex-row-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px' }}>
              <div className="card-title-retro" style={{ margin: '0', borderBottom: 'none', paddingBottom: '0' }}>
                <Activity size={16} /> KESIAPAN FISIK (RECOVERY)
              </div>
              <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => setShowRecoveryModal(true)}>
                LOG RECOVERY
              </button>
            </div>

            {recoveryToday ? (
              <div className="cozy-flex-col">
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                  {recoveryToday.rekomendasi}
                </p>
                <div className="cozy-grid-3" style={{ margin: '4px 0 0 0' }}>
                  <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '8px', textAlign: 'center', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6rem' }}>TIDUR</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{recoveryToday.sleep}/5</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '8px', textAlign: 'center', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6rem' }}>OTOT PEGAL</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{recoveryToday.soreness}/5</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '8px', textAlign: 'center', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6rem' }}>ENERGI</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{recoveryToday.energy}/5</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', py: '6px' }}>
                Belum ada data pemulihan hari ini. Catat log kesiapan Anda sekarang untuk panduan latihan optimal.
              </p>
            )}
          </div>

          {/* Kartu Jadwal Latihan Hari Ini */}
          <div className="card" style={{ margin: '0' }}>
            <div className="flex-row-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px' }}>
              <div className="card-title-retro" style={{ margin: '0', borderBottom: 'none', paddingBottom: '0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Dumbbell size={16} /> LATIHAN {currentDay.toUpperCase()}
              </div>
              <select 
                className="form-control" 
                style={{ width: '110px', padding: '3px 6px', fontSize: '0.75rem', height: '28px' }}
                value={currentDay}
                onChange={(e) => setSelectedDayOverride(e.target.value)}
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {isRestDay ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-study)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Coffee size={18} /> REST DAY (HARI ISTIRAHAT)
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '280px', marginInline: 'auto' }}>
                  Tidak ada jadwal latihan berat hari ini. Waktunya memulihkan otot di Cozy Cafe, minum teh hangat, dan merawat pet kucing Anda!
                </p>
              </div>
            ) : (
              <div className="cozy-flex-col">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {workoutToday.map((ex, idx) => (
                    <div key={idx} style={{ 
                      background: 'rgba(0,0,0,0.15)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '10px', 
                      padding: '8px 12px' 
                    }}>
                      <div className="flex-row-between">
                        <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{ex.NamaGerakan}</strong>
                        <span className="badge badge-study" style={{ fontSize: '0.7rem' }}>{ex.Set} Set x {ex.Reps}</span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.25' }}>
                        {ex.Deskripsi}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button 
                    className="btn btn-study" 
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => onStartWorkout(currentDay, workoutToday)}
                  >
                    <Play size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    MULAI LATIHAN AKTIF (AI CAMERA)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Kartu Milestones PR */}
          <div className="card" style={{ margin: '0' }}>
            <div className="card-title-retro" style={{ color: 'var(--color-debt)' }}>
              <Trophy size={16} /> REKOR PRIBADI (PERSONAL RECORDS)
            </div>
            
            <div className="cozy-grid-2" style={{ margin: '8px 0 0 0' }}>
              {Object.entries(personalRecords).map(([key, val]) => (
                <div 
                  key={key} 
                  style={{ 
                    background: 'rgba(0,0,0,0.15)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '10px', 
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setEditingPRKey(key);
                    setEditingPRValue(val);
                    setShowPRModal(true);
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key}</span>
                  <strong style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    {val} {key === 'plank' || key === 'lsit' || key === 'handstand' ? 's' : 'r'}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Formulir Update BB/TB */}
          <div className="card" style={{ margin: '0' }}>
            <div className="card-title-retro" style={{ color: 'var(--color-primary)' }}>
              <Scale size={16} /> UPDATE FISIK (BB / TB)
            </div>
            
            <form onSubmit={handlePhysiqueSubmit} className="cozy-flex-col">
              <div className="cozy-grid-2" style={{ margin: '0' }}>
                <div className="form-group">
                  <label>BERAT BADAN (KG)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-control"
                    value={taskWeight} 
                    onChange={(e) => setTaskWeight(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>TINGGI BADAN (CM)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={taskHeight} 
                    onChange={(e) => setTaskHeight(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <button type="submit" className="btn btn-outline" style={{ padding: '8px' }}>
                SIMPAN PERUBAHAN
              </button>
              
              {taskSuccess && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-study)', textAlign: 'center', marginTop: '4px' }}>
                  Fisik berhasil diperbarui! 🎉
                </p>
              )}
            </form>
          </div>

        </div>
      )}

      {/* TOKO RPG SUB-TAB */}
      {dashboardSubTab === 'shop' && (
        <div className="cozy-flex-col">
          <div className="card" style={{ margin: '0' }}>
            <div className="card-title-retro" style={{ color: 'var(--color-debt)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Swords size={16} /> PERALATAN & PERSENJATAAN RPG
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.3' }}>
              Beli peralatan calisthenics legendaris menggunakan koin Cozy Cafe yang Anda kumpulkan dari belajar & latihan.
            </p>
            
            <div className="cozy-flex-col">
              {shopItems.map((item, idx) => {
                const isOwned = rpgInventory.some(inv => inv.name === item.name);
                const isEquipped = rpgEquipped[item.type]?.name === item.name;
                
                return (
                  <div key={idx} style={{ 
                    background: 'rgba(0,0,0,0.15)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    padding: '10px 12px' 
                  }}>
                    <div className="flex-row-between">
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.name.toUpperCase()}</strong>
                      <span className="badge badge-debt" style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>{item.cost} KOIN</span>
                    </div>
                    
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.25' }}>
                      {item.desc}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--color-study)', fontWeight: 'bold' }}>
                        {item.type === 'weapon' ? `+${item.damage}% DMG` : 
                         item.type === 'shield' ? `🛡️ -${item.defense}% DMG` : 
                         `👕 +${item.defense}% XP`}
                      </span>
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        {!isOwned ? (
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                            onClick={() => {
                              if (rpgCoins >= item.cost) {
                                onBuyItem(item);
                              } else {
                                alert("Koin RPG tidak cukup! Belajar atau latihanlah untuk mengumpulkan koin.");
                              }
                            }}
                          >
                            BELI ITEM
                          </button>
                        ) : (
                          <button 
                            className={`btn ${isEquipped ? 'btn-study' : 'btn-outline'}`}
                            style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                            onClick={() => onEquipItem(rpgInventory.find(inv => inv.name === item.name))}
                            disabled={isEquipped}
                          >
                            {isEquipped ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Shield size={10} /> DIPAKAI
                              </span>
                            ) : 'GUNAKAN'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MISI HARIAN SUB-TAB */}
      {dashboardSubTab === 'quests' && (
        <div className="cozy-flex-col">
          <div className="card" style={{ margin: '0' }}>
            <div className="card-title-retro" style={{ color: 'var(--color-study)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scroll size={16} /> PAPAN MISI HARIAN CAFE
            </div>
            
            <div className="cozy-flex-col" style={{ marginTop: '8px' }}>
              {dailyQuests.map((quest, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(0,0,0,0.15)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '10px 12px' 
                }}>
                  <div className="flex-row-between">
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{quest.text}</strong>
                    {quest.completed && !quest.claimed && (
                      <button 
                        className="btn btn-study" 
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                        onClick={() => onClaimQuestReward(quest.id)}
                      >
                        KLAIM REWARD
                      </button>
                    )}
                    {quest.claimed && (
                      <span className="badge badge-study" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={10} /> DITUNTASKAN
                      </span>
                    )}
                  </div>
                  
                  {/* Progress Misi */}
                  <div style={{ marginTop: '10px' }}>
                    <div className="flex-row-between" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      <span>PROGRESS MISI</span>
                      <span>{quest.current} / {quest.target}</span>
                    </div>
                    <div className="cozy-progress-container" style={{ height: '6px' }}>
                      <div className="cozy-progress-bar" style={{ 
                        width: `${(quest.current / quest.target) * 100}%`,
                        background: quest.completed ? 'var(--color-study)' : 'var(--color-primary)' 
                      }}></div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    <span>Reward: <strong style={{ color: 'var(--color-debt)' }}>+{quest.rewardCoins} koin</strong> & <strong style={{ color: 'var(--color-study)' }}>+{quest.rewardXp} XP</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}

      {/* Recovery Modal */}
      {showRecoveryModal && (
        <div className="scanner-overlay" onClick={() => setShowRecoveryModal(false)}>
          <div className="scanner-modal" onClick={(e) => e.stopPropagation()} style={{ borderTopColor: 'var(--color-expense)' }}>
            <div className="card-title-retro" style={{ color: 'var(--color-expense)' }}>
              <Activity size={18} /> CATAT LOG PEMULIHAN (RECOVERY)
            </div>
            
            <form onSubmit={handleRecoverySubmit} className="cozy-flex-col">
              <div className="form-group">
                <label>KUALITAS TIDUR MALAM INI: {sleepRating}/5</label>
                <input 
                  type="range" min="1" max="5" 
                  value={sleepRating} 
                  onChange={(e) => setSleepRating(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--color-study)' }}
                />
              </div>

              <div className="form-group">
                <label>TINGKAT PEGAL/SORENESS OTOT: {sorenessRating}/5</label>
                <input 
                  type="range" min="1" max="5" 
                  value={sorenessRating} 
                  onChange={(e) => setSorenessRating(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--color-expense)' }}
                />
              </div>

              <div className="form-group">
                <label>TINGKAT ENERGI & MOOD HARI INI: {energyRating}/5</label>
                <input 
                  type="range" min="1" max="5" 
                  value={energyRating} 
                  onChange={(e) => setEnergyRating(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--color-debt)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-study" style={{ flex: 1, padding: '10px' }}>
                  HITUNG SKOR RECOVERY
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => setShowRecoveryModal(false)}>
                  BATAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PR Modal */}
      {showPRModal && (
        <div className="scanner-overlay" onClick={() => setShowPRModal(false)}>
          <div className="scanner-modal" onClick={(e) => e.stopPropagation()} style={{ borderTopColor: 'var(--color-debt)' }}>
            <div className="card-title-retro" style={{ color: 'var(--color-debt)' }}>
              <Trophy size={18} /> UPDATE REKOR BARU
            </div>
            
            <form onSubmit={handlePRSubmit} className="cozy-flex-col">
              <div className="form-group">
                <label>NAMA GERAKAN / REKOR</label>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'capitalize' }}>
                  {getPRLabel(editingPRKey)}
                </strong>
              </div>

              <div className="form-group">
                <label>NILAI REKOR PRIBADI BARU</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={editingPRValue} 
                  onChange={(e) => setEditingPRValue(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                  SIMPAN REKOR
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => setShowPRModal(false)}>
                  BATAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
