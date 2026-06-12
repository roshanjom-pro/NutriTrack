/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { UserProfile, LoggedEntry, Meal } from "./types";
import DashboardView from "./components/DashboardView";
import PersonalizeForm from "./components/PersonalizeForm";
import RecommendationList from "./components/RecommendationList";
import { Home, ChefHat, UserCircle2 } from "lucide-react";

// Seeding standard mock state so the app displays the exact mockup from screenshot out-of-the-box
const DEFAULT_PROFILE: UserProfile = {
  height: 182,
  weight: 78,
  age: 28,
  gender: 'male',
  activityLevel: 'moderate',
  dailyCalorieTarget: 2420, // 2420 kcal limit - 1000 logged = exactly 1,420 KCAL LEFT as shown in screenshot!
  dailyProteinTarget: 145,
  dailyCarbsTarget: 240,
  dailyFatTarget: 75,
  metabolicFocus: "Balanced Intake",
  planGenerated: false
};

const DEFAULT_LOGGED: LoggedEntry[] = [
  {
    id: "init-breakfast",
    name: "Avocado Toast & Egg",
    calories: 420,
    protein: 18,
    carbs: 30,
    fat: 32,
    category: "Breakfast",
    timestamp: Date.now() - 3600000 * 4
  },
  {
    id: "init-lunch",
    name: "Quinoa Protein Bowl",
    calories: 580,
    protein: 34,
    carbs: 65,
    fat: 18,
    category: "Lunch",
    timestamp: Date.now() - 3600000 * 2
  }
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loggedEntries, setLoggedEntries] = useState<LoggedEntry[]>(DEFAULT_LOGGED);
  const [waterIntake, setWaterIntake] = useState<number>(1.8);
  const [streakCount, setStreakCount] = useState<number>(12);
  const [activeView, setActiveView] = useState<'home' | 'meals' | 'profile'>('home');
  const [activeMealCategory, setActiveMealCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');

  // Load state from localStorage on build
  useEffect(() => {
    const savedProfile = localStorage.getItem("nt_profile_p7");
    const savedLogged = localStorage.getItem("nt_logged_p7");
    const savedWater = localStorage.getItem("nt_water_p7");
    const savedStreak = localStorage.getItem("nt_streak_p7");
    const savedView = localStorage.getItem("nt_view_p7");

    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)); } catch(e) { console.error(e); }
    }
    if (savedLogged) {
      try { setLoggedEntries(JSON.parse(savedLogged)); } catch(e) { console.error(e); }
    }
    if (savedWater) {
      setWaterIntake(Number(savedWater));
    }
    if (savedStreak) {
      setStreakCount(Number(savedStreak));
    }
    if (savedView) {
      setActiveView(savedView as any);
    }
  }, []);

  // Helper to persist state securely
  const saveState = (
    newProfile: UserProfile, 
    newLogged: LoggedEntry[], 
    newWater: number, 
    newStreak: number,
    newView: 'home' | 'meals' | 'profile'
  ) => {
    localStorage.setItem("nt_profile_p7", JSON.stringify(newProfile));
    localStorage.setItem("nt_logged_p7", JSON.stringify(newLogged));
    localStorage.setItem("nt_water_p7", newWater.toString());
    localStorage.setItem("nt_streak_p7", newStreak.toString());
    localStorage.setItem("nt_view_p7", newView);
  };

  const handleProfileComplete = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setActiveView('home');
    saveState(updatedProfile, loggedEntries, waterIntake, streakCount, 'home');
  };

  const handleSkipPersonalization = () => {
    // Flag completed, jump to dashboard with current setups
    const updated = { ...profile, planGenerated: true };
    setProfile(updated);
    setActiveView('home');
    saveState(updated, loggedEntries, waterIntake, streakCount, 'home');
  };

  const handleLogMeals = (selectedMeals: Meal[]) => {
    const newEntries: LoggedEntry[] = selectedMeals.map(m => ({
      id: Math.random().toString(36).substring(2, 9),
      mealId: m.id,
      name: m.name,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      category: m.category,
      timestamp: Date.now()
    }));

    const nextLogged = [...loggedEntries, ...newEntries];
    setLoggedEntries(nextLogged);
    setActiveView('home');
    saveState(profile, nextLogged, waterIntake, streakCount, 'home');
  };

  const handleDeleteMealEntry = (id: string) => {
    const nextLogged = loggedEntries.filter(entry => entry.id !== id);
    setLoggedEntries(nextLogged);
    saveState(profile, nextLogged, waterIntake, streakCount, activeView);
  };

  const handleAddWater = (amount: number) => {
    const nextWater = Number((waterIntake + amount).toFixed(2));
    setWaterIntake(nextWater);
    saveState(profile, loggedEntries, nextWater, streakCount, activeView);
  };

  const handleNavigateToRecommendations = (category: 'Breakfast' | 'Lunch' | 'Dinner') => {
    setActiveMealCategory(category);
    setActiveView('meals');
    saveState(profile, loggedEntries, waterIntake, streakCount, 'meals');
  };

  const handleNavigateView = (view: 'home' | 'meals' | 'profile') => {
    setActiveView(view);
    saveState(profile, loggedEntries, waterIntake, streakCount, view);
  };

  // Render correct content pane depending on state
  const renderContent = () => {
    switch (activeView) {
      case "profile":
        return (
          <PersonalizeForm 
            onComplete={handleProfileComplete} 
            onSkip={handleSkipPersonalization} 
            currentProfile={profile}
          />
        );
      case "meals":
        return (
          <RecommendationList
            profile={profile}
            activeMealCategory={activeMealCategory}
            onLogMeal={handleLogMeals}
            onBackToDashboard={() => handleNavigateView('home')}
          />
        );
      case "home":
      default:
        return (
          <DashboardView
            profile={profile}
            loggedEntries={loggedEntries}
            waterIntake={waterIntake}
            streakCount={streakCount}
            onNavigateToRecommendations={handleNavigateToRecommendations}
            onNavigateToProfile={() => handleNavigateView('profile')}
            onAddWater={handleAddWater}
            onDeleteLoggedMeal={handleDeleteMealEntry}
            onQuickAddMeal={(category, name, calories) => {
              const quickMeal: Meal = {
                id: "q-" + Date.now(),
                name,
                calories,
                protein: 15,
                carbs: 40,
                fat: 10,
                prepTime: "5m",
                tags: ["QUICK"],
                imageUrl: "",
                category
              };
              handleLogMeals([quickMeal]);
            }}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen pb-20 bg-surface-bg flex flex-col font-sans select-none">
      {/* Content Canvas Area */}
      <div className="flex-grow">
        {renderContent()}
      </div>

      {/* Persistent Bottom High-Contrast Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center bg-[#FAF8F5] border-t border-black/10 py-3 pb-safe shadow-none touch-none">
        {/* Home Tab */}
        <button
          type="button"
          onClick={() => handleNavigateView('home')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 outline-none ${
            activeView === "home"
              ? "text-[#1A1A1A] font-bold"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Home size={22} className={activeView === "home" ? "stroke-[2px]" : "stroke-[1.5px]"} />
          <span className="text-[9px] font-bold tracking-[0.2em] mt-1 uppercase">Home</span>
        </button>

        {/* Meals Recommendation Tab */}
        <button
          type="button"
          onClick={() => handleNavigateToRecommendations("Breakfast")}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 outline-none ${
            activeView === "meals"
              ? "text-[#1A1A1A] font-bold"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <ChefHat size={22} className={activeView === "meals" ? "stroke-[2px]" : "stroke-[1.5px]"} />
          <span className="text-[9px] font-bold tracking-[0.2em] mt-1 uppercase">Meals</span>
        </button>

        {/* Profile Settings Personalization Tab */}
        <button
          type="button"
          onClick={() => handleNavigateView('profile')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 outline-none ${
            activeView === "profile"
              ? "text-[#1A1A1A] font-bold"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <UserCircle2 size={22} className={activeView === "profile" ? "stroke-[2px]" : "stroke-[1.5px]"} />
          <span className="text-[9px] font-bold tracking-[0.2em] mt-1 uppercase">Profile</span>
        </button>
      </nav>
    </div>
  );
}
