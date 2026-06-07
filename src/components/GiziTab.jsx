import React from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import MealTracker from './MealTracker';

export default function GiziTab() {
  const {
    webAppUrl,
    connectionStatus,
    mealHistory,
    setMealHistory,
    targetCalories,
    targetProtein,
    wallets
  } = useDashboardStore();

  const totalSaldo = Object.values(wallets || {}).reduce((sum, v) => sum + v, 0);

  const handleLogMeal = (meal) => {
    const updated = [meal, ...mealHistory];
    setMealHistory(updated);
  };

  const handleDeleteMeal = (id) => {
    const updated = mealHistory.filter(m => (m.id || m.Id) !== id);
    setMealHistory(updated);
  };

  return (
    <div className="gizi-tab-container w-full min-h-full">
      <MealTracker
        webAppUrl={webAppUrl}
        connectionStatus={connectionStatus}
        mealHistory={mealHistory}
        onLogMeal={handleLogMeal}
        onDeleteMeal={handleDeleteMeal}
        targetCalories={targetCalories}
        targetProtein={targetProtein}
        totalSaldo={totalSaldo}
      />
    </div>
  );
}
