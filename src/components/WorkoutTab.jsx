import React, { useState } from 'react';
import { Dumbbell, Calendar, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import Dashboard from './Dashboard';
import WorkoutSession from './WorkoutSession';
import History from './History';
import CalisthenicsGuide from './CalisthenicsGuide';
import Settings from './Settings';

export default function WorkoutTab() {
  // Ambil state dan action dari Zustand global store
  const {
    webAppUrl,
    setWebAppUrl,
    jadwal,
    setJadwal,
    progressHistory,
    setProgressHistory,
    mealHistory,
    weightHistory,
    targetCalories,
    targetProtein,
    weight,
    height,
    setPhysique,
    lastPhysiqueUpdate,
    personalRecords,
    updatePR,
    rpgLevel,
    rpgXp,
    coins, // Koin global Cozy Cafe
    rpgBossesDefeated,
    rpgBadges,
    rpgInventory,
    rpgEquipped,
    dailyQuests,
    buyItem,
    equipItem,
    incrementBossDefeated,
    addRpgXpAndCoins,
    claimQuestReward,
    updateQuestProgress,
    activeWorkout,      // Menggunakan state activeWorkout dari Zustand global
    setActiveWorkout,   // Menggunakan action global
    connectionStatus,   // Status koneksi global dari store
    testConnection      // Fungsi tes koneksi global
  } = useDashboardStore();

  const [workoutActiveTab, setWorkoutActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // --- HANDLERS WORKOUT ---
  const handleStartWorkout = (day, workoutList) => {
    setActiveWorkout({ day, workoutList });
  };

  const handleFinishWorkout = async (day, notes) => {
    const newRecord = {
      Tanggal: new Date().toISOString(),
      HariWorkout: day,
      Status: "Selesai",
      Catatan: notes
    };

    setLoading(true);

    const updatedHistory = [newRecord, ...progressHistory];
    setProgressHistory(updatedHistory);

    if (connectionStatus === 'connected' && webAppUrl) {
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            tanggal: newRecord.Tanggal.split('T')[0],
            hariWorkout: newRecord.HariWorkout,
            status: newRecord.Status,
            catatan: newRecord.Catatan
          })
        });
      } catch (error) {
        console.error("Gagal sinkronisasi data latihan ke cloud Sheets:", error);
      }
    }

    setLoading(false);
    setActiveWorkout(null);
    setWorkoutActiveTab('history');
  };

  const handleCancelWorkout = () => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan sesi latihan ini? Progress saat ini tidak akan disimpan.")) {
      setActiveWorkout(null);
    }
  };

  const handleReplaceJadwalExercise = (oldName, newName) => {
    const updatedJadwal = jadwal.map(ex => {
      if (ex.NamaGerakan.toLowerCase().includes(oldName.toLowerCase()) || oldName.toLowerCase().includes(ex.NamaGerakan.toLowerCase())) {
        return {
          ...ex,
          NamaGerakan: newName
        };
      }
      return ex;
    });
    setJadwal(updatedJadwal);
  };

  const handleClaimQuestReward = (questId) => {
    claimQuestReward(questId);
  };

  const handleUpdateQuestProgress = (questId, increment = 1) => {
    updateQuestProgress(questId, increment);
  };

  const handleTestConnection = async (url) => {
    setLoading(true);
    const success = await testConnection(url);
    setLoading(false);
    return success;
  };

  // Render sesi workout aktif (Layar Penuh)
  if (activeWorkout) {
    return (
      <div className="workout-active-view bg-zinc-950 min-h-screen text-zinc-100 p-2">
        <WorkoutSession
          day={activeWorkout.day}
          workoutList={activeWorkout.workoutList}
          onFinishWorkout={handleFinishWorkout}
          onCancelWorkout={handleCancelWorkout}
          loading={loading}
          personalRecords={personalRecords}
          onUpdatePR={updatePR}
          weight={weight}
          weightHistory={weightHistory}
          progressHistory={progressHistory}
          onReplaceJadwalExercise={handleReplaceJadwalExercise}
          onRewardRPG={(xp, c) => {
            addRpgXpAndCoins(xp, c);
            incrementBossDefeated();
          }}
          rpgEquipped={rpgEquipped}
          onUpdateQuestProgress={handleUpdateQuestProgress}
        />
      </div>
    );
  }

  return (
    <div className="workout-tab-container w-full flex flex-col min-h-full">
      
      {/* Sub Tab Navigation Menu Minimalis Modern Cozy Cafe Style */}
      <div className="cozy-sub-nav">
        <button 
          className={`cozy-sub-tab-btn ${workoutActiveTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setWorkoutActiveTab('dashboard')}
        >
          <Dumbbell size={14} /> LATIHAN
        </button>
        <button 
          className={`cozy-sub-tab-btn ${workoutActiveTab === 'history' ? 'active' : ''}`}
          onClick={() => setWorkoutActiveTab('history')}
        >
          <Calendar size={14} /> RIWAYAT
        </button>
        <button 
          className={`cozy-sub-tab-btn ${workoutActiveTab === 'guide' ? 'active' : ''}`}
          onClick={() => setWorkoutActiveTab('guide')}
        >
          <BookOpen size={14} /> PANDUAN
        </button>
      </div>

      {/* Render Sub Tab Content */}
      <div className="flex-1 w-full">
        {workoutActiveTab === 'dashboard' && (
          <Dashboard
            jadwal={jadwal}
            progressHistory={progressHistory}
            mealHistory={mealHistory}
            onStartWorkout={handleStartWorkout}
            onReplaceJadwalExercise={handleReplaceJadwalExercise}
            connectionStatus={connectionStatus}
            targetCalories={targetCalories}
            targetProtein={targetProtein}
            weight={weight}
            setWeight={(w) => setPhysique(w, height)}
            height={height}
            setHeight={(h) => setPhysique(weight, h)}
            lastPhysiqueUpdate={lastPhysiqueUpdate}
            setLastPhysiqueUpdate={() => {}}
            personalRecords={personalRecords}
            onUpdatePR={updatePR}
            recoveryToday={null}
            onUpdateRecovery={() => {}}
            rpgLevel={rpgLevel}
            rpgXp={rpgXp}
            rpgCoins={coins}
            rpgBossesDefeated={rpgBossesDefeated}
            rpgBadges={rpgBadges}
            rpgInventory={rpgInventory}
            rpgEquipped={rpgEquipped}
            dailyQuests={dailyQuests}
            onBuyItem={(item) => buyItem(item.name, item.cost, item.type, { id: item.id, damage: item.damage, defense: item.defense })}
            onEquipItem={equipItem}
            onClaimQuestReward={handleClaimQuestReward}
          />
        )}

        {workoutActiveTab === 'history' && (
          <History
            progressHistory={progressHistory}
            weightHistory={weightHistory}
            connectionStatus={connectionStatus}
          />
        )}

        {workoutActiveTab === 'guide' && (
          <CalisthenicsGuide />
        )}
      </div>

    </div>
  );
}
