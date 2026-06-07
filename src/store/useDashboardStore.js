import { create } from 'zustand';
import { DEFAULT_JADWAL } from '../utils/mockData';
import { getLocalDateString } from '../utils/dateUtils';

export const useDashboardStore = create((set, get) => ({
  // ================= STATE BELAJAR =================
  subjects: JSON.parse(localStorage.getItem('cozy_subjects')) || [
    { id: 1, name: 'Coding (React/Vite)', color: '#92b097', totalTime: 1800 },
    { id: 2, name: 'UI/UX Design', color: '#a39081', totalTime: 1200 },
    { id: 3, name: 'Bahasa Inggris', color: '#9ec5d9', totalTime: 600 }
  ],
  studyHistory: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('cozy_study_history'));
      return Array.isArray(val) ? val : [];
    } catch { return []; }
  })(),
  selectedSubjectId: Number(localStorage.getItem('cozy_selected_subject_id')) || 1,
  timerRunning: false,
  timerType: 'stopwatch', // 'stopwatch' | 'pomodoro'
  pomoSession: 'study', // 'study' | 'break'
  pomoTimeLeft: 25 * 60,

  // ================= STATE KEUANGAN =================
  wallets: JSON.parse(localStorage.getItem('cozy_wallets')) || {
    gopay: 150000,
    spay: 75000,
    dana: 200000,
    dompet: 50000
  },
  debts: JSON.parse(localStorage.getItem('cozy_debts')) || [
    { id: 1, title: 'Patungan Makan', amount: 35000, due: '2026-06-10', paid: false },
    { id: 2, title: 'Cicilan HP', amount: 150000, due: '2026-06-15', paid: false }
  ],
  transactions: JSON.parse(localStorage.getItem('cozy_transactions')) || [
    { id: 1, type: 'expense', amount: 15000, category: 'Makanan', wallet: 'dompet', note: 'Kopi Susu & Croissant', date: '2026-06-05' },
    { id: 2, type: 'income', amount: 500000, category: 'Freelance', wallet: 'gopay', note: 'Project Desain Menu Cafe', date: '2026-06-04' },
    { id: 3, type: 'expense', amount: 25000, category: 'Transportasi', wallet: 'gopay', note: 'Gojek ke Cozy Cafe', date: '2026-06-04' }
  ],

  coins: Number(localStorage.getItem('cozy_coins')) || 15,
  waterMlToday: Number(localStorage.getItem('cozy_water_ml_today')) || 0,
  petMood: localStorage.getItem('cozy_pet_mood') || 'Biasa',
  petLastInteraction: localStorage.getItem('cozy_pet_last_interaction') || '',
  hydrationNotificationOption: localStorage.getItem('cozy_hydration_notification_option') || 'off',

  // ================= STATE WORKOUT RPG =================
  webAppUrl: localStorage.getItem('calisthenics_web_app_url') || 'https://script.google.com/macros/s/AKfycbxstiZ_TZF4h03jXIG5oUvcrPC4Q1KmhJuOnPDr9iZJ0OG87A0I4zFvrpJ2Xp0OCYej/exec',
  connectionStatus: 'offline', // Status koneksi database Google Sheets (connected | offline)
  jadwal: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('calisthenics_jadwal'));
      return Array.isArray(val) ? val : DEFAULT_JADWAL;
    } catch { return DEFAULT_JADWAL; }
  })(),
  progressHistory: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('calisthenics_progress_history'));
      return Array.isArray(val) ? val : [];
    } catch { return []; }
  })(),
  mealHistory: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('calisthenics_meal_history'));
      return Array.isArray(val) ? val : [];
    } catch { return []; }
  })(),
  activeWorkout: null,
  targetCalories: Number(localStorage.getItem('calisthenics_target_calories') || '2800'),
  targetProtein: Number(localStorage.getItem('calisthenics_target_protein') || '80'),
  weight: Number(localStorage.getItem('calisthenics_weight') || '45'),
  height: Number(localStorage.getItem('calisthenics_height') || '172'),
  weightHistory: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('calisthenics_weight_history'));
      if (Array.isArray(val)) return val;
    } catch {}
    return [
      { weight: 44.0, date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { weight: 44.5, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { weight: 45.0, date: new Date().toISOString().split('T')[0] }
    ];
  })(),
  lastPhysiqueUpdate: localStorage.getItem('calisthenics_last_physique_update') || '',
  personalRecords: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('calisthenics_personal_records'));
      if (val && typeof val === 'object' && !Array.isArray(val)) return val;
    } catch {}
    return { pullup: 0, pushup: 0, dips: 0, lsit: 0, plank: 0, handstand: 0 };
  })(),
  
  // RPG State
  rpgLevel: Number(localStorage.getItem('calisthenics_rpg_level') || '1'),
  rpgXp: Number(localStorage.getItem('calisthenics_rpg_xp') || '0'),
  rpgCoins: Number(localStorage.getItem('calisthenics_rpg_coins') || '0'),
  rpgBossesDefeated: Number(localStorage.getItem('calisthenics_rpg_bosses_defeated') || '0'),
  rpgBadges: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('calisthenics_rpg_badges'));
      return Array.isArray(val) ? val : [];
    } catch { return []; }
  })(),
  rpgInventory: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('calisthenics_rpg_inventory'));
      return Array.isArray(val) ? val : [];
    } catch { return []; }
  })(),
  rpgEquipped: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('calisthenics_rpg_equipped'));
      if (val && typeof val === 'object' && !Array.isArray(val)) return val;
    } catch {}
    return { weapon: null, armor: null, shield: null };
  })(),
  dailyQuests: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('calisthenics_rpg_quests'));
      if (Array.isArray(val) && val.length > 0) return val;
    } catch {}
    return [
      { id: "quest_boss", text: "Kalahkan 1 Bos Pertarungan", target: 1, current: 0, rewardCoins: 40, rewardXp: 50, completed: false, claimed: false },
      { id: "quest_reps", text: "Lakukan total 25 Repetisi Latihan", target: 25, current: 0, rewardCoins: 30, rewardXp: 30, completed: false, claimed: false },
      { id: "quest_water", text: "Minum air minimal 1000ml hari ini", target: 1000, current: 0, rewardCoins: 20, rewardXp: 20, completed: false, claimed: false },
      { id: "quest_study", text: "Selesaikan 1 sesi fokus belajar (25 Menit)", target: 1, current: 0, rewardCoins: 30, rewardXp: 30, completed: false, claimed: false },
      { id: "quest_finance", text: "Catat 1 transaksi keuangan hari ini", target: 1, current: 0, rewardCoins: 20, rewardXp: 20, completed: false, claimed: false }
    ];
  })(),
  gratitudeJournal: (() => {
    try {
      const val = JSON.parse(localStorage.getItem('cozy_gratitude_journal'));
      return Array.isArray(val) ? val : [];
    } catch { return []; }
  })(),

  // ================= ACTIONS (MUTATIONS) =================

  // BELAJAR ACTIONS
  addSubject: (name, color) => set((state) => {
    const updated = [...state.subjects, { id: Date.now(), name, color, totalTime: 0 }];
    localStorage.setItem('cozy_subjects', JSON.stringify(updated));
    return { subjects: updated };
  }),
  deleteSubject: (id) => set((state) => {
    if (state.subjects.length <= 1) {
      alert("Minimal harus ada 1 subjek belajar aktif!");
      return {};
    }
    const updated = state.subjects.filter(s => s.id !== id);
    localStorage.setItem('cozy_subjects', JSON.stringify(updated));
    
    let nextActiveId = state.selectedSubjectId;
    if (state.selectedSubjectId === id) {
      nextActiveId = updated[0].id;
      localStorage.setItem('cozy_selected_subject_id', nextActiveId.toString());
    }
    
    return { subjects: updated, selectedSubjectId: nextActiveId };
  }),
  setSelectedSubjectId: (id) => set(() => {
    localStorage.setItem('cozy_selected_subject_id', id.toString());
    return { selectedSubjectId: id };
  }),
  setTimerRunning: (isRunning) => set({ timerRunning: isRunning }),
  setTimerType: (type) => set({ timerType: type }),
  setPomoSession: (session) => set({ pomoSession: session }),
  setPomoTimeLeft: (time) => set({ pomoTimeLeft: time }),
  incrementSubjectTime: (id, amount = 1) => set((state) => {
    // 1. Update totalTime global subjek
    const updatedSubjects = state.subjects.map(s => 
      s.id === id ? { ...s, totalTime: s.totalTime + amount } : s
    );
    localStorage.setItem('cozy_subjects', JSON.stringify(updatedSubjects));

    // 2. Update studyHistory untuk tanggal lokal hari ini
    const today = getLocalDateString();
    const matchedSubject = state.subjects.find(s => s.id === id);
    const subjectName = matchedSubject ? matchedSubject.name : 'Unknown';
    const subjectColor = matchedSubject ? matchedSubject.color : '#92b097';

    let historyUpdated = false;
    const updatedHistory = state.studyHistory.map(h => {
      if (h.subjectId === id && h.date === today) {
        historyUpdated = true;
        return { ...h, duration: h.duration + amount };
      }
      return h;
    });

    if (!historyUpdated) {
      updatedHistory.push({
        id: Date.now() + Math.random(),
        subjectId: id,
        subjectName,
        subjectColor,
        date: today,
        duration: amount
      });
    }

    localStorage.setItem('cozy_study_history', JSON.stringify(updatedHistory));
    return { subjects: updatedSubjects, studyHistory: updatedHistory };
  }),
  addCoins: (amount) => set((state) => {
    const next = state.coins + amount;
    localStorage.setItem('cozy_coins', next.toString());
    return { coins: next };
  }),
  incrementWater: (amount) => set((state) => {
    const next = Math.max(0, state.waterMlToday + amount);
    localStorage.setItem('cozy_water_ml_today', next.toString());
    
    let coinsGained = 0;
    if (next >= 2000 && state.waterMlToday < 2000) {
      coinsGained = 2;
    }
    
    const nextCoins = state.coins + coinsGained;
    if (coinsGained > 0) {
      localStorage.setItem('cozy_coins', nextCoins.toString());
      alert("Selamat! Target hidrasi harian 2000ml tercapai! Hadiah hidrasi +2 Koin Cozy! 💧🎉");
    }

    const updatedQuests = state.dailyQuests.map(q => {
      if (q.id === "quest_water") {
        const currentVal = Math.min(q.target, next);
        const completed = currentVal >= q.target;
        return { ...q, current: currentVal, completed };
      }
      return q;
    });
    localStorage.setItem('calisthenics_rpg_quests', JSON.stringify(updatedQuests));
    
    return { waterMlToday: next, coins: nextCoins, dailyQuests: updatedQuests };
  }),
  decrementWater: (amount) => set((state) => {
    const next = Math.max(0, state.waterMlToday - amount);
    localStorage.setItem('cozy_water_ml_today', next.toString());
    return { waterMlToday: next };
  }),
  setHydrationNotificationOption: (val) => set(() => {
    localStorage.setItem('cozy_hydration_notification_option', val);
    return { hydrationNotificationOption: val };
  }),
  interactWithPet: (interactionType, cost) => set((state) => {
    if (state.coins < cost) return false;
    
    const nextCoins = state.coins - cost;
    localStorage.setItem('cozy_coins', nextCoins.toString());
    
    let nextMood = 'Biasa';
    let rewardXp = 0;
    
    if (interactionType === 'feed') {
      nextMood = 'Kenyang';
      rewardXp = 10;
    } else if (interactionType === 'play') {
      nextMood = 'Gembira';
      rewardXp = 15;
    } else if (interactionType === 'pet') {
      nextMood = 'Manja';
      rewardXp = 5;
    } else if (interactionType === 'feed_catnip') {
      nextMood = 'Gembira';
      rewardXp = 15;
    } else if (interactionType === 'feed_salmon') {
      nextMood = 'Kenyang';
      rewardXp = 30;
    } else if (interactionType === 'feed_biscuit') {
      nextMood = 'Manja';
      rewardXp = 10;
    }
    
    localStorage.setItem('cozy_pet_mood', nextMood);
    localStorage.setItem('cozy_pet_last_interaction', new Date().toISOString());
    
    let nextXp = state.rpgXp + rewardXp;
    let nextLevel = state.rpgLevel;
    let xpNeeded = nextLevel * 150;
    while (nextXp >= xpNeeded) {
      nextXp -= xpNeeded;
      nextLevel += 1;
      xpNeeded = nextLevel * 150;
    }
    localStorage.setItem('calisthenics_rpg_level', nextLevel.toString());
    localStorage.setItem('calisthenics_rpg_xp', nextXp.toString());
    
    return { 
      coins: nextCoins, 
      petMood: nextMood, 
      rpgXp: nextXp, 
      rpgLevel: nextLevel 
    };
  }),
  saveGratitudeEntry: (entry1, entry2, entry3) => set((state) => {
    const today = getLocalDateString();
    const alreadySaved = state.gratitudeJournal.some(j => j.date === today);
    if (alreadySaved) {
      alert("Anda sudah mencatat jurnal syukur untuk hari ini! Kembali lagi besok ya. ❤️");
      return {};
    }

    const newEntry = {
      id: Date.now().toString(),
      date: today,
      entries: [entry1, entry2, entry3]
    };

    const updatedJournal = [newEntry, ...state.gratitudeJournal];
    localStorage.setItem('cozy_gratitude_journal', JSON.stringify(updatedJournal));

    const nextCoins = state.coins + 5;
    localStorage.setItem('cozy_coins', nextCoins.toString());
    
    alert("Jurnal syukur disimpan! Anda mendapatkan +5 Koin Cozy! 🌟🙏");
    
    return { gratitudeJournal: updatedJournal, coins: nextCoins };
  }),

  // KEUANGAN ACTIONS
  addTransaction: (tx) => set((state) => {
    const updatedTx = [tx, ...state.transactions];
    localStorage.setItem('cozy_transactions', JSON.stringify(updatedTx));
    
    // Update Wallet Saldo
    const updatedWallets = { ...state.wallets };
    if (tx.type === 'expense') {
      updatedWallets[tx.wallet] -= tx.amount;
    } else {
      updatedWallets[tx.wallet] += tx.amount;
    }
    localStorage.setItem('cozy_wallets', JSON.stringify(updatedWallets));

    return { transactions: updatedTx, wallets: updatedWallets };
  }),
  addDebt: (debt) => set((state) => {
    const updated = [debt, ...state.debts];
    localStorage.setItem('cozy_debts', JSON.stringify(updated));
    return { debts: updated };
  }),
  payDebt: (id, amount, walletKey) => set((state) => {
    if (state.wallets[walletKey] < amount) return false;

    // Tandai lunas
    const updatedDebts = state.debts.map(d => d.id === id ? { ...d, paid: true } : d);
    localStorage.setItem('cozy_debts', JSON.stringify(updatedDebts));

    // Kurangi saldo dompet
    const updatedWallets = { ...state.wallets };
    updatedWallets[walletKey] -= amount;
    localStorage.setItem('cozy_wallets', JSON.stringify(updatedWallets));

    // Tambahkan transaksi
    const matchedDebt = state.debts.find(d => d.id === id);
    const tx = {
      id: Date.now(),
      type: 'expense',
      amount: amount,
      category: 'Bayar Hutang',
      wallet: walletKey,
      note: `Bayar Hutang: ${matchedDebt.title}`,
      date: getLocalDateString()
    };
    const updatedTx = [tx, ...state.transactions];
    localStorage.setItem('cozy_transactions', JSON.stringify(updatedTx));

    return { debts: updatedDebts, wallets: updatedWallets, transactions: updatedTx };
  }),

  // WORKOUT ACTIONS
  setWebAppUrl: (url) => set(() => {
    localStorage.setItem('calisthenics_web_app_url', url);
    return { webAppUrl: url };
  }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  testConnection: async (url) => {
    const targetUrl = url || get().webAppUrl;
    if (!targetUrl) {
      set({ connectionStatus: 'offline' });
      return false;
    }
    try {
      const res = await fetch(`${targetUrl}?test=1`);
      const data = await res.json();
      if (data.status === "success") {
        set({ connectionStatus: 'connected' });
        
        // Tarik data jadwal terbaru dari database jika ada
        if (data.jadwal && data.jadwal.length > 0) {
          localStorage.setItem('calisthenics_jadwal', JSON.stringify(data.jadwal));
          set({ jadwal: data.jadwal });
        }
        
        // Tarik dan normalisasi data progress history dari database
        if (data.progress) {
          const normalizedProgress = data.progress.map(p => ({
            Tanggal: p.Tanggal || p.tanggal || new Date().toISOString(),
            HariWorkout: p.HariWorkout || p.hariWorkout || '',
            Status: p.Status || p.status || 'Selesai',
            Catatan: p.Catatan || p.catatan || ''
          }));
          localStorage.setItem('calisthenics_progress_history', JSON.stringify(normalizedProgress));
          set({ progressHistory: normalizedProgress });
        }
        
        // Tarik dan normalisasi data makanan dari database (memetakan bhs Indonesia/Inggris & huruf besar/kecil)
        if (data.makanan) {
          const normalizedMakanan = data.makanan.map(m => ({
            id: m.Id || m.id || Date.now().toString(),
            tanggal: m.Tanggal || m.tanggal || getLocalDateString(),
            foodName: m.NamaMakanan || m.foodName || '',
            calories: Number(m.Kalori || m.calories || 0),
            protein: Number(m.Protein || m.protein || 0),
            carbs: Number(m.Karbohidrat || m.carbs || 0),
            fat: Number(m.Lemak || m.fat || 0),
            timestamp: m.Timestamp || m.timestamp || new Date().toISOString()
          }));
          localStorage.setItem('calisthenics_meal_history', JSON.stringify(normalizedMakanan));
          set({ mealHistory: normalizedMakanan });
        }
        
        return true;
      }
    } catch (e) {
      console.error("Gagal melakukan pengetesan koneksi database Sheets:", e);
    }
    set({ connectionStatus: 'offline' });
    return false;
  },
  setJadwal: (newJadwal) => set(() => {
    localStorage.setItem('calisthenics_jadwal', JSON.stringify(newJadwal));
    return { jadwal: newJadwal };
  }),
  setProgressHistory: (history) => set(() => {
    localStorage.setItem('calisthenics_progress_history', JSON.stringify(history));
    return { progressHistory: history };
  }),
  setActiveWorkout: (activeWorkout) => set({ activeWorkout }),
  setMealHistory: (history) => set(() => {
    localStorage.setItem('calisthenics_meal_history', JSON.stringify(history));
    return { mealHistory: history };
  }),
  setPhysique: (w, h) => set((state) => {
    localStorage.setItem('calisthenics_weight', w.toString());
    localStorage.setItem('calisthenics_height', h.toString());
    const today = getLocalDateString();
    localStorage.setItem('calisthenics_last_physique_update', today);
    
    // Update history
    const nextHistory = [...state.weightHistory.filter(h => h.date !== today), { weight: w, date: today }];
    localStorage.setItem('calisthenics_weight_history', JSON.stringify(nextHistory));

    return { weight: w, height: h, lastPhysiqueUpdate: today, weightHistory: nextHistory };
  }),
  updatePR: (key, val) => set((state) => {
    const updated = { ...state.personalRecords, [key]: Number(val) };
    localStorage.setItem('calisthenics_personal_records', JSON.stringify(updated));
    return { personalRecords: updated };
  }),
  addWorkoutProgress: (prog) => set((state) => {
    const nextHistory = [prog, ...state.progressHistory];
    localStorage.setItem('calisthenics_progress_history', JSON.stringify(nextHistory));
    return { progressHistory: nextHistory };
  }),

  // RPG ACTIONS
  addRpgXpAndCoins: (xpGained, coinsGained, newBadge = null) => set((state) => {
    let nextXp = state.rpgXp + xpGained;
    let nextLevel = state.rpgLevel;
    let xpNeeded = nextLevel * 150;
    
    while (nextXp >= xpNeeded) {
      nextXp -= xpNeeded;
      nextLevel += 1;
      xpNeeded = nextLevel * 150;
    }
    
    localStorage.setItem('calisthenics_rpg_level', nextLevel.toString());
    localStorage.setItem('calisthenics_rpg_xp', nextXp.toString());
    
    // Koin RPG digabung ke koin Cozy global!
    const nextGlobalCoins = state.coins + coinsGained;
    localStorage.setItem('cozy_coins', nextGlobalCoins.toString());

    let nextBadges = [...state.rpgBadges];
    if (newBadge && !nextBadges.includes(newBadge)) {
      nextBadges.push(newBadge);
      localStorage.setItem('calisthenics_rpg_badges', JSON.stringify(nextBadges));
    }

    return { 
      rpgLevel: nextLevel, 
      rpgXp: nextXp, 
      coins: nextGlobalCoins, 
      rpgBadges: nextBadges 
    };
  }),
  buyItem: (itemName, cost, itemType, stats) => set((state) => {
    if (state.coins < cost) return false;

    // Kurangi koin Cozy global
    const nextGlobalCoins = state.coins - cost;
    localStorage.setItem('cozy_coins', nextGlobalCoins.toString());

    // Masukkan ke inventory
    const newItem = { id: stats.id || Date.now().toString(), name: itemName, type: itemType, ...stats };
    const nextInventory = [...state.rpgInventory, newItem];
    localStorage.setItem('calisthenics_rpg_inventory', JSON.stringify(nextInventory));

    return { coins: nextGlobalCoins, rpgInventory: nextInventory };
  }),
  equipItem: (item) => set((state) => {
    const nextEquipped = { ...state.rpgEquipped };
    if (item.type === 'weapon') nextEquipped.weapon = item;
    if (item.type === 'armor') nextEquipped.armor = item;
    if (item.type === 'shield') nextEquipped.shield = item;
    
    localStorage.setItem('calisthenics_rpg_equipped', JSON.stringify(nextEquipped));
    return { rpgEquipped: nextEquipped };
  }),
  incrementBossDefeated: () => set((state) => {
    const next = state.rpgBossesDefeated + 1;
    localStorage.setItem('calisthenics_rpg_bosses_defeated', next.toString());
    return { rpgBossesDefeated: next };
  }),
  setDailyQuests: (quests) => set(() => {
    localStorage.setItem('calisthenics_rpg_quests', JSON.stringify(quests));
    return { dailyQuests: quests };
  }),
  updateQuestProgress: (questId, increment = 1) => set((state) => {
    const updatedQuests = state.dailyQuests.map(q => {
      if (q.id === questId && !q.completed) {
        const nextVal = q.current + increment;
        return {
          ...q,
          current: Math.min(nextVal, q.target),
          completed: nextVal >= q.target
        };
      }
      return q;
    });
    localStorage.setItem('calisthenics_rpg_quests', JSON.stringify(updatedQuests));
    return { dailyQuests: updatedQuests };
  }),
  claimQuestReward: (questId) => set((state) => {
    const quest = state.dailyQuests.find(q => q.id === questId);
    if (quest && quest.completed && !quest.claimed) {
      const updatedQuests = state.dailyQuests.map(q => 
        q.id === questId ? { ...q, claimed: true } : q
      );
      localStorage.setItem('calisthenics_rpg_quests', JSON.stringify(updatedQuests));
      
      let nextXp = state.rpgXp + quest.rewardXp;
      let nextLevel = state.rpgLevel;
      let xpNeeded = nextLevel * 150;
      while (nextXp >= xpNeeded) {
        nextXp -= xpNeeded;
        nextLevel += 1;
        xpNeeded = nextLevel * 150;
      }
      localStorage.setItem('calisthenics_rpg_level', nextLevel.toString());
      localStorage.setItem('calisthenics_rpg_xp', nextXp.toString());

      const nextGlobalCoins = state.coins + quest.rewardCoins;
      localStorage.setItem('cozy_coins', nextGlobalCoins.toString());

      alert(`Misi Selesai! Reward diklaim: +${quest.rewardCoins} Koin Cozy & +${quest.rewardXp} XP RPG! 🎉`);
      
      return { 
        dailyQuests: updatedQuests,
        rpgLevel: nextLevel,
        rpgXp: nextXp,
        coins: nextGlobalCoins
      };
    }
    return {};
  }),
  checkDailyReset: () => {
    const today = getLocalDateString();
    const lastResetDate = localStorage.getItem('cozy_last_reset_date') || '';
    
    if (lastResetDate !== today) {
      const defaultQuests = [
        { id: "quest_boss", text: "Kalahkan 1 Bos Pertarungan", target: 1, current: 0, rewardCoins: 40, rewardXp: 50, completed: false, claimed: false },
        { id: "quest_reps", text: "Lakukan total 25 Repetisi Latihan", target: 25, current: 0, rewardCoins: 30, rewardXp: 30, completed: false, claimed: false },
        { id: "quest_water", text: "Minum air minimal 1000ml hari ini", target: 1000, current: 0, rewardCoins: 20, rewardXp: 20, completed: false, claimed: false },
        { id: "quest_study", text: "Selesaikan 1 sesi fokus belajar (25 Menit)", target: 1, current: 0, rewardCoins: 30, rewardXp: 30, completed: false, claimed: false },
        { id: "quest_finance", text: "Catat 1 transaksi keuangan hari ini", target: 1, current: 0, rewardCoins: 20, rewardXp: 20, completed: false, claimed: false }
      ];
      localStorage.setItem('calisthenics_rpg_quests', JSON.stringify(defaultQuests));
      localStorage.setItem('cozy_last_reset_date', today);
      
      localStorage.setItem('cozy_water_cups_today', '0');
      localStorage.setItem('cozy_water_ml_today', '0');
      localStorage.setItem('cozy_pet_mood', 'Biasa');
      
      set({ 
        dailyQuests: defaultQuests,
        waterMlToday: 0,
        petMood: 'Biasa'
      });
      console.log(`[Cozy Reset] Berhasil mereset quest harian untuk tanggal baru: ${today}`);
    }
  }
}));
