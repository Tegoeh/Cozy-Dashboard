import { Calendar, CheckCircle2, History as HistoryIcon, Info, TrendingUp, Scale } from 'lucide-react';

function WeightChart({ weightHistory }) {
  if (!weightHistory || weightHistory.length === 0) {
    return (
      <div className="card" style={{ margin: '0', textAlign: 'center', padding: '24px 12px' }}>
        <Scale style={{ width: '32px', height: '32px', color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Belum ada riwayat berat badan</h3>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '240px', margin: '4px auto 0 auto', lineHeight: '1.3' }}>
          Perbarui berat badan Anda di menu database untuk melihat grafik perkembangan.
        </p>
      </div>
    );
  }

  // Urutkan riwayat dari yang terlama ke terbaru untuk digambar di grafik
  const sortedWeightHistory = [...weightHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Let's format the date labels
  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  // Dimensions
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const weights = sortedWeightHistory.map(d => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  
  // Padding for min/max to avoid line touching the very top/bottom
  const yMin = Math.max(0, Math.floor(minW) - 1);
  const yMax = Math.ceil(maxW) + 1;
  const yRange = yMax - yMin || 1;

  // Generate coordinates
  const points = sortedWeightHistory.map((item, idx) => {
    const x = paddingLeft + (idx / (sortedWeightHistory.length - 1 || 1)) * chartWidth;
    const y = paddingTop + (1 - (item.weight - yMin) / yRange) * chartHeight;
    return { x, y, weight: item.weight, date: item.date };
  });

  // SVG paths
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    if (points.length === 1) {
      // Single point, draw a horizontal line across
      const y = points[0].y;
      linePath = `M ${paddingLeft} ${y} L ${paddingLeft + chartWidth} ${y}`;
      areaPath = `M ${paddingLeft} ${svgHeight - paddingBottom} L ${paddingLeft} ${y} L ${paddingLeft + chartWidth} ${y} L ${paddingLeft + chartWidth} ${svgHeight - paddingBottom} Z`;
    } else {
      // Multi-point line path
      linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
      // Area path closing at the bottom of the chart
      areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;
    }
  }

  // Grid lines (3 horizontal lines)
  const gridLines = [];
  const gridCount = 3;
  for (let i = 0; i <= gridCount; i++) {
    const ratio = i / gridCount;
    const y = paddingTop + ratio * chartHeight;
    const val = yMax - ratio * yRange;
    gridLines.push({ y, value: val.toFixed(1) });
  }

  // Hitung selisih
  const startW = sortedWeightHistory[0].weight;
  const endW = sortedWeightHistory[sortedWeightHistory.length - 1].weight;
  const change = endW - startW;

  return (
    <div className="card" style={{ margin: '0', padding: '16px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="flex-row-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} style={{ color: 'var(--color-study)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
            GRAFIK PROGRESS BERAT BADAN
          </span>
        </div>
        <span className="badge badge-study" style={{ fontSize: '0.68rem', fontFamily: 'var(--font-pixel)', padding: '2px 8px' }}>
          PROGRES FISIK
        </span>
      </div>

      {/* Summary Info */}
      <div className="cozy-grid-3" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
        <div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>AWAL</span>
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-pixel)', color: 'var(--text-primary)' }}>{startW.toFixed(1)} kg</span>
        </div>
        <div style={{ borderLeft: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>TERKINI</span>
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-pixel)', color: 'var(--color-study)' }}>{endW.toFixed(1)} kg</span>
        </div>
        <div style={{ borderLeft: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>SELISIH</span>
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-pixel)', color: change >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)} kg
          </span>
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          style={{ width: '100%', minWidth: '320px', height: 'auto', overflow: 'visible' }}
        >
          {/* Gradients definitions */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-study)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-study)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={line.y} 
                x2={svgWidth - paddingRight} 
                y2={line.y} 
                style={{ stroke: 'rgba(255,255,255,0.04)' }}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text 
                x={paddingLeft - 8} 
                y={line.y + 3} 
                style={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', fontSize: '10px' }}
                textAnchor="end"
              >
                {line.value} kg
              </text>
            </g>
          ))}

          {/* Area Path */}
          {areaPath && (
            <path 
              d={areaPath} 
              fill="url(#chartGradient)" 
            />
          )}

          {/* Line Path */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              style={{ stroke: 'var(--color-study)' }}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              {/* Outer glow ring */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="6" 
                style={{ fill: 'var(--color-study)', fillOpacity: 0.15 }}
              />
              {/* Inner dot */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="3.5" 
                style={{ fill: 'var(--color-study)', stroke: 'var(--bg-card)' }}
                strokeWidth="1.5"
              />
              {/* Value Label above dot */}
              <text 
                x={p.x} 
                y={p.y - 8} 
                style={{ fill: 'var(--text-primary)', fontFamily: 'var(--font-pixel)', fontSize: '10px', fontWeight: 'bold' }}
                textAnchor="middle"
              >
                {p.weight.toFixed(1)}
              </text>
              
              {/* Date Label on X Axis */}
              <text 
                x={p.x} 
                y={svgHeight - paddingBottom + 16} 
                style={{ fill: 'var(--text-muted)', fontSize: '8px', fontWeight: 'bold' }}
                textAnchor="middle"
              >
                {formatDateLabel(p.date)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function History({ progressHistory, weightHistory = [], connectionStatus }) {
  // Urutkan riwayat dari yang terbaru
  const sortedHistory = [...progressHistory].sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 16px' }}>
      
      {/* Header Card */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro" style={{ color: 'var(--color-study)' }}>
          <HistoryIcon size={16} /> RIWAYAT LATIHAN & PROGRESS
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
          Jejak konsistensi latihan fisik Anda. Semua sesi workout yang diselesaikan akan otomatis tercatat dan disinkronkan langsung ke database Google Sheets Anda.
        </p>
      </div>

      {/* Weight progression chart */}
      <WeightChart weightHistory={weightHistory} />

      {/* Warning/Offline Alert */}
      {connectionStatus !== 'connected' && (
        <div className="card" style={{ margin: '0', border: '1px solid rgba(238, 205, 163, 0.2)', background: 'rgba(238, 205, 163, 0.03)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Info size={16} style={{ color: 'var(--color-debt)', flexShrink: 0, marginTop: '2px' }} />
            <div className="cozy-flex-col" style={{ gap: '4px' }}>
              <strong style={{ fontSize: '0.78rem', color: 'var(--color-debt)' }}>MODE PENYIMPANAN LOKAL AKTIF</strong>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                Anda belum menghubungkan database cloud Google Sheets di menu pengaturan. Riwayat latihan saat ini hanya disimpan di browser lokal Anda (Local Storage) dan berisiko hilang jika cache dibersihkan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History Timeline */}
      <div className="card" style={{ margin: '0' }}>
        <div className="card-title-retro">
          ⌛ RIWAYAT KALISTENIK HARIAN
        </div>
        
        {sortedHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Calendar size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Belum ada riwayat latihan</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Selesaikan sesi latihan hari ini di Dashboard untuk mencatat pencapaian pertama Anda!
            </p>
          </div>
        ) : (
          <div style={{ 
            position: 'relative', 
            borderLeft: '2px dashed var(--border-color)', 
            marginLeft: '12px', 
            paddingLeft: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            marginTop: '8px'
          }}>
            {sortedHistory.map((item, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                
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

                {/* Content Card */}
                <div style={{ 
                  background: 'rgba(0,0,0,0.15)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '12px'
                }}>
                  <div className="flex-row-between">
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        Workout: {item.HariWorkout || 'Latihan'}
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Calendar size={10} />
                        {new Date(item.Tanggal).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <span className="badge badge-study" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      <CheckCircle2 size={10} /> {item.Status || 'Selesai'}
                    </span>
                  </div>

                  {item.Catatan && (
                    <div style={{ 
                      marginTop: '8px', 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '8px 10px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)',
                      fontSize: '0.72rem', 
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      "{item.Catatan}"
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
