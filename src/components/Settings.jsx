import { useState } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw, HelpCircle, Save, Flame, Download, ArrowLeft, Calculator, AlertTriangle, ChevronUp, ChevronDown, Droplet } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { getLocalDateString } from '../utils/dateUtils';

export default function Settings({ onBackToHome }) {
  // Ambil state & action secara mandiri dari global store
  const {
    webAppUrl,
    setWebAppUrl,
    connectionStatus,
    testConnection,
    targetCalories,
    setTargetCalories,
    targetProtein,
    setTargetProtein,
    weight,
    height,
    setPhysique,
    progressHistory,
    mealHistory,
    hydrationNotificationOption,
    setHydrationNotificationOption
  } = useDashboardStore();

  const defaultUrl = 'https://script.google.com/macros/s/AKfycbxstiZ_TZF4h03jXIG5oUvcrPC4Q1KmhJuOnPDr9iZJ0OG87A0I4zFvrpJ2Xp0OCYej/exec';
  const [urlInput, setUrlInput] = useState(webAppUrl);
  const [caloriesInput, setCaloriesInput] = useState(targetCalories);
  const [proteinInput, setProteinInput] = useState(targetProtein);
  const [weightInput, setWeightInput] = useState(weight);
  const [heightInput, setHeightInput] = useState(height);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // States untuk Kalkulator Gizi
  const [showCalc, setShowCalc] = useState(false);
  const [calcAge, setCalcAge] = useState(20);
  const [calcActivity, setCalcActivity] = useState(1.55);
  const [calcSurplus, setCalcSurplus] = useState(500);
  const [calcProteinRatio, setCalcProteinRatio] = useState(2.0);

  const handleApplyCalculation = () => {
    const bmr = 10 * Number(weightInput) + 6.25 * Number(heightInput) - 5 * Number(calcAge) + 5;
    const tdee = bmr * Number(calcActivity);
    const calculatedCalories = Math.round(tdee + Number(calcSurplus));
    const calculatedProtein = Math.round(Number(weightInput) * Number(calcProteinRatio));

    setCaloriesInput(calculatedCalories);
    setProteinInput(calculatedProtein);
    setShowCalc(false);
  };

  const handleSave = () => {
    const trimmedUrl = urlInput.trim();
    setUrlInput(trimmedUrl);
    setWebAppUrl(trimmedUrl);
    localStorage.setItem('calisthenics_web_app_url', trimmedUrl);
    
    setTargetCalories(Number(caloriesInput));
    localStorage.setItem('calisthenics_target_calories', caloriesInput);

    setTargetProtein(Number(proteinInput));
    localStorage.setItem('calisthenics_target_protein', proteinInput);

    setPhysique(Number(weightInput), Number(heightInput));

    setTestResult({ type: 'success', message: 'Semua pengaturan & target berhasil disimpan! ☕' });
  };

  const handleResetToDefault = () => {
    setUrlInput(defaultUrl);
    setWebAppUrl(defaultUrl);
    localStorage.setItem('calisthenics_web_app_url', defaultUrl);
    setTestResult({ type: 'success', message: 'URL database berhasil direset ke bawaan default! 🌿' });
  };

  const handleTest = async () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      setTestResult({ type: 'error', message: 'Masukkan URL Web App terlebih dahulu!' });
      return;
    }
    setTestResult(null);
    setLoading(true);
    const success = await testConnection(trimmedUrl);
    setLoading(false);
    if (success) {
      setTestResult({ type: 'success', message: 'Koneksi ke Google Sheets Berhasil! Data jadwal & progress sinkron. 🎉' });
    } else {
      setTestResult({ type: 'error', message: 'Koneksi Gagal. Pastikan URL benar dan izin akses Google Apps Script telah disetel ke "Anyone".' });
    }
  };

  const downloadCSV = (dataArray, filename) => {
    const csvContent = "\uFEFF" + dataArray.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportWorkoutsToCSV = () => {
    if (!progressHistory || progressHistory.length === 0) {
      alert("Belum ada riwayat latihan untuk diekspor!");
      return;
    }
    
    const headers = ["Tanggal", "Hari Workout", "Status", "Catatan"];
    const rows = progressHistory.map(item => {
      const tanggal = item.Tanggal || item.tanggal || '';
      const hari = item.HariWorkout || item.hariWorkout || '';
      const status = item.Status || item.status || '';
      const catatan = item.Catatan || item.catatan || '';
      
      const escape = (text) => {
        if (text === null || text === undefined) return '';
        const stringVal = String(text);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      };
      
      return [
        escape(tanggal),
        escape(hari),
        escape(status),
        escape(catatan)
      ];
    });
    
    downloadCSV([headers, ...rows], `riwayat_workout_${getLocalDateString()}.csv`);
  };

  const exportMealsToCSV = () => {
    if (!mealHistory || mealHistory.length === 0) {
      alert("Belum ada catatan makanan untuk diekspor!");
      return;
    }
    
    const headers = ["ID", "Nama Makanan", "Kalori (kkal)", "Protein (g)", "Karbohidrat (g)", "Lemak (g)", "Waktu"];
    const rows = mealHistory.map(item => {
      const id = item.id || '';
      const foodName = item.foodName || '';
      const calories = item.calories !== undefined ? item.calories : '';
      const protein = item.protein !== undefined ? item.protein : '';
      const carbs = item.carbs !== undefined ? item.carbs : '';
      const fat = item.fat !== undefined ? item.fat : '';
      const timestamp = item.timestamp || item.Timestamp || item.Tanggal || '';
      
      const escape = (text) => {
        if (text === null || text === undefined) return '';
        const stringVal = String(text);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      };
      
      return [
        escape(id),
        escape(foodName),
        escape(calories),
        escape(protein),
        escape(carbs),
        escape(fat),
        escape(timestamp)
      ];
    });
    
    downloadCSV([headers, ...rows], `catatan_makanan_${getLocalDateString()}.csv`);
  };

  const backupKeys = [
    'cozy_subjects',
    'cozy_study_history',
    'cozy_selected_subject_id',
    'cozy_wallets',
    'cozy_debts',
    'cozy_transactions',
    'cozy_coins',
    'cozy_water_ml_today',
    'cozy_pet_mood',
    'cozy_pet_last_interaction',
    'calisthenics_web_app_url',
    'calisthenics_jadwal',
    'calisthenics_progress_history',
    'calisthenics_meal_history',
    'calisthenics_target_calories',
    'calisthenics_target_protein',
    'calisthenics_weight',
    'calisthenics_height',
    'calisthenics_weight_history',
    'calisthenics_last_physique_update',
    'calisthenics_personal_records',
    'calisthenics_rpg_level',
    'calisthenics_rpg_xp',
    'calisthenics_rpg_coins',
    'calisthenics_rpg_bosses_defeated',
    'calisthenics_rpg_badges',
    'calisthenics_rpg_inventory',
    'calisthenics_rpg_equipped',
    'calisthenics_rpg_quests'
  ];

  const handleExportData = () => {
    try {
      const data = {};
      backupKeys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          data[key] = val;
        }
      });
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('download', `cozy_dashboard_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setTestResult({ type: 'success', message: 'Seluruh database berhasil diekspor ke berkas JSON! 📥' });
    } catch (err) {
      setTestResult({ type: 'error', message: `Gagal mengekspor data: ${err.message}` });
    }
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (typeof parsedData !== 'object' || parsedData === null) {
          throw new Error('Format berkas tidak valid.');
        }

        if (window.confirm("Apakah Anda yakin ingin MENGIMPOR data cadangan ini? Data saat ini akan ditimpa!")) {
          Object.keys(parsedData).forEach(key => {
            if (backupKeys.includes(key)) {
              localStorage.setItem(key, parsedData[key]);
            }
          });
          setTestResult({ type: 'success', message: 'Data cadangan berhasil dipulihkan! Halaman akan dimuat ulang... 🔄' });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (err) {
        setTestResult({ type: 'error', message: `Gagal memulihkan data cadangan: ${err.message}` });
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 16px' }}>
      
      {/* HEADER NAVIGATION BACK */}
      <div className="flex-row-between" style={{ paddingBottom: '4px', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          className="btn btn-outline" 
          style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', gap: '6px' }}
          onClick={onBackToHome}
        >
          <ArrowLeft size={14} /> BERANDA
        </button>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
          PENGATURAN GLOBAL
        </span>
      </div>

      {/* Target Nutrisi & Kalori Card */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-study)' }}>
          <Flame size={16} /> TARGET NUTRISI & FISIK
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Sesuaikan target kalori, protein harian, serta berat dan tinggi badan Anda untuk program bulking calisthenics.
        </p>
        
        <div className="cozy-flex-col">
          <div className="cozy-grid-2">
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>TARGET KALORI (KKAL)</label>
              <input
                type="number"
                className="form-control"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', textAlign: 'center' }}
                value={caloriesInput}
                onChange={(e) => setCaloriesInput(Number(e.target.value))}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>TARGET PROTEIN (GRAM)</label>
              <input
                type="number"
                className="form-control"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', textAlign: 'center' }}
                value={proteinInput}
                onChange={(e) => setProteinInput(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="cozy-grid-2">
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>BERAT BADAN (KG)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', textAlign: 'center' }}
                value={weightInput}
                onChange={(e) => setWeightInput(Number(e.target.value))}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>TINGGI BADAN (CM)</label>
              <input
                type="number"
                className="form-control"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', textAlign: 'center' }}
                value={heightInput}
                onChange={(e) => setHeightInput(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Calculator Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '14px' }}>
          <button
            onClick={() => setShowCalc(!showCalc)}
            className="btn btn-outline"
            style={{ width: '100%', fontSize: '0.75rem', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={14} /> KALKULATOR SURPLUS GIZI EKTOMORF
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {showCalc ? (
                <>TUTUP <ChevronUp size={14} /></>
              ) : (
                <>BUKA <ChevronDown size={14} /></>
              )}
            </span>
          </button>

          {showCalc && (
            <div className="cozy-flex-col" style={{ marginTop: '12px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                Kalkulasi TDEE ilmiah Anda untuk target surplus bulking ideal.
              </p>

              <div className="cozy-grid-2">
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>USIA (TAHUN)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ fontSize: '0.85rem', height: '36px', padding: '6px 10px', textAlign: 'center', fontFamily: 'var(--font-pixel)' }}
                    value={calcAge}
                    onChange={(e) => setCalcAge(Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>RASIO PROTEIN</label>
                  <select
                    className="form-control"
                    style={{ fontSize: '0.8rem', height: '36px', padding: '6px 10px' }}
                    value={calcProteinRatio}
                    onChange={(e) => setCalcProteinRatio(Number(e.target.value))}
                  >
                    <option value={1.6}>1.6g (Pemeliharaan)</option>
                    <option value={1.8}>1.8g (Anabolik Sedang)</option>
                    <option value={2.0}>2.0g (Anabolik Maksimal)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label>TINGKAT AKTIVITAS FISIK</label>
                <select
                  className="form-control"
                  style={{ fontSize: '0.8rem', height: '36px', padding: '6px 10px' }}
                  value={calcActivity}
                  onChange={(e) => setCalcActivity(Number(e.target.value))}
                >
                  <option value={1.2}>Sedentary (Jarang berolahraga)</option>
                  <option value={1.375}>Ringan (Olahraga ringan 1-2x/minggu)</option>
                  <option value={1.55}>Sedang (Olahraga calisthenics 3-4x/minggu)</option>
                  <option value={1.725}>Aktif (Olahraga intensif 5-6x/minggu)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label>TARGET SURPLUS KALORI</label>
                <select
                  className="form-control"
                  style={{ fontSize: '0.8rem', height: '36px', padding: '6px 10px' }}
                  value={calcSurplus}
                  onChange={(e) => setCalcSurplus(Number(e.target.value))}
                >
                  <option value={300}>Clean Bulk (+300 kkal)</option>
                  <option value={500}>Moderate Bulk (+500 kkal / ideal)</option>
                  <option value={700}>Aggressive Bulk (+700 kkal)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleApplyCalculation}
                className="btn btn-study"
                style={{ width: '100%', padding: '10px', marginTop: '6px' }}
              >
                TERAPKAN TARGET BARU
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pengingat Hidrasi Card */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Droplet size={16} /> PENGINGAT HIDRASI OTOMATIS
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.35' }}>
          Aktifkan notifikasi push browser berkala untuk mengingatkan Anda minum air secara teratur agar tubuh tetap bugar dan metabolisme optimal.
        </p>
        <div className="form-group" style={{ margin: '0' }}>
          <label>INTERVAL PENGINGAT</label>
          <select
            className="form-control"
            style={{ fontSize: '0.82rem', padding: '8px 12px', cursor: 'pointer' }}
            value={hydrationNotificationOption}
            onChange={async (e) => {
              const val = e.target.value;
              if (val !== 'off') {
                if (Notification.permission !== 'granted') {
                  const perm = await Notification.requestPermission();
                  if (perm !== 'granted') {
                    alert('Izin notifikasi ditolak. Pengingat hidrasi tidak dapat diaktifkan.');
                    setHydrationNotificationOption('off');
                    return;
                  }
                }
                new Notification('Pengingat Hidrasi Aktif! 💧', {
                  body: `Anda akan diingatkan untuk minum air setiap ${val === '1h' ? '1 jam' : '2 jam'}.`,
                });
              }
              setHydrationNotificationOption(val);
              setTestResult({ type: 'success', message: 'Setelan pengingat hidrasi berhasil disimpan! 💧' });
            }}
          >
            <option value="off">Matikan Pengingat (Nonaktif)</option>
            <option value="1h">Setiap 1 Jam Sekali</option>
            <option value="2h">Setiap 2 Jam Sekali</option>
          </select>
        </div>
      </div>

      {/* Google Sheets Database Connection Card */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-primary)' }}>
          <Database size={16} /> DATABASE SPREADSHEET
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Hubungkan pelacakan latihan dan nutrisi ke Google Sheets Anda agar data tersimpan aman di cloud.
        </p>

        <div className="cozy-flex-col">
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label>URL GOOGLE APPS SCRIPT WEB APP</label>
            <input
              type="url"
              className="form-control"
              style={{ fontSize: '0.78rem', padding: '10px' }}
              placeholder="https://script.google.com/macros/s/.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button className="btn btn-outline" style={{ flex: 1, padding: '10px' }} onClick={handleSave}>
              <Save size={14} style={{ marginRight: '4px' }} /> SIMPAN URL
            </button>
            <button className="btn btn-outline" style={{ flex: 1, padding: '10px' }} onClick={handleResetToDefault}>
              <RefreshCw size={14} style={{ marginRight: '4px' }} /> RESET DEFAULT
            </button>
          </div>

          <button 
            className="btn btn-study" 
            style={{ width: '100%', padding: '12px' }} 
            onClick={handleTest} 
            disabled={loading}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} style={{ marginRight: '6px' }} />}
            {loading ? 'MENGETES KONEKSI...' : 'TES KONEKSI DATABASE'}
          </button>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            borderRadius: '10px', 
            border: `1px solid ${testResult.type === 'success' ? 'var(--color-study)' : 'var(--color-expense)'}`,
            background: testResult.type === 'success' ? 'rgba(146,176,151,0.05)' : 'rgba(231,181,176,0.05)',
            color: testResult.type === 'success' ? 'var(--color-study)' : 'var(--color-expense)',
            fontSize: '0.72rem',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            {testResult.type === 'success' ? (
              <CheckCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
            ) : (
              <XCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Current Connection Status Badge */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Status sinkronisasi saat ini:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {connectionStatus === 'connected' ? (
              <>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-study)', display: 'inline-block' }}></span>
                <strong style={{ color: 'var(--color-study)' }}>TERHUBUNG CLOUD</strong>
              </>
            ) : (
              <>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }}></span>
                <strong style={{ color: 'var(--text-muted)' }}>OFFLINE (SIMULASI LOKAL)</strong>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cadangkan & Ekspor Data Card */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-balance)' }}>
          <Download size={16} /> CADANGKAN & EKSPOR DATA
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Unduh riwayat latihan dan catatan makanan Anda dalam format file CSV untuk cadangan atau dibuka di Excel.
        </p>

        <div className="cozy-grid-2">
          <button className="btn btn-outline" style={{ padding: '10px', fontSize: '0.72rem' }} onClick={exportWorkoutsToCSV}>
            <Download size={12} style={{ marginRight: '4px' }} /> EKSPOR LATIHAN
          </button>
          <button className="btn btn-outline" style={{ padding: '10px', fontSize: '0.72rem' }} onClick={exportMealsToCSV}>
            <Download size={12} style={{ marginRight: '4px' }} /> EKSPOR MAKANAN
          </button>
        </div>
      </div>

      {/* Guide/Help Card */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--text-secondary)' }}>
          <HelpCircle size={16} /> SETUP PANDUAN CLOUD
        </div>
        
        <ol style={{ 
          fontSize: '0.72rem', 
          color: 'var(--text-secondary)', 
          paddingLeft: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          lineHeight: '1.4'
        }}>
          <li>
            Buka Google Sheets, buat spreadsheet baru, lalu beri nama (contoh: <code>Workout Cozy DB</code>).
          </li>
          <li>
            Pilih menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.
          </li>
          <li>
            Salin dan tempel kode <code>google-apps-script.js</code> dari root project ke editor Apps Script. Simpan proyek.
          </li>
          <li>
            Klik tombol <strong>Terapkan (Deploy)</strong> di bagian kanan atas &gt; pilih <strong>Penerapan baru (New deployment)</strong>.
          </li>
          <li>
            Pilih tipe deployment: <strong>Aplikasi web (Web app)</strong>.
          </li>
          <li>
            Setel <em>Execute as</em> ke <strong>Me (Saya)</strong>, dan <em>Who has access</em> ke <strong>Anyone (Siapa saja)</strong>.
          </li>
          <li>
            Klik <strong>Deploy</strong>, berikan izin akses Google akun Anda, lalu salin <strong>Web app URL</strong> yang dihasilkan.
          </li>
          <li>
            Kembali ke tab ini, tempelkan URL tersebut di atas, lalu klik <strong>Simpan URL</strong> dan lakukan tes koneksi.
          </li>
        </ol>
      </div>

      {/* Backup & Restore Offline Card */}
      <div className="card" style={{ margin: '0', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-study)', borderBottomColor: 'var(--border-color)' }}>
          <Download size={16} /> CADANGKAN & PULIHKAN DATA OFFLINE (.JSON)
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.35' }}>
          Unduh seluruh data progress Anda (termasuk mood, koin, level RPG, dan asupan air) ke komputer Anda, atau pulihkan kembali dari berkas cadangan sebelumnya.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn" 
            style={{ flex: 1, padding: '10px', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.76rem', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={handleExportData}
          >
            EKSPOR DATA (.JSON)
          </button>
          
          <label 
            className="btn" 
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: 'var(--bg-card)', 
              color: 'var(--text-main)', 
              fontSize: '0.76rem', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            IMPOR DATA (.JSON)
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportData} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      {/* Reset Total Data Card */}
      <div className="card" style={{ margin: '0', border: '1px solid var(--color-expense)', background: 'rgba(231,181,176,0.03)' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-expense)', borderBottomColor: 'rgba(231,181,176,0.2)' }}>
          <AlertTriangle size={16} /> RESET TOTAL DATA APLIKASI
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.35' }}>
          Tindakan ini akan menghapus seluruh data riwayat belajar, progres calisthenics, catatan gizi AI, level RPG, koin Cozy Cafe, dan catatan keuangan Anda secara permanen dari penyimpanan browser lokal.
        </p>
        <button 
          className="btn" 
          style={{ width: '100%', padding: '10px', background: 'var(--color-expense)', color: 'var(--bg-dark)', borderColor: 'var(--color-expense)', fontSize: '0.76rem', fontWeight: 'bold' }}
          onClick={() => {
            if (window.confirm("Apakah Anda yakin ingin MENGHAPUS SEMUA DATA HISTORI secara permanen dan mulai dari awal?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        >
          RESET SEMUA HISTORI & MULAI DARI NOL
        </button>
      </div>

    </div>
  );
}
