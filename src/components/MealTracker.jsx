import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Flame, RefreshCw, AlertCircle, HelpCircle, Check, Sparkles, Trash2, Calendar, ChefHat, Banknote, BarChart2 } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';

export default function MealTracker({ 
  webAppUrl, 
  connectionStatus,
  mealHistory = [],
  onLogMeal,
  onDeleteMeal,
  targetCalories = 2800,
  targetProtein = 80,
  totalSaldo = 0
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // State Form Manual
  const [manualFoodName, setManualFoodName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Hitung asupan gizi hari ini
  const getTodayTotal = () => {
    const todayStr = getLocalDateString(new Date());
    const todayMeals = mealHistory.filter(meal => {
      const timestampVal = meal.timestamp || meal.Timestamp || meal.Tanggal || Date.now();
      const mealDateStr = getLocalDateString(timestampVal);
      return mealDateStr === todayStr;
    });
    
    const calories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const protein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    
    return { calories, protein, list: todayMeals };
  };

  const todayData = getTodayTotal();
  const calPercent = Math.min(Math.round((todayData.calories / targetCalories) * 100), 100);
  const protPercent = Math.min(Math.round((todayData.protein / targetProtein) * 100), 100);

  const getBudgetCategory = () => {
    if (totalSaldo < 50000) return { label: 'SANGAT HEMAT (Budget Makanan Ringan)', tips: 'Fokus pada sumber protein super ekonomis: telur rebus, tahu, tempe kukus, dan air tajin sebagai karbohidrat hemat.' };
    if (totalSaldo < 200000) return { label: 'HEMAT MODERAT (Dada Ayam & Telur)', tips: 'Bisa membeli dada ayam fillet di pasar tradisional, campur dengan telur dadar dan nasi putih porsi ganda.' };
    return { label: 'SURPLUS NYAMAN (Menu Komplet)', tips: 'Sempurna untuk variasi bulking lengkap: daging sapi cincang, dada ayam panggang, susu protein, pisang, dan roti gandum.' };
  };
  
  const budgetInfo = getBudgetCategory();

  const getWeeklyNutritionHistory = () => {
    const historyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      historyMap[dateStr] = { date: dateStr, calories: 0, protein: 0 };
    }

    mealHistory.forEach(meal => {
      const timestampVal = meal.timestamp || meal.Timestamp || meal.Tanggal || Date.now();
      const dateStr = getLocalDateString(timestampVal);
      if (historyMap[dateStr]) {
        historyMap[dateStr].calories += (meal.calories || 0);
        historyMap[dateStr].protein += (meal.protein || 0);
      }
    });

    return Object.values(historyMap).sort((a, b) => a.date.localeCompare(b.date));
  };

  const weeklyData = getWeeklyNutritionHistory();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setError(null);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Kompresi kualitas 70% JPEG (sangat efisien & memperkecil file jadi ~100KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(compressedDataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setError(null);
    setIsSimulated(false);

    const base64Data = imagePreview.split(',')[1];
    const mimeType = imagePreview.split(';')[0].split(':')[1];

    if (connectionStatus === 'connected' && webAppUrl) {
      try {
        const response = await fetch(webAppUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            action: "analyze_meal",
            imageRaw: base64Data,
            mimeType: mimeType
          })
        });

        if (!response.ok) throw new Error("Gagal menghubungi server Google Sheets");
        
        const data = await response.json();
        
        if (data.status === 'success' && data.analysis) {
          const parsedResult = typeof data.analysis === 'string' 
            ? JSON.parse(data.analysis.replace(/```json/g, '').replace(/```/g, '').trim())
            : data.analysis;
          setResult(parsedResult);
        } else {
          setError("Apps Script: " + (data.message || "Gagal melakukan analisis"));
        }
      } catch (err) {
        console.error("Gagal melakukan analisis API online:", err);
        setError("Koneksi Error: " + err.message + ". Menggunakan simulasi offline...");
        runSimulationAnalysis();
      } finally {
        setLoading(false);
      }
    } else {
      // Jalankan simulasi offline
      setIsSimulated(true);
      setTimeout(() => {
        runSimulationAnalysis();
        setLoading(false);
      }, 1500);
    }
  };

  const runSimulationAnalysis = () => {
    const simList = [
      {
        foodName: "Indomie Goreng + Telur Mata Sapi + Sosis",
        calories: 650,
        protein: 24,
        carbs: 72,
        fat: 29,
        tips: "Kalori cukup tinggi untuk surplus, namun kadar lemak jenuh dan sodiumnya terlalu tinggi. Kurang optimal untuk adaptasi tendon dan hipertrofi bersih. Disarankan ganti sosis dengan tempe/tahu bakar."
      },
      {
        foodName: "Nasi Putih (200g) + Dada Ayam Panggang (120g) + Tempe Orek",
        calories: 580,
        protein: 42,
        carbs: 65,
        fat: 14,
        tips: "Rasio makro nutrisi sangat sempurna! Kandungan protein tinggi dari dada ayam membantu perbaikan serat otot setelah latihan calisthenics berat."
      },
      {
        foodName: "Roti Gandum (3 lembar) + Selai Kacang (2 sdm) + Pisang Raja",
        calories: 460,
        protein: 16,
        carbs: 60,
        fat: 18,
        tips: "Menu sarapan / pre-workout energi instan yang sangat baik. Karbohidrat kompleks dari roti gandum dan potasium dari pisang memberikan stamina latihan calisthenics."
      }
    ];

    const randomIdx = Math.floor(Math.random() * simList.length);
    setResult(simList[randomIdx]);
  };

  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  const handleSaveMeal = async () => {
    if (!result) return;
    setLoading(true);

    const newMeal = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      tanggal: getLocalDateString(),
      foodName: result.foodName,
      calories: Number(result.calories),
      protein: Number(result.protein),
      carbs: Number(result.carbs),
      fat: Number(result.fat)
    };

    onLogMeal(newMeal);

    if (connectionStatus === 'connected' && webAppUrl) {
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            action: "log_meal",
            ...newMeal
          })
        });
      } catch (e) {
        console.error("Gagal mencatat makanan ke Sheets cloud:", e);
      }
    }

    setLoading(false);
    handleReset();
    alert("Makanan berhasil dicatat ke riwayat harian! 🍳");
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newMeal = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      tanggal: getLocalDateString(),
      foodName: manualFoodName,
      calories: Number(manualCalories),
      protein: Number(manualProtein),
      carbs: Number(manualCarbs || 0),
      fat: Number(manualFat || 0)
    };

    onLogMeal(newMeal);

    if (connectionStatus === 'connected' && webAppUrl) {
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            action: "log_meal",
            ...newMeal
          })
        });
      } catch (err) {
        console.error(err);
      }
    }

    setLoading(false);
    setManualFoodName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setShowManualForm(false);
    alert("Makanan manual berhasil dicatat! 🎉");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan makanan ini?")) {
      onDeleteMeal(id);
      if (connectionStatus === 'connected' && webAppUrl) {
        try {
          await fetch(webAppUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
              action: "delete_meal",
              id: id
            })
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 16px' }}>
      
      {/* 1. HEADER NUTRISI AI */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-study)' }}>
          <Sparkles size={16} /> GIZI AI & MEAL TRACKER
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
          Gunakan kamera HP untuk memotret makanan Anda. AI akan menganalisis kandungan kalori, protein, karbohidrat, dan lemak secara instan untuk program surplus Anda.
        </p>
      </div>

      {/* 2. UPLOAD / CAMERA CARD */}
      {!showManualForm ? (
        <div className="card" style={{ margin: '0' }}>
          {!imagePreview ? (
            <div style={{ 
              border: '2px dashed var(--border-color)', 
              borderRadius: '14px', 
              padding: '24px 12px', 
              textAlign: 'center', 
              background: 'rgba(0,0,0,0.15)' 
            }}>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
              <input type="file" ref={cameraInputRef} onChange={handleImageChange} accept="image/*" capture="environment" style={{ display: 'none' }} />
              
              <div style={{ 
                width: '48px', height: '48px', background: 'rgba(146, 176, 151, 0.1)', 
                border: '1px solid var(--border-color)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px auto', color: 'var(--color-study)'
              }}>
                <Camera size={20} />
              </div>
              
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>UNGGAH FOTO MAKANAN</h4>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '280px', marginInline: 'auto' }}>
                Potret hidangan menggunakan kamera HP atau unggah dari penyimpanan galeri.
              </p>
              
              <div className="cozy-flex-col" style={{ marginTop: '16px', gap: '8px' }}>
                <button className="btn btn-study" style={{ padding: '10px' }} onClick={() => cameraInputRef.current.click()}>
                  <Camera size={14} style={{ marginRight: '6px' }} /> FOTO LANGSUNG (KAMERA HP)
                </button>
                <button className="btn btn-outline" style={{ padding: '10px' }} onClick={() => fileInputRef.current.click()}>
                  <ImageIcon size={14} style={{ marginRight: '6px' }} /> PILIH DARI GALERI
                </button>
                <button className="btn btn-outline" style={{ padding: '8px', fontSize: '0.72rem' }} onClick={() => setShowManualForm(true)}>
                  INPUT MANUAL TANPA AI
                </button>
              </div>
            </div>
          ) : (
            <div className="cozy-flex-col">
              <div style={{ 
                position: 'relative', borderRadius: '12px', overflow: 'hidden', 
                border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.4)',
                maxHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img src={imagePreview} alt="Pratinjau Makanan" style={{ maxHeight: '220px', objectFit: 'contain', width: '100%' }} />
                <button className="btn btn-outline" style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 8px', fontSize: '0.7rem' }} onClick={handleReset}>
                  BATAL
                </button>
              </div>
              
              <button className="btn btn-study" style={{ padding: '12px' }} onClick={handleAnalyze} disabled={loading}>
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} style={{ marginRight: '6px' }} />}
                {loading ? 'SEDANG MENGANALISIS AI...' : 'MULAI ANALISIS GEMINI AI'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* FORM INPUT MANUAL */
        <div className="card" style={{ margin: '0' }}>
          <div className="card-title-retro" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ChefHat size={16} /> CATAT MAKANAN MANUAL
          </div>
          <form onSubmit={handleManualSubmit} className="cozy-flex-col">
            <div className="form-group">
              <label>NAMA MAKANAN</label>
              <input type="text" className="form-control" placeholder="Contoh: Nasi Putih & Telur Balado" value={manualFoodName} onChange={(e) => setManualFoodName(e.target.value)} required />
            </div>
            
            <div className="cozy-grid-2">
              <div className="form-group">
                <label>KALORI (KKAL)</label>
                <input type="number" className="form-control" placeholder="Contoh: 450" value={manualCalories} onChange={(e) => setManualCalories(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>PROTEIN (GRAM)</label>
                <input type="number" className="form-control" placeholder="Contoh: 18" value={manualProtein} onChange={(e) => setManualProtein(e.target.value)} required />
              </div>
            </div>

            <div className="cozy-grid-2">
              <div className="form-group">
                <label>KARBOHIDRAT (G) - OPSIONAL</label>
                <input type="number" className="form-control" placeholder="0" value={manualCarbs} onChange={(e) => setManualCarbs(e.target.value)} />
              </div>
              <div className="form-group">
                <label>LEMAK (G) - OPSIONAL</label>
                <input type="number" className="form-control" placeholder="0" value={manualFat} onChange={(e) => setManualFat(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-study" style={{ flex: 1, padding: '10px' }}>SIMPAN MAKANAN</button>
              <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => setShowManualForm(false)}>BATAL</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. HASIL ESTIMASI AI GEMINI */}
      {result && (
        <div className="card" style={{ margin: '0', borderColor: 'var(--color-study)' }}>
          <div className="card-title-retro" style={{ color: 'var(--color-study)' }}>
            ✨ ESTIMASI KANDUNGAN GIZI AI
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NAMA MAKANAN TERDETEKSI:</span>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.6rem', color: 'var(--text-primary)', marginTop: '2px' }}>
              {result.foodName.toUpperCase()}
            </h3>
          </div>

          {/* Grid Zat Gizi */}
          <div className="cozy-grid-2" style={{ gap: '8px' }}>
            <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>KALORI</span>
              <strong style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-debt)' }}>
                {result.calories} kkal
              </strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>PROTEIN</span>
              <strong style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-study)' }}>
                {result.protein}g
              </strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>KARBOHIDRAT</span>
              <strong style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                {result.carbs}g
              </strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>LEMAK</span>
              <strong style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                {result.fat}g
              </strong>
            </div>
          </div>

          {/* Tips Barista Gizi */}
          <div style={{ marginTop: '14px', background: 'rgba(146, 176, 151, 0.05)', border: '1px solid var(--color-study)', borderRadius: '10px', padding: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-study)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> PANDUAN NUTRISIONIS COZY:
            </span>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>
              {result.tips}
            </p>
          </div>

          <div className="cozy-flex-row" style={{ marginTop: '16px', gap: '8px' }}>
            <button className="btn btn-study" style={{ flex: 1, padding: '12px' }} onClick={handleSaveMeal}>
              <Check size={14} style={{ marginRight: '6px' }} /> CATAT LOG MAKANAN
            </button>
            <button className="btn btn-outline" style={{ flex: 1, padding: '12px' }} onClick={handleReset}>
              ULANGI
            </button>
          </div>

          {isSimulated && (
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
              *Mode Simulasi Offline. Hubungkan Cloud DB di Settings untuk AI Vision nyata.
            </p>
          )}
        </div>
      )}

      {/* BUDGET MEAL AI WIDGET */}
      <div className="card" style={{ 
        margin: '0', 
        border: '1px solid var(--border-color)', 
        background: 'linear-gradient(to bottom right, #1c1815, #120f0d)',
        borderRadius: '12px',
        padding: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--color-study)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Banknote size={16} /> BUDGET MEAL AI PANDUAN
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-pixel)' }}>
            Saldo: Rp {totalSaldo.toLocaleString('id-ID')}
          </span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-study)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>
          Status Dompet: {budgetInfo.label}
        </p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
          {budgetInfo.tips}
        </p>
      </div>

      {/* 4. TOTAL ASUPAN HARI INI */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-debt)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart2 size={16} /> RINGKASAN GIZI HARI INI
        </div>

        <div className="cozy-flex-col" style={{ marginTop: '6px' }}>
          <div>
            <div className="flex-row-between" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>TOTAL ENERGI</span>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>{todayData.calories} / {targetCalories} kkal</span>
            </div>
            <div className="cozy-progress-container">
              <div className="cozy-progress-bar" style={{ width: `${calPercent}%`, background: 'var(--color-debt)' }}></div>
            </div>
          </div>

          <div>
            <div className="flex-row-between" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>TOTAL PROTEIN</span>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>{todayData.protein} / {targetProtein}g</span>
            </div>
            <div className="cozy-progress-container">
              <div className="cozy-progress-bar" style={{ width: `${protPercent}%`, background: 'var(--color-study)' }}></div>
            </div>
          </div>
        </div>
      </div>

    {/* 📊 GRAFIK TREN GIZI MINGGUAN (SVG) */}
    <div className="card" style={{ margin: '0' }}>
      <div className="card-title-retro" style={{ color: 'var(--color-study)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <BarChart2 size={16} /> TREN ASUPAN KALORI MINGGUAN
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.35' }}>
        Tren asupan kalori harian Anda dalam 7 hari terakhir dibandingkan dengan target {targetCalories} kkal.
      </p>

      {(() => {
        const weeklyData = getWeeklyNutritionHistory();
        const svgW = 500;
        const svgH = 160;
        const padL = 45;
        const padR = 15;
        const padT = 20;
        const padB = 30;
        const cW = svgW - padL - padR;
        const cH = svgH - padT - padB;

        const calList = weeklyData.map(d => d.calories);
        const maxCal = Math.max(targetCalories, ...calList, 1000);

        const spacing = cW / 7;
        const barW = 28;

        return (
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', minWidth: '320px', height: 'auto', overflow: 'visible' }}>
              {/* Garis target kalori */}
              {(() => {
                const targetY = padT + cH - (targetCalories / maxCal) * cH;
                return (
                  <g>
                    <line 
                      x1={padL} 
                      y1={targetY} 
                      x2={svgW - padR} 
                      y2={targetY} 
                      style={{ stroke: 'var(--color-expense)', strokeWidth: '1.5', strokeDasharray: '4 4' }} 
                    />
                    <text 
                      x={padL + 4} 
                      y={targetY - 4} 
                      style={{ fill: 'var(--color-expense)', fontSize: '8px', fontWeight: 'bold' }}
                    >
                      TARGET: {targetCalories} kkal
                    </text>
                  </g>
                );
              })()}

              {/* Grid lines dasar */}
              <line 
                x1={padL} 
                y1={padT + cH} 
                x2={svgW - padR} 
                y2={padT + cH} 
                style={{ stroke: 'var(--border-color)', strokeWidth: '1' }} 
              />

              {weeklyData.map((item, idx) => {
                const barH = (item.calories / maxCal) * cH;
                const x = padL + idx * spacing + (spacing - barW) / 2;
                const y = padT + cH - barH;
                const isCloseToTarget = item.calories >= targetCalories * 0.85;

                return (
                  <g key={idx}>
                    {/* Batang Kalori */}
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={Math.max(2, barH)}
                      rx="4"
                      style={{ 
                        fill: isCloseToTarget ? 'var(--color-study)' : 'var(--color-primary)',
                        opacity: 0.85 
                      }}
                    />

                    {/* Label Kalori */}
                    <text
                      x={x + barW / 2}
                      y={y - 6}
                      style={{ 
                        fill: 'var(--text-primary)', 
                        fontFamily: 'var(--font-pixel)', 
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}
                      textAnchor="middle"
                    >
                      {item.calories > 0 ? `${item.calories}` : '0'}
                    </text>

                    {/* Tanggal */}
                    <text
                      x={x + barW / 2}
                      y={svgH - padB + 14}
                      style={{ 
                        fill: 'var(--text-muted)', 
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}
                      textAnchor="middle"
                    >
                      {item.date.substring(8, 10)}/{item.date.substring(5, 7)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        );
      })()}
    </div>

      {/* 5. LOG MAKANAN YANG DICATAT HARI INI */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChefHat size={16} /> LOG MAKANAN HARI INI
        </div>
        
        {todayData.list.length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '14px 0' }}>
            Belum ada makanan yang dicatat hari ini. Potret atau input manual makanan Anda!
          </p>
        ) : (
          <div className="cozy-flex-col" style={{ marginTop: '8px' }}>
            {todayData.list.map((meal, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(0,0,0,0.15)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '10px', 
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1, marginRight: '8px' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block' }}>{meal.foodName}</strong>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {meal.calories} kkal | {meal.protein}g Protein | {meal.carbs || 0}g Karbo | {meal.fat || 0}g Lemak
                  </span>
                </div>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '6px', color: 'var(--color-expense)', borderColor: 'rgba(231,181,176,0.2)', flexShrink: 0 }}
                  onClick={() => handleDelete(meal.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
