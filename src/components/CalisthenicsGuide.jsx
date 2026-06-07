import { useState } from 'react';
import { BookOpen, Flame, ShieldAlert, Dumbbell, Zap, Award, Calculator, Sparkles } from 'lucide-react';
import { NUTRI_TIPS } from '../utils/mockData';
import { PROGRESSION_DATABASE } from '../utils/progressionDb';

export default function CalisthenicsGuide() {
  const [selectedPattern, setSelectedPattern] = useState('push');
  const [selectedExerciseIdx, setSelectedExerciseIdx] = useState(0);
  const [maxPerformance, setMaxPerformance] = useState(8);
  const [calcResult, setCalcResult] = useState(null);

  // State baru untuk Kalkulator 1RM
  const [bodyWeight, setBodyWeight] = useState(60);
  const [addedWeight, setAddedWeight] = useState(10);
  const [repsDone, setRepsDone] = useState(5);
  const [oneRepMaxResult, setOneRepMaxResult] = useState(null);

  const calculate1RM = () => {
    const bw = Number(bodyWeight) || 0;
    const aw = Number(addedWeight) || 0;
    const reps = Number(repsDone) || 1;
    
    const totalLoad = bw + aw;
    const total1RM = totalLoad * (1 + reps / 30);
    const added1RM = Math.max(0, total1RM - bw);

    const targets = {
      strength: {
        percentage: "85% - 100%",
        desc: "Kekuatan Maksimal (1-5 reps)",
        load: Math.max(0, (total1RM * 0.90) - bw)
      },
      hypertrophy: {
        percentage: "70% - 80%",
        desc: "Hipertrofi / Otot (6-12 reps)",
        load: Math.max(0, (total1RM * 0.75) - bw)
      },
      endurance: {
        percentage: "50% - 65%",
        desc: "Daya Tahan (15+ reps)",
        load: Math.max(0, (total1RM * 0.55) - bw)
      }
    };

    setOneRepMaxResult({
      total1RM: Math.round(total1RM),
      added1RM: Math.round(added1RM),
      targets
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 16px' }}>
      
      {/* Hero Welcome */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-balance)' }}>
          <BookOpen size={16} /> PANDUAN KALISTENIK
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
          Dirancang khusus untuk program surplus berat badan (hipertrofi) dan adaptasi tendon bagi profil pemula (Ektomorf). Ikuti prinsip-prinsip di bawah ini agar progres Anda aman, teratur, dan maksimal!
        </p>
      </div>

      {/* Nutrisi & Kalori */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-debt)' }}>
          <Flame size={16} /> FOKUS NUTRISI & BULKING
        </div>
        <div className="cozy-flex-col" style={{ marginTop: '8px', gap: '8px' }}>
          {NUTRI_TIPS.map((tip, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(0,0,0,0.15)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              padding: '12px' 
            }}>
              <strong style={{ fontSize: '0.8rem', color: 'var(--color-debt)', display: 'block' }}>{tip.title}</strong>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tendon & Pemulihan */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-expense)' }}>
          <ShieldAlert size={16} /> KEAMANAN SENDI & TENDON
        </div>
        
        <div className="cozy-flex-col" style={{ marginTop: '8px', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span className="badge badge-expense" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', flexShrink: 0, padding: '2px 8px' }}>1</span>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
              <strong>Pemanasan Wajib:</strong> Lakukan mobilisasi pergelangan tangan, bahu, dan siku secara ringan selama 5-10 menit sebelum mulai latihan untuk melumasi sendi dengan cairan sinovial.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span className="badge badge-expense" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', flexShrink: 0, padding: '2px 8px' }}>2</span>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
              <strong>Form & Tempo &gt; Repetisi:</strong> Lakukan setiap repetisi secara lambat dan terkendali. Hindari menghentak-hentak tubuh saat pull-up atau push-up untuk mencegah cedera otot/ligamen.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span className="badge badge-expense" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', flexShrink: 0, padding: '2px 8px' }}>3</span>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
              <strong>Nyeri Sendi vs Pegal Otot:</strong> Jika merasakan sakit tajam di persendian (siku/pergelangan tangan/bahu), segera HENTIKAN latihan. Pegal otot (DOMS) itu normal, namun sakit sendi adalah alarm bahaya.
            </p>
          </div>
        </div>
      </div>

      {/* Pola Latihan Fundamental */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-primary)' }}>
          <Dumbbell size={16} /> PROGRESSIVE OVERLOAD
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
          Tantangan utama pemula adalah membangun kekuatan dasar. Progres tidak harus dengan menambah beban fisik. Dalam kalistenik, Anda bisa melatih overload dengan:
        </p>
        <ul style={{ 
          fontSize: '0.72rem', 
          color: 'var(--text-secondary)', 
          paddingLeft: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px',
          marginTop: '8px',
          lineHeight: '1.35'
        }}>
          <li><strong>Time Under Tension (TUT):</strong> Perlambat tempo gerakan (misal: fase turun 3-4 detik).</li>
          <li><strong>Form Lebih Bersih:</strong> Lakukan full range of motion (dada menyentuh lantai saat push-up).</li>
          <li><strong>Waktu Istirahat Lebih Singkat:</strong> Kurangi jeda istirahat antar-set dari 90 detik ke 60 detik.</li>
          <li><strong>Tambah Repetisi:</strong> Jika sanggup 5 reps bersih hari ini, targetkan 6 reps di sesi berikutnya.</li>
        </ul>
      </div>

      {/* Kalkulator Level Progresi Gerakan */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-study)' }}>
          <Zap size={16} /> KALKULATOR LEVEL PROGRESI
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.3' }}>
          Ketahui kapan Anda siap naik ke variasi gerakan calisthenics yang lebih berat untuk terus memicu pertumbuhan otot baru.
        </p>

        <div className="cozy-flex-col" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
          <div className="cozy-grid-2">
            {/* Dropdown Pola Gerakan */}
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>POLA GERAKAN</label>
              <select
                className="form-control"
                style={{ fontSize: '0.8rem', height: '36px', padding: '6px 10px' }}
                value={selectedPattern}
                onChange={(e) => {
                  setSelectedPattern(e.target.value);
                  setSelectedExerciseIdx(0);
                  setCalcResult(null);
                }}
              >
                <option value="push">Menekan (Push)</option>
                <option value="pull">Menarik (Pull)</option>
                <option value="legs">Kaki (Legs)</option>
                <option value="core">Perut (Core)</option>
              </select>
            </div>

            {/* Dropdown Latihan Saat Ini */}
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>LATIHAN SAAT INI</label>
              <select
                className="form-control"
                style={{ fontSize: '0.8rem', height: '36px', padding: '6px 10px' }}
                value={selectedExerciseIdx}
                onChange={(e) => {
                  setSelectedExerciseIdx(Number(e.target.value));
                  setCalcResult(null);
                }}
              >
                {PROGRESSION_DATABASE[selectedPattern].levels.map((item, idx) => (
                  <option key={idx} value={idx}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Input Performance */}
          <div className="cozy-grid-2" style={{ alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>
                {PROGRESSION_DATABASE[selectedPattern].levels[selectedExerciseIdx].name.match(/Hang|Plank|Hold/i)
                  ? "DURASI MAKSIMAL (DETIK)"
                  : "REPETISI BERSIH MAKSIMAL"}
              </label>
              <input
                type="number"
                min="1"
                className="form-control"
                style={{ fontSize: '0.85rem', height: '36px', padding: '6px 10px', textAlign: 'center', fontFamily: 'var(--font-pixel)' }}
                value={maxPerformance}
                onChange={(e) => {
                  setMaxPerformance(Number(e.target.value));
                  setCalcResult(null);
                }}
              />
            </div>
            
            <button
              onClick={() => {
                const exercise = PROGRESSION_DATABASE[selectedPattern].levels[selectedExerciseIdx];
                const perf = Number(maxPerformance);
                const threshold = exercise.threshold;
                
                let status = "adaptation";
                let statusText = "Adaptasi Sendi";
                let badgeClass = "badge-expense";
                let message = `Teruskan latih ${exercise.name} untuk menyempurnakan form gerakan. Belum direkomendasikan naik tingkat agar tendon dan sendi tidak cidera terkejut.`;

                if (perf >= threshold) {
                  status = "ready";
                  statusText = "Siap Naik Tingkat";
                  badgeClass = "badge-study";
                  message = `Hebat! Kemampuan Anda menembus ${perf} ${exercise.name.match(/Hang|Plank|Hold/i) ? 'detik' : 'reps'} membuktikan otot & saraf Anda telah beradaptasi penuh.`;
                } else if (perf >= Math.round(threshold * 0.6)) {
                  status = "hypertrophy";
                  statusText = "Fase Hipertrofi";
                  badgeClass = "badge-debt";
                  message = `Bagus! Ini adalah rentang optimal Anda untuk merangsang pembentukan otot (hipertrofi). Terus konsisten melatih variasi ini.`;
                }

                setCalcResult({
                  status,
                  statusText,
                  badgeClass,
                  message,
                  currentName: exercise.name,
                  nextName: exercise.next,
                  nextDesc: exercise.next ? PROGRESSION_DATABASE[selectedPattern].levels.find(l => l.name === exercise.next)?.desc : ""
                });
              }}
              className="btn btn-study"
              style={{ height: '36px', padding: '0 10px', fontSize: '0.72rem' }}
            >
              CEK KESIAPAN
            </button>
          </div>
        </div>

        {/* Output Hasil Kalkulasi */}
        {calcResult && (
          <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="flex-row-between">
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>HASIL ANALISIS:</span>
              <span className={`badge ${calcResult.badgeClass}`} style={{ fontSize: '0.68rem' }}>
                {calcResult.statusText}
              </span>
            </div>

            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
              {calcResult.message}
            </p>

            {calcResult.nextName ? (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>VARIASI BERIKUTNYA:</span>
                <div style={{ background: 'rgba(146,176,151,0.03)', border: '1px solid var(--color-study)', borderRadius: '8px', padding: '8px' }}>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--color-study)', display: 'block' }}>{calcResult.nextName}</strong>
                  {calcResult.nextDesc && (
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>{calcResult.nextDesc}</p>
                  )}
                  <p style={{ fontSize: '0.68rem', color: 'var(--color-balance)', marginTop: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} /> Tips Transisi: Mulailah 1-2 set awal dengan {calcResult.nextName}, lalu selesaikan set sisanya dengan {calcResult.currentName} hingga kuat sepenuhnya.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Award size={14} style={{ color: 'var(--color-debt)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--color-debt)', fontWeight: 'bold' }}>
                  Selamat! Anda telah mencapai variasi teratas pada pola gerakan ini. Fokus ke penambahan rep/set atau beralih ke menu latihan Weighted.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kalkulator 1-Rep Max (1RM) Weighted Calisthenics */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-debt)' }}>
          <Calculator size={16} /> KALKULATOR 1-REP MAX
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.3' }}>
          Proyeksikan kekuatan satu repetisi maksimal (1RM) Anda dan dapatkan pembagian beban tertarget untuk latihan calisthenics menggunakan sabuk beban.
        </p>

        <div className="cozy-flex-col" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
          <div className="cozy-grid-3">
            {/* Input Berat Badan */}
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>BERAT BADAN (KG)</label>
              <input
                type="number"
                min="10"
                className="form-control"
                style={{ fontSize: '0.85rem', height: '36px', padding: '6px 4px', textAlign: 'center', fontFamily: 'var(--font-pixel)' }}
                value={bodyWeight}
                onChange={(e) => {
                  setBodyWeight(Number(e.target.value));
                  setOneRepMaxResult(null);
                }}
              />
            </div>

            {/* Input Beban Tambahan */}
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>BEBAN EKSTRA (KG)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                style={{ fontSize: '0.85rem', height: '36px', padding: '6px 4px', textAlign: 'center', fontFamily: 'var(--font-pixel)' }}
                value={addedWeight}
                onChange={(e) => {
                  setAddedWeight(Number(e.target.value));
                  setOneRepMaxResult(null);
                }}
              />
            </div>

            {/* Input Repetisi */}
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>REPETISI (REPS)</label>
              <input
                type="number"
                min="1"
                max="30"
                className="form-control"
                style={{ fontSize: '0.85rem', height: '36px', padding: '6px 4px', textAlign: 'center', fontFamily: 'var(--font-pixel)' }}
                value={repsDone}
                onChange={(e) => {
                  setRepsDone(Number(e.target.value));
                  setOneRepMaxResult(null);
                }}
              />
            </div>
          </div>

          <button
            onClick={calculate1RM}
            className="btn btn-study"
            style={{ width: '100%', padding: '10px' }}
          >
            HITUNG TARGET BEBAN 1RM
          </button>
        </div>

        {/* Output Hasil 1RM */}
        {oneRepMaxResult && (
          <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cozy-grid-2" style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>BEBAN EKSTRA 1RM</span>
                <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-pixel)', color: 'var(--color-debt)' }}>+{oneRepMaxResult.added1RM} kg</strong>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>TOTAL BEBAN 1RM</span>
                <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-pixel)', color: 'var(--text-primary)' }}>{oneRepMaxResult.total1RM} kg</strong>
              </div>
            </div>

            <div className="cozy-flex-col" style={{ gap: '6px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TARGET BEBAN BERDASARKAN ZONA:</span>
              
              {/* Strength Zone */}
              <div className="flex-row-between" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', padding: '8px 10px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Zona Kekuatan ({oneRepMaxResult.targets.strength.percentage})</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>{oneRepMaxResult.targets.strength.desc}</span>
                </div>
                <strong style={{ fontSize: '1rem', fontFamily: 'var(--font-pixel)', color: 'var(--text-primary)' }}>+{Math.round(oneRepMaxResult.targets.strength.load)} kg</strong>
              </div>

              {/* Hypertrophy Zone */}
              <div className="flex-row-between" style={{ background: 'rgba(146,176,151,0.05)', border: '1px solid var(--color-study)', padding: '8px 10px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'var(--color-study)' }}>Zona Hipertrofi ({oneRepMaxResult.targets.hypertrophy.percentage})</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>{oneRepMaxResult.targets.hypertrophy.desc}</span>
                </div>
                <strong style={{ fontSize: '1rem', fontFamily: 'var(--font-pixel)', color: 'var(--color-study)' }}>+{Math.round(oneRepMaxResult.targets.hypertrophy.load)} kg</strong>
              </div>

              {/* Endurance Zone */}
              <div className="flex-row-between" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', padding: '8px 10px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Zona Daya Tahan ({oneRepMaxResult.targets.endurance.percentage})</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>{oneRepMaxResult.targets.endurance.desc}</span>
                </div>
                <strong style={{ fontSize: '1rem', fontFamily: 'var(--font-pixel)', color: 'var(--text-primary)' }}>+{Math.round(oneRepMaxResult.targets.endurance.load)} kg</strong>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
