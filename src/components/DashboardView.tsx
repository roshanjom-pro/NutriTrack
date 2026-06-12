import React from "react";
import { UserProfile, LoggedEntry, Meal } from "../types";
import { Settings, Coffee, Utensils, Moon, Droplets, Flame, Plus, CheckCircle, Trash2 } from "lucide-react";

interface DashboardViewProps {
  profile: UserProfile;
  loggedEntries: LoggedEntry[];
  waterIntake: number;
  streakCount: number;
  onNavigateToRecommendations: (category: 'Breakfast' | 'Lunch' | 'Dinner') => void;
  onNavigateToProfile: () => void;
  onAddWater: (amount: number) => void;
  onDeleteLoggedMeal: (id: string) => void;
  onQuickAddMeal: (category: 'Breakfast' | 'Lunch' | 'Dinner', name: string, calories: number) => void;
}

export default function DashboardView({
  profile,
  loggedEntries,
  waterIntake,
  streakCount,
  onNavigateToRecommendations,
  onNavigateToProfile,
  onAddWater,
  onDeleteLoggedMeal,
  onQuickAddMeal
}: DashboardViewProps) {
  // Aggregate nutrition metrics
  const totalCaloriesLogged = loggedEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProteinLogged = loggedEntries.reduce((sum, entry) => sum + entry.protein, 0);
  const totalCarbsLogged = loggedEntries.reduce((sum, entry) => sum + entry.carbs, 0);
  const totalFatLogged = loggedEntries.reduce((sum, entry) => sum + entry.fat, 0);

  const caloriesLeft = Math.max(0, profile.dailyCalorieTarget - totalCaloriesLogged);
  const progressPercentage = Math.min(100, (totalCaloriesLogged / profile.dailyCalorieTarget) * 100);

  // Group logged meals by category
  const mealsByCategory = {
    Breakfast: loggedEntries.filter(e => e.category === "Breakfast"),
    Lunch: loggedEntries.filter(e => e.category === "Lunch"),
    Dinner: loggedEntries.filter(e => e.category === "Dinner")
  };

  const getPercentage = (logged: number, target: number) => {
    return Math.min(100, (logged / (target || 1)) * 100);
  };

  return (
    <div className="bg-surface-bg min-h-screen pb-32 animate-fade-in-up">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5] border-b border-black/10 select-none">
        <div className="flex items-center justify-between px-5 h-16 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3">
            <div 
              onClick={onNavigateToProfile}
              className="w-10 h-10 rounded-full overflow-hidden bg-[#EAE6DF] border border-black/10 cursor-pointer hover:opacity-90 active:scale-95 transition-all relative"
            >
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa2mB9vCkUkgbBGF0TSaDjAYjdi8zuNOXHvxkJxd_ZF1_DhE1MTnN-AcywcUqRouWNVE197a7lRrE4ue6eq74NUuh0JbxjeF17aZrk_GZh1aalbMShe5Q54txcdUKytaSHhqLnaANBkcaKJeHI9jpgIFYnbx7LagfyWPIN7VbSjXP9Vbs2iaalLrsqpNmdSADLRvAIsMxOV_Aab2JgU-l77X6bgdHCA6s8OLq2HttFxHxPctXOK8pc--m5IYaip3C2IyWyNp--4oM"
              />
              <div className="absolute inset-0 border border-black/10 rounded-full" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] uppercase tracking-[0.3em] font-semibold opacity-60 leading-none">Volume 04</span>
              <h1 
                onClick={onNavigateToProfile}
                className="font-serif italic text-2xl text-[#1A1A1A] tracking-tighter cursor-pointer leading-none mt-0.5"
              >
                NutriTrack.
              </h1>
            </div>
          </div>
          <button 
            type="button"
            onClick={onNavigateToProfile}
            className="p-2 hover:bg-[#EAE6DF] text-[#1A1A1A] rounded-full transition-all active:scale-95 duration-200 outline-none"
          >
            <Settings size={22} className="stroke-[1.5px]" />
          </button>
        </div>
      </header>

      {/* Main dashboard body */}
      <main className="max-w-[1200px] mx-auto px-5 pt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Targets and Metrics (md:col-span-6) */}
        <div className="md:col-span-6 space-y-8 flex flex-col items-center">
          {/* Today's Goal Section */}
          <section className="w-full flex flex-col items-center">
            <h2 className="font-serif italic text-2xl text-[#1A1A1A] mb-4 text-center tracking-tight">
              Today's Goal
            </h2>
            
            {/* Ambient circular container matching mockup */}
            <div className="relative w-64 h-64 flex items-center justify-center bg-[#FAF8F5] rounded-full border border-black/12 shadow-none">
              <svg className="w-56 h-56 -rotate-90">
                {/* Background Track */}
                <circle cx="112" cy="112" r="100" fill="transparent" stroke="#EAE6DF" strokeWidth="10" />
                {/* Dynamically sizing active progress ring */}
                <circle 
                  cx="112" 
                  cy="112" 
                  r="100" 
                  fill="transparent" 
                  stroke="#1A1A1A" 
                  strokeLinecap="square" 
                  strokeWidth="10" 
                  className="transition-all duration-500"
                  style={{
                    strokeDasharray: 628.3,
                    strokeDashoffset: 628.3 - (628.3 * progressPercentage) / 100
                  }}
                />
              </svg>

              {/* Exact Center labels */}
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                <span className="font-serif font-semibold text-5xl text-[#1A1A1A] tracking-tighter">
                  {caloriesLeft.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1.5">
                  Kcal Left
                </span>
              </div>
            </div>

            {/* Target Breakdown Macros bar indicators */}
            <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-sm">
              {/* Protein indicator */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase">Protein</span>
                <span className="font-sans font-bold text-[#1A1A1A] mt-1.5 text-sm">{totalProteinLogged}g <span className="text-gray-400 font-medium text-xs">/ {profile.dailyProteinTarget}g</span></span>
                <div className="w-full h-[3px] bg-[#EAE6DF] mt-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#1A1A1A] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${getPercentage(totalProteinLogged, profile.dailyProteinTarget)}%` }}
                  />
                </div>
              </div>

              {/* Carbs indicator */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase">Carbs</span>
                <span className="font-sans font-bold text-[#1A1A1A] mt-1.5 text-sm">{totalCarbsLogged}g <span className="text-gray-400 font-medium text-xs">/ {profile.dailyCarbsTarget}g</span></span>
                <div className="w-full h-[3px] bg-[#EAE6DF] mt-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#A29380] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${getPercentage(totalCarbsLogged, profile.dailyCarbsTarget)}%` }}
                  />
                </div>
              </div>

              {/* Fat indicator */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase">Fat</span>
                <span className="font-sans font-bold text-[#1A1A1A] mt-1.5 text-sm">{totalFatLogged}g <span className="text-gray-400 font-medium text-xs">/ {profile.dailyFatTarget}g</span></span>
                <div className="w-full h-[3px] bg-[#EAE6DF] mt-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#4E5851] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${getPercentage(totalFatLogged, profile.dailyFatTarget)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Caloric Intake Total Statement card */}
          <div className="w-full p-4 bg-[#FAF8F5] rounded-2xl border border-black/10 shadow-none flex items-center justify-between text-xs font-semibold text-[#1A1A1A] max-w-sm">
            <span className="opacity-70">Calorie Limit: {profile.dailyCalorieTarget} kcal</span>
            <span className="font-bold underline decoration-black/30">Logged: {totalCaloriesLogged} kcal</span>
          </div>
        </div>

        {/* Right Column: Logging Entries & Bento grids (md:col-span-6) */}
        <div className="md:col-span-6 space-y-6">
          <h2 className="font-serif italic text-2xl text-[#1A1A1A] tracking-tight text-left">
            Today's Diary.
          </h2>

          {/* Meals list logs */}
          <div className="space-y-4">
            {/* Breakfast section block */}
            <div className="space-y-2">
              {mealsByCategory.Breakfast.length > 0 ? (
                mealsByCategory.Breakfast.map((entry) => (
                  <div key={entry.id} className="meal-card bg-[#FAF8F5] p-4 rounded-2xl border border-black/10 shadow-none flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#EAE6DF] text-[#1A1A1A] flex items-center justify-center">
                        <Coffee size={20} className="stroke-[1.5px]" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-serif italic font-bold text-sm text-[#1A1A1A]">Breakfast</h3>
                        <p className="text-xs text-gray-500 font-medium">{entry.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-sans font-bold text-base text-[#1A1A1A] block leading-tight">{entry.calories}</span>
                        <span className="text-[9px] font-extrabold text-gray-400 tracking-wider">KCAL</span>
                      </div>
                      <button 
                        onClick={() => onDeleteLoggedMeal(entry.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  onClick={() => onNavigateToRecommendations("Breakfast")}
                  className="meal-card bg-[#FAF8F5] p-4 rounded-2xl border border-black/10 shadow-none flex items-center justify-between hover:bg-[#FAF8F5]/80 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#EAE6DF] text-[#1A1A1A] flex items-center justify-center">
                      <Coffee size={20} className="stroke-[1.5px]" />
                    </div>
                    <div>
                      <h3 className="font-serif italic font-bold text-sm text-[#1A1A1A]">Breakfast</h3>
                      <p className="text-xs text-gray-400 font-medium">Not logged yet</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onNavigateToRecommendations("Breakfast"); }}
                    className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] px-5 py-2 rounded-xl text-[10px] font-extrabold tracking-widest transition-all active:scale-95"
                  >
                    ADD
                  </button>
                </div>
              )}
            </div>

            {/* Lunch section block */}
            <div className="space-y-2">
              {mealsByCategory.Lunch.length > 0 ? (
                mealsByCategory.Lunch.map((entry) => (
                  <div key={entry.id} className="meal-card bg-[#FAF8F5] p-4 rounded-2xl border border-black/10 shadow-none flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#A29380]/15 text-[#1A1A1A] flex items-center justify-center">
                        <Utensils size={20} className="stroke-[1.5px]" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-serif italic font-bold text-sm text-[#1A1A1A]">Lunch</h3>
                        <p className="text-xs text-gray-500 font-medium">{entry.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-sans font-bold text-base text-[#1A1A1A] block leading-tight">{entry.calories}</span>
                        <span className="text-[9px] font-extrabold text-gray-400 tracking-wider">KCAL</span>
                      </div>
                      <button 
                        onClick={() => onDeleteLoggedMeal(entry.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  onClick={() => onNavigateToRecommendations("Lunch")}
                  className="meal-card bg-[#FAF8F5] p-4 rounded-2xl border border-black/10 shadow-none flex items-center justify-between hover:bg-[#FAF8F5]/80 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#A29380]/15 text-[#1A1A1A] flex items-center justify-center">
                      <Utensils size={20} className="stroke-[1.5px]" />
                    </div>
                    <div>
                      <h3 className="font-serif italic font-bold text-sm text-[#1A1A1A]">Lunch</h3>
                      <p className="text-xs text-gray-400 font-medium">Not logged yet</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onNavigateToRecommendations("Lunch"); }}
                    className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] px-5 py-2 rounded-xl text-[10px] font-extrabold tracking-widest transition-all active:scale-95"
                  >
                    ADD
                  </button>
                </div>
              )}
            </div>

            {/* Dinner section block */}
            <div className="space-y-2">
              {mealsByCategory.Dinner.length > 0 ? (
                mealsByCategory.Dinner.map((entry) => (
                  <div key={entry.id} className="meal-card bg-[#FAF8F5] p-4 rounded-2xl border border-black/10 shadow-none flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#4E5851]/15 text-[#1A1A1A] flex items-center justify-center">
                        <Moon size={20} className="stroke-[1.5px]" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-serif italic font-bold text-sm text-[#1A1A1A]">Dinner</h3>
                        <p className="text-xs text-gray-500 font-medium">{entry.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-sans font-bold text-base text-[#1A1A1A] block leading-tight">{entry.calories}</span>
                        <span className="text-[9px] font-extrabold text-gray-400 tracking-wider">KCAL</span>
                      </div>
                      <button 
                        onClick={() => onDeleteLoggedMeal(entry.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  onClick={() => onNavigateToRecommendations("Dinner")}
                  className="meal-card bg-[#FAF8F5] p-4 rounded-2xl border border-black/10 shadow-none flex items-center justify-between hover:bg-[#FAF8F5]/80 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#4E5851]/15 text-[#1A1A1A] flex items-center justify-center">
                      <Moon size={20} className="stroke-[1.5px]" />
                    </div>
                    <div>
                      <h3 className="font-serif italic font-bold text-sm text-[#1A1A1A]">Dinner</h3>
                      <p className="text-xs text-gray-400 font-medium">Not logged yet</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onNavigateToRecommendations("Dinner"); }}
                    className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] px-5 py-2 rounded-xl text-[10px] font-extrabold tracking-widest transition-all active:scale-95"
                  >
                    ADD
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bento grid panels: Water & Streak indicators */}
          <div className="grid grid-cols-2 gap-4">
            {/* Water tracking card */}
            <div 
              onClick={() => onAddWater(0.25)}
              className="bg-[#1A1A1A] p-5 rounded-2xl text-[#FAF8F5] select-none cursor-pointer hover:bg-[#2C2C2C] active:scale-98 transition-all group overflow-hidden relative"
            >
              {/* Ripple pulse visual */}
              <div className="absolute right-3 top-3 w-4 h-4 rounded-full bg-[#FAF8F5]/20 ripple-circle pointer-events-none" />

              <Droplets size={24} className="mb-4 text-[#FAF8F5]/90 group-hover:scale-105 transition-transform stroke-[1.5px]" />
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAF8F5]/75">Water Log</h4>
              <div className="flex items-end gap-1.5 mt-2">
                <span className="font-serif font-semibold text-3xl leading-none">{waterIntake.toFixed(1)}</span>
                <span className="text-[10px] font-bold leading-none mb-0.5 tracking-wider">LITERS</span>
              </div>
              <p className="text-[10px] text-[#FAF8F5]/80 mt-3 font-medium flex items-center gap-1">
                <Plus size={10} strokeWidth={3} /> Tap to add 250ml
              </p>
            </div>

            {/* Streak card indicators */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-black/10 flex flex-col justify-between">
              <div>
                <Flame size={24} className="text-[#A29380] mb-4 stroke-[1.5px]" />
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Streak</h4>
                <div className="flex items-end gap-1.5 mt-2">
                  <span className="font-serif font-semibold text-3xl text-[#1A1A1A] leading-none">{streakCount}</span>
                  <span className="text-[10px] font-bold text-gray-400 leading-none mb-0.5 tracking-wider">DAYS</span>
                </div>
              </div>
              <p className="text-[9px] text-gray-400 mt-3 font-semibold uppercase tracking-[0.1em]">
                Active tracker metric
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
