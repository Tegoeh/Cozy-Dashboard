import React, { useState } from 'react';
import { Camera, X, TrendingDown, TrendingUp, ScanLine, ArrowUpRight, ArrowDownLeft, PlusCircle, AlertCircle, Sparkles, CreditCard } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { getLocalDateString } from '../utils/dateUtils';
// --- HELPER LOCAL WALLET LOGO (AGAR AMAN) ---
const LocalWalletLogo = ({ type, size = 28 }) => {
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

// --- SUB-KOMPONEN GRAFIK TREN SALDO GABUNGAN HISTORIS ---
function FinanceTrendChart({ wallets, transactions }) {
  const getBalanceHistory = () => {
    const currentBalance = Object.values(wallets).reduce((sum, v) => sum + v, 0);
    const dailyTx = {};
    transactions.forEach(tx => {
      if (tx.date) {
        if (!dailyTx[tx.date]) dailyTx[tx.date] = [];
        dailyTx[tx.date].push(tx);
      }
    });

    const sortedDatesDesc = Object.keys(dailyTx).sort((a, b) => b.localeCompare(a));
    const balancePoints = [];
    const todayStr = getLocalDateString();
    
    balancePoints.push({ date: todayStr, balance: currentBalance });
    let runningBalance = currentBalance;
    
    sortedDatesDesc.forEach(date => {
      const txs = dailyTx[date];
      let netChange = 0;
      txs.forEach(tx => {
        if (tx.type === 'expense') {
          netChange += tx.amount;
        } else {
          netChange -= tx.amount;
        }
      });
      
      runningBalance += netChange;
      if (date !== todayStr) {
        balancePoints.push({ date, balance: runningBalance });
      }
    });

    return balancePoints.reverse();
  };

  const balanceHistory = getBalanceHistory();

  if (balanceHistory.length < 2) {
    return (
      <div className="card" style={{ margin: '12px 16px', textAlign: 'center', padding: '24px 12px' }}>
        <TrendingDown style={{ width: '32px', height: '32px', color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Tren Pertumbuhan Saldo</h3>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '240px', margin: '4px auto 0 auto', lineHeight: '1.3' }}>
          Lakukan transaksi pemasukan atau pengeluaran di minimal 2 hari berbeda untuk memproyeksikan grafik tren keuangan harian Anda.
        </p>
      </div>
    );
  }

  const displayData = balanceHistory.slice(-7);
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const balanceList = displayData.map(d => d.balance);
  const minB = Math.min(...balanceList);
  const maxB = Math.max(...balanceList);
  
  const yMin = Math.max(0, minB - (minB * 0.1 || 10000));
  const yMax = maxB + (maxB * 0.1 || 10000);
  const yRange = yMax - yMin || 1;

  const points = displayData.map((item, idx) => {
    const x = paddingLeft + (idx / (displayData.length - 1 || 1)) * chartWidth;
    const y = paddingTop + (1 - (item.balance - yMin) / yRange) * chartHeight;
    return { x, y, balance: item.balance, date: item.date };
  });

  let linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
  let areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  const latest = balanceList[balanceList.length - 1];
  const previous = balanceList[balanceList.length - 2];
  const diff = latest - previous;
  const pct = previous > 0 ? Math.round((diff / previous) * 100) : 0;
  const isUp = diff >= 0;

  const formatRupiahShort = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num;
  };

  return (
    <div className="card" style={{ margin: '12px 16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="flex-row-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingDown size={16} style={{ color: 'var(--color-debt)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
            TREN PERTUMBUHAN SALDO GABUNGAN
          </span>
        </div>
        <span className={`badge ${isUp ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '0.68rem', padding: '2px 8px', fontFamily: 'var(--font-pixel)' }}>
          {isUp ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={10} /> +{Math.abs(pct)}%
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingDown size={10} /> -{Math.abs(pct)}%
            </span>
          )}
        </span>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
        Total saldo saat ini adalah <strong style={{ color: 'var(--text-primary)' }}>Rp {latest.toLocaleString('id-ID')}</strong>, mengalami {isUp ? 'kenaikan' : 'penurunan'} dibandingkan kemarin yaitu <strong style={{ color: 'var(--text-muted)' }}>Rp {previous.toLocaleString('id-ID')}</strong>.
      </p>

      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', minWidth: '320px', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="financeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-debt)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-debt)" stopOpacity="0.0" />
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
                  Rp {formatRupiahShort(val)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#financeGradient)" />
          <path d={linePath} fill="none" style={{ stroke: 'var(--color-debt)' }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="5" style={{ fill: 'var(--color-debt)', fillOpacity: 0.15 }} />
              <circle cx={p.x} cy={p.y} r="3" style={{ fill: 'var(--color-debt)', stroke: 'var(--bg-card)' }} strokeWidth="1.5" />
              
              <text x={p.x} y={p.y - 7} style={{ fill: 'var(--text-primary)', fontFamily: 'var(--font-pixel)', fontSize: '10px', fontWeight: 'bold' }} textAnchor="middle">
                {formatRupiahShort(p.balance)}
              </text>

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

export default function KeuanganTab() {
  const {
    wallets,
    transactions,
    debts,
    addTransaction,
    addDebt,
    payDebt,
    updateQuestProgress
  } = useDashboardStore();

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [txType, setTxType] = useState('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Makanan');
  const [txWallet, setTxWallet] = useState('gopay');
  const [txNote, setTxNote] = useState('');

  const [showAddDebt, setShowAddDebt] = useState(false);
  const [debtTitle, setDebtTitle] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtDue, setDebtDue] = useState('');

  const [showScanner, setShowScanner] = useState(false);
  const [scanStep, setScanStep] = useState('upload');
  const [scannedImage, setScannedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [payingDebt, setPayingDebt] = useState(null);

  const formatRupiah = (val) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

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

  const handleAddTransactionSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) return;

    addTransaction({
      id: Date.now(),
      type: txType,
      amount: amt,
      category: txCategory,
      wallet: txWallet,
      note: txNote || txCategory,
      date: getLocalDateString()
    });

    setTxAmount('');
    setTxNote('');
    setShowAddTransaction(false);
    playCafeBell();
    updateQuestProgress('quest_finance', 1);
  };

  const handleAddDebtSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(debtAmount);
    if (isNaN(amt) || amt <= 0 || !debtTitle.trim()) return;

    addDebt({
      id: Date.now(),
      title: debtTitle,
      amount: amt,
      due: debtDue || getLocalDateString(),
      paid: false
    });

    setDebtTitle('');
    setDebtAmount('');
    setDebtDue('');
    setShowAddDebt(false);
    playCozyChime(349.23, 0.2);
  };

  const handleSelectPaymentWallet = (walletKey) => {
    if (!payingDebt) return;
    const res = payDebt(payingDebt.id, payingDebt.amount, walletKey);
    if (res === false) {
      alert("Saldo tidak cukup di akun terpilih!");
    } else {
      playCafeBell();
      setPayingDebt(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScannedImage(reader.result);
        setScanStep('scanning');
        
        setTimeout(() => {
          setScanResult({
            store: "Starbucks Dipatiukur",
            date: getLocalDateString(),
            items: [
              { name: "Caramel Macchiato Grande", price: 58000 },
              { name: "Butter Croissant", price: 28000 }
            ],
            total: 86000
          });
          setScanStep('verify');
          playCafeBell();
        }, 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApproveScan = (targetWallet) => {
    if (!scanResult) return;

    addTransaction({
      id: Date.now(),
      type: 'expense',
      amount: scanResult.total,
      category: 'Makanan/Minuman',
      wallet: targetWallet,
      note: `Scan: ${scanResult.store}`,
      date: scanResult.date
    });

    setShowScanner(false);
    setScanStep('upload');
    setScannedImage(null);
    setScanResult(null);
    playCafeBell();
  };

  const getFinancialHealth = () => {
    const totalAssets = Object.values(wallets).reduce((sum, v) => sum + v, 0);
    
    // Hitung rata-rata pengeluaran harian dalam 7 hari terakhir
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentExpenses = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= sevenDaysAgo);
    
    const totalRecentExpense = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
    const dailyAverage = Math.round(totalRecentExpense / 7);
    
    let daysRemaining = Infinity;
    if (dailyAverage > 0) {
      daysRemaining = Math.max(0, Math.round(totalAssets / dailyAverage));
    }
    
    // Tagihan yang akan jatuh tempo (dalam 3 hari ke depan)
    const today = new Date();
    const urgentDebts = debts.filter(d => {
      if (d.paid) return false;
      const dueDate = new Date(d.due);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= -1 && diffDays <= 3; // Mengizinkan terlambat 1 hari
    });

    return { dailyAverage, daysRemaining, urgentDebts };
  };
  
  const { dailyAverage, daysRemaining, urgentDebts } = getFinancialHealth();

  return (
    <div className="keuangan-tab-view Content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
      
      {/* ⚠️ ALARM TAGIHAN URGENT */}
      {urgentDebts.length > 0 && (
        <div className="card" style={{ 
          margin: '0 16px', 
          border: '1px solid var(--color-expense)', 
          background: 'rgba(231,181,176,0.08)',
          borderRadius: '12px',
          padding: '12px'
        }}>
          <h4 style={{ color: 'var(--color-expense)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <AlertCircle size={14} /> ALARM JATUH TEMPO DEKAT!
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            {urgentDebts.map(d => (
              <div key={d.id} className="flex-row-between" style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>
                <span>{d.title} (Tempo: {d.due})</span>
                <strong style={{ color: 'var(--color-expense)' }}>{formatRupiah(d.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔮 ESTIMASI/PREDIKSI SALDO HABIS */}
      <div className="card" style={{ 
        margin: '0 16px', 
        border: '1px solid var(--border-color)', 
        background: 'linear-gradient(to bottom right, #1c1815, #120f0d)',
        borderRadius: '12px',
        padding: '12px'
      }}>
        <h4 style={{ color: 'var(--color-study)', fontSize: '0.78rem', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} /> PREDIKSI KEUANGAN COZY
        </h4>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {dailyAverage > 0 ? (
            <>
              Rata-rata pengeluaran Anda dalam 7 hari terakhir adalah <strong>{formatRupiah(dailyAverage)}/hari</strong>. 
              Dengan total saldo saat ini, uang jajan Anda diestimasikan akan bertahan selama <strong style={{ color: 'var(--color-study)' }}>{daysRemaining === Infinity ? 'selamanya' : `${daysRemaining} hari`} lagi</strong>.
            </>
          ) : (
            "Belum ada catatan pengeluaran dalam 7 hari terakhir. Naikkan produktivitas dan catat transaksi harian Anda!"
          )}
        </p>
      </div>

      {/* Saldo Grid */}
      <div className="wallet-grid" style={{ margin: '0 16px' }}>
        <div className="wallet-card">
          <LocalWalletLogo type="gopay" />
          <div className="wallet-details">
            <p>GOPAY</p>
            <p className="text-amount">{formatRupiah(wallets.gopay)}</p>
          </div>
        </div>
        <div className="wallet-card">
          <LocalWalletLogo type="spay" />
          <div className="wallet-details">
            <p>SHOPEEPAY</p>
            <p className="text-amount">{formatRupiah(wallets.spay)}</p>
          </div>
        </div>
        <div className="wallet-card">
          <LocalWalletLogo type="dana" />
          <div className="wallet-details">
            <p>DANA</p>
            <p className="text-amount">{formatRupiah(wallets.dana)}</p>
          </div>
        </div>
        <div className="wallet-card">
          <LocalWalletLogo type="dompet" />
          <div className="wallet-details">
            <p>TUNAI</p>
            <p className="text-amount">{formatRupiah(wallets.dompet)}</p>
          </div>
        </div>
      </div>

      {/* Grafik Tren Saldo Gabungan */}
      <FinanceTrendChart wallets={wallets} transactions={transactions} />

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', padding: '0 16px', marginBottom: '12px' }}>
        <button 
          className="btn btn-primary" 
          style={{ flex: 1, borderRadius: '12px' }} 
          onClick={() => { setShowAddTransaction(true); setTxType('expense'); }}
        >
          <TrendingDown size={14} /> CATAT MANUAL
        </button>
        <button 
          className="btn btn-outline" 
          style={{ flex: 1, borderColor: 'var(--color-debt)', color: 'var(--color-debt)', borderRadius: '12px' }}
          onClick={() => setShowScanner(true)}
        >
          <ScanLine size={14} /> SCAN STRUK AI
        </button>
      </div>

      {/* Catatan Hutang */}
      <div className="card">
        <div className="flex-row-between" style={{ marginBottom: '12px' }}>
          <div className="card-title-retro" style={{ marginBottom: 0, border: 'none', padding: 0 }}>CATATAN HUTANG</div>
          <button className="btn" style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '8px' }} onClick={() => setShowAddDebt(true)}>
            + BARU
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {debts.filter(d => !d.paid).length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>Tidak ada hutang aktif 🎉</p>
          ) : (
            debts.filter(d => !d.paid).map(d => (
              <div key={d.id} className="flex-row-between" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{d.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tempo: {d.due}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontFamily: 'var(--font-pixel)', color: 'var(--color-expense)' }}>
                    {formatRupiah(d.amount)}
                  </span>
                  
                  <button 
                    className="btn btn-study" 
                    style={{ padding: '4px 8px', fontSize: '0.65rem', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setPayingDebt(d)}
                  >
                    LUNAS
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Histori Transaksi */}
      <div className="card">
        <div className="card-title-retro">HISTORI TRANSAKSI</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions.map(t => (
            <div key={t.id} className="flex-row-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  background: t.type === 'expense' ? 'rgba(231,181,176,0.1)' : 'rgba(162,199,181,0.1)',
                  color: t.type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)',
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  {t.type === 'expense' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{t.note}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t.date} • <span style={{ textTransform: 'uppercase' }}>{t.wallet}</span>
                  </p>
                </div>
              </div>
              <strong style={{ 
                fontFamily: 'var(--font-pixel)', 
                fontSize: '1.25rem',
                color: t.type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)'
              }}>
                {t.type === 'expense' ? '-' : '+'}{formatRupiah(t.amount)}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CATAT TRANSAKSI */}
      {showAddTransaction && (
        <div className="scanner-overlay">
          <div className="scanner-modal">
            <div className="flex-row-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-pixel)', color: 'var(--text-primary)' }}>CATAT TRANSAKSI</h3>
              <button className="btn" style={{ padding: '4px', borderRadius: '8px' }} onClick={() => setShowAddTransaction(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTransactionSubmit}>
              <div className="form-group">
                <label>TIPE TRANSAKSI:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ flex: 1, background: txType === 'expense' ? 'var(--color-expense)' : 'transparent', color: txType === 'expense' ? 'var(--bg-dark)' : 'var(--text-primary)', borderRadius: '8px' }}
                    onClick={() => { setTxType('expense'); setTxCategory('Makanan'); }}
                  >
                    PENGELUARAN
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ flex: 1, background: txType === 'income' ? 'var(--color-income)' : 'transparent', color: txType === 'income' ? 'var(--bg-dark)' : 'var(--text-primary)', borderRadius: '8px' }}
                    onClick={() => { setTxType('income'); setTxCategory('Freelance'); }}
                  >
                    PEMASUKAN
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>JUMLAH (RP):</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="25000" 
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>DOMPET DIGITAL:</label>
                <select className="form-control" value={txWallet} onChange={(e) => setTxWallet(e.target.value)}>
                  <option value="gopay">GoPay</option>
                  <option value="spay">ShopeePay</option>
                  <option value="dana">Dana</option>
                  <option value="dompet">Dompet Fisik</option>
                </select>
              </div>

              <div className="form-group">
                <label>KATEGORI:</label>
                <select className="form-control" value={txCategory} onChange={(e) => setTxCategory(e.target.value)}>
                  {txType === 'expense' ? (
                    <>
                      <option value="Makanan">Makanan & Kopi</option>
                      <option value="Transportasi">Transportasi</option>
                      <option value="Pendidikan">Buku / Belajar</option>
                      <option value="Hiburan">Main / Cafe</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Freelance">Freelance</option>
                      <option value="Gaji">Uang Saku / Gaji</option>
                      <option value="Hadiah">Hadiah / Cashback</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>CATATAN:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Misal: Beli Matcha Latte" 
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', borderRadius: '10px' }}>
                SIMPAN CATATAN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH HUTANG */}
      {showAddDebt && (
        <div className="scanner-overlay">
          <div className="scanner-modal">
            <div className="flex-row-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-pixel)' }}>CATAT HUTANG BARU</h3>
              <button className="btn" style={{ padding: '4px', borderRadius: '8px' }} onClick={() => setShowAddDebt(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddDebtSubmit}>
              <div className="form-group">
                <label>NAMA HUTANG / DISKRIPSI:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Contoh: Utang Kopi ke Rian" 
                  required
                  value={debtTitle}
                  onChange={(e) => setDebtTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>JUMLAH HUTANG (RP):</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="20000" 
                  required
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>TANGGAL JATUH TEMPO:</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={debtDue}
                  onChange={(e) => setDebtDue(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-study" style={{ width: '100%', marginTop: '10px', borderRadius: '10px' }}>
                CATAT HUTANG
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AI SCAN STRUK */}
      {showScanner && (
        <div className="scanner-overlay">
          <div className="scanner-modal" style={{ textAlign: 'center' }}>
            <div className="flex-row-between" style={{ marginBottom: '16px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-pixel)' }}>[AI] SCAN STRUK CAFE</h3>
              <button className="btn" style={{ padding: '4px', borderRadius: '8px' }} onClick={() => setShowScanner(false)}>
                <X size={16} />
              </button>
            </div>

            {scanStep === 'upload' && (
              <div style={{ padding: '20px 0' }}>
                <div style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: '16px',
                  padding: '30px 10px', 
                  marginBottom: '20px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '12px'
                }}>
                  <Camera size={40} color="var(--text-secondary)" />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Unggah foto struk belanjaan / cafe untuk dianalisis oleh AI.
                  </p>
                  <label className="btn btn-primary" style={{ cursor: 'pointer', borderRadius: '10px' }}>
                    + UNGGAH FOTO STRUK
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Deteksi tulisan cerdas didukung oleh Google Gemini Vision AI.
                </p>
              </div>
            )}

            {scanStep === 'scanning' && (
              <div style={{ padding: '30px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                {scannedImage && (
                  <div style={{ position: 'relative', width: '120px', height: '150px', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                    <img src={scannedImage} alt="Struk" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '4px', 
                      background: 'var(--color-debt)', 
                      animation: 'scanLineAnim 1.2s ease-in-out infinite',
                    }}></div>
                  </div>
                )}
                <div className="pixel-loading">membaca data struk...</div>
                <style>{`
                  @keyframes scanLineAnim {
                    0% { top: 0%; }
                    50% { top: 100%; }
                    100% { top: 0%; }
                  }
                `}</style>
              </div>
            )}

            {scanStep === 'verify' && scanResult && (
              <div style={{ textAlign: 'left', padding: '10px 0' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NAMA TOKO</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{scanResult.store}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanggal: {scanResult.date}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>ITEM TERDETEKSI:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {scanResult.items.map((item, idx) => (
                      <div key={idx} className="flex-row-between" style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.15)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span>{item.name}</span>
                        <strong style={{ fontFamily: 'monospace' }}>{formatRupiah(item.price)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-row-between" style={{ 
                  background: 'rgba(146, 176, 151, 0.1)', 
                  padding: '12px', 
                  borderRadius: '12px',
                  border: '1px solid var(--color-study)',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-primary)' }}>TOTAL TRANSAKSI</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-study)', fontFamily: 'var(--font-pixel)' }}>
                    {formatRupiah(scanResult.total)}
                  </strong>
                </div>

                <div className="form-group">
                  <label>PILIH SUMBER PEMBAYARAN:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ fontSize: '0.72rem', borderRadius: '8px' }} onClick={() => handleApproveScan('gopay')}>GoPay</button>
                    <button className="btn btn-outline" style={{ fontSize: '0.72rem', borderRadius: '8px' }} onClick={() => handleApproveScan('spay')}>ShopeePay</button>
                    <button className="btn btn-outline" style={{ fontSize: '0.72rem', borderRadius: '8px' }} onClick={() => handleApproveScan('dana')}>Dana</button>
                    <button className="btn btn-outline" style={{ fontSize: '0.72rem', borderRadius: '8px' }} onClick={() => handleApproveScan('dompet')}>Tunai</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💳 COZY PAYMENT MODAL (PELUNASAN HUTANG) */}
      {payingDebt && (
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
            maxWidth: '360px',
            margin: 0,
            background: 'linear-gradient(to bottom right, #1c1815, #120f0d)',
            border: '2px solid var(--border-color)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'cozy-fade-in 0.25s ease-out'
          }}>
            <div className="flex-row-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--color-expense)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={16} /> LUNASI HUTANG
              </span>
              <button 
                className="btn btn-outline" 
                style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                onClick={() => setPayingDebt(null)}
              >
                BATAL
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
              Anda akan melunasi <strong>{payingDebt.title}</strong> sebesar <strong style={{ color: 'var(--color-expense)' }}>{formatRupiah(payingDebt.amount)}</strong>.
            </p>
            
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Pilih dompet pembayaran Anda:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {Object.entries(wallets).map(([key, balance]) => (
                <button
                  key={key}
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 6px',
                    borderRadius: '12px',
                    borderColor: 'var(--border-color)',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectPaymentWallet(key)}
                >
                  <LocalWalletLogo type={key} size={24} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{key}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)' }}>
                    {formatRupiah(balance)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
