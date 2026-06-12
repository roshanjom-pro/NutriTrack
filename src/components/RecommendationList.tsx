import { useState, useEffect } from "react";
import { UserProfile, Meal, LoggedEntry } from "../types";
import { ChevronRight, Check, Sparkles, ChefHat, Info, ArrowLeft, RotateCcw } from "lucide-react";

interface RecommendationListProps {
  profile: UserProfile;
  activeMealCategory: 'Breakfast' | 'Lunch' | 'Dinner';
  onLogMeal: (meals: Meal[]) => void;
  onBackToDashboard: () => void;
}

export default function RecommendationList({
  profile,
  activeMealCategory,
  onLogMeal,
  onBackToDashboard
}: RecommendationListProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMealIds, setSelectedMealIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner'>(activeMealCategory);

  // Suggested ranges depending on the selected meal category
  const getSubtargets = () => {
    switch (currentCategory) {
      case "Breakfast":
        return {
          suggestedRange: `${Math.round(profile.dailyCalorieTarget * 0.25)}–${Math.round(profile.dailyCalorieTarget * 0.3)} kcal`,
          focus: profile.metabolicFocus || "High Protein",
          percentage: 45
        };
      case "Lunch":
        return {
          suggestedRange: `${Math.round(profile.dailyCalorieTarget * 0.3)}–${Math.round(profile.dailyCalorieTarget * 0.45)} kcal`,
          focus: "Balanced Energy",
          percentage: 65
        };
      case "Dinner":
        return {
          suggestedRange: `${Math.round(profile.dailyCalorieTarget * 0.25)}–${Math.round(profile.dailyCalorieTarget * 0.35)} kcal`,
          focus: "Sustained Recovery",
          percentage: 80
        };
    }
  };

  const loadRecommendationMeals = async (cat: 'Breakfast' | 'Lunch' | 'Dinner') => {
    setIsLoading(true);
    setSelectedMealIds(new Set());
    try {
      const res = await fetch("/api/gemini/generate-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, profile })
      });
      if (res.ok) {
        const data = await res.json();
        setMeals(data);
      } else {
        throw new Error("Failed to load recommendations");
      }
    } catch (e) {
      console.error(e);
      // Hardcoded local fallback matching the pixel perfect mocks
      const fallbacks: Record<'Breakfast' | 'Lunch' | 'Dinner', Meal[]> = {
        Breakfast: [
          {
            id: "b1",
            name: "Avocado Toast & Egg",
            calories: 480,
            protein: 18,
            carbs: 30,
            fat: 32,
            prepTime: "10m",
            tags: ["KETO", "QUICK"],
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMCojUQJH3llFVhyjsFPnbTUUE9FxOthBK2slgVP2dLKM_xfNSp6s4V5VRG9El6h_wD4e8KAbvMFgGR9I7RDumj5UqHKjP5n7hIj3EJltpjHEgAScD6kqKwFdIoH6XRslSXJrx1Z5EixiO6ukFvreyh0LrsYdWqyb-s0-pWF6zJM79kTBxKAKZ_ILZDu9xmH4uv7IcJG6HMy6Ay5oE3WK6k14eXTZlhrpSIYVGpqnXg1jwKtRJsebI-M8_gvIoDzKVnEW0d3pRkRE",
            category: "Breakfast"
          },
          {
            id: "b2",
            name: "Protein Berry Bowl",
            calories: 320,
            protein: 24,
            carbs: 38,
            fat: 8,
            prepTime: "5m",
            tags: ["HIGH PROTEIN", "LEAN"],
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqnJjUuM4YEGqg0eRDDQsdNZEp5QKzfFZD5zyGHT73qJh53yKHGU1xujvgkvQQleJLX0qUULWXF9jvKti6JuRw7Ss4ZzItwUDWAYG3hgHqaJpArGe6lJCJ4fXY-uNETaTOAZL1tbIZZSF9UbItLA4AZD7iTF1uF_2L0uSlU9BUFOH22DnBvVvpyDgdUMVGasLYcmtAFIJkwKjHzeJxZO56IXZaCD_bhgqVpFVvBqiiQHPI8Q6Fi6tqDQhFc01GpR9EpoINRUu-EwA",
            category: "Breakfast"
          },
          {
            id: "b3",
            name: "Steel-Cut Almond Oats",
            calories: 410,
            protein: 12,
            carbs: 58,
            fat: 14,
            prepTime: "15m",
            tags: ["FIBER", "VEGAN"],
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGOU7udxsknFCzd975fYco7gmSmG94TSYv2zgxruRt_DuKRDzLoQsvbw1OZfeXgmjuH5jTUOUPTr-YpFUdyLfJcCxFQ9S710ShuOD34Q2yNM2GX65kL3zYapgO7lTClfJxsdUvYhGceZIyMOU-g3JEHUKRzw7RK6L9dIyleANNkaI5n8_pAefuv8Ea_Gg2vGR--CA9_RCC-om6gw7rzILVaqEP-yqQ-6N2ef8as29TvPeeTpIgB07RVEfUo0SZYN2iz8JaI8f8n7c",
            category: "Breakfast"
          },
          {
            id: "b4",
            name: "Spinach & Feta Omelette",
            calories: 390,
            protein: 28,
            carbs: 4,
            fat: 26,
            prepTime: "12m",
            tags: ["PALEO", "LOW CARB"],
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDia-h3RhtSyz1tQ_2lC8x2lvg1Z_PJGyAqEDT5lIHZgGAi6xJyAP01NHWkBz1DNTW8wVlZgtF_4sWgVb6Wr7IBCJpXaWGkxkigNpeA3ji0lzSerVGa3-hlBXdJtJDunjw-XDnmNSrxCa-YBCkDScR2K4TtCQQjq4h8SAHB4IBdfgvrabi75lcVs70fcgwFC3Hyp5NbccF7qVr7YuSW1tPj8vr6vVfI8iVALw_p-K5w9vJc2ECYa2c37BmR5m7vu8LsFLh_LPrNK3Q",
            category: "Breakfast"
          }
        ],
        Lunch: [
          {
            id: "l1",
            name: "Quinoa Protein Bowl",
            calories: 580,
            protein: 34,
            carbs: 65,
            fat: 18,
            prepTime: "12m",
            tags: ["POST-WORKOUT", "GRAINS"],
            imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
            category: "Lunch"
          },
          {
            id: "l2",
            name: "Zesty Salmon Greens",
            calories: 520,
            protein: 38,
            carbs: 12,
            fat: 34,
            prepTime: "15m",
            tags: ["OMEGA-3", "LOW CARB"],
            imageUrl: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=600&auto=format&fit=crop&q=80",
            category: "Lunch"
          }
        ],
        Dinner: [
          {
            id: "d1",
            name: "Seared Sirloin & Asparagus",
            calories: 610,
            protein: 48,
            carbs: 18,
            fat: 36,
            prepTime: "18m",
            tags: ["HIGH IRON", "PALEO"],
            imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
            category: "Dinner"
          },
          {
            id: "d2",
            name: "Hearty Tuscan Root Stew",
            calories: 440,
            protein: 16,
            carbs: 62,
            fat: 12,
            prepTime: "25m",
            tags: ["VEGAN", "FIBER-RICH"],
            imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
            category: "Dinner"
          }
        ]
      };
      setMeals(fallbacks[cat]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendationMeals(currentCategory);
  }, [currentCategory]);

  const toggleSelectMeal = (id: string) => {
    const next = new Set(selectedMealIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMealIds(next);
  };

  const handleGenerateCustomPlan = async () => {
    setIsGeneratingCustom(true);
    try {
      // Direct prompt asking Gemini to formulate newly refined menus
      const res = await fetch("/api/gemini/generate-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: currentCategory, profile, forceCustom: true })
      });
      if (res.ok) {
        const data = await res.json();
        setMeals(data);
        setSelectedMealIds(new Set());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const handleLogMealsToDiary = () => {
    const selectedMeals = meals.filter(m => selectedMealIds.has(m.id));
    if (selectedMeals.length > 0) {
      onLogMeal(selectedMeals);
    }
  };

  const sub = getSubtargets();

  return (
    <div className="bg-surface-bg min-h-screen pb-32 animate-fade-in-up">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5] border-b border-black/10 py-3 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBackToDashboard}
            className="p-1 hover:bg-[#EAE6DF] rounded-lg text-[#1A1A1A] transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col text-left">
            <span className="text-[8px] uppercase tracking-[0.3em] font-semibold opacity-60 leading-none">Volume 04</span>
            <span className="font-serif italic text-lg text-[#1A1A1A] tracking-tighter leading-none mt-0.5">NutriTrack.</span>
          </div>
        </div>
        
        {/* Toggleable meal section headers */}
        <div className="flex bg-[#EAE6DF] p-1 rounded-xl gap-1">
          {(['Breakfast', 'Lunch', 'Dinner'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCurrentCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                currentCategory === cat
                  ? "bg-[#1A1A1A] text-[#FAF8F5]"
                  : "text-gray-500 hover:text-black hover:bg-black/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main recommendation contents */}
      <main className="max-w-[720px] mx-auto px-5 pt-6">
        {/* Detail title */}
        <div className="mb-6 text-left">
          <h2 className="font-serif italic text-3xl tracking-tight text-[#1A1A1A]">
            {currentCategory} Plan.
          </h2>
          <div className="flex items-center gap-1.5 text-gray-500 mt-1.5 text-xs md:text-sm">
            <ChefHat size={16} className="text-[#1A1A1A]" />
            <p>Based on your Profile ({profile.height}cm, {profile.weight}kg)</p>
          </div>
        </div>

        {/* Goals Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Calorie goal target */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-black/10 flex items-center gap-3 shadow-none text-left">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" fill="transparent" stroke="#EAE6DF" strokeWidth="3" />
                <circle 
                  cx="24" 
                  cy="24" 
                  r="20" 
                  fill="transparent" 
                  stroke="#1A1A1A" 
                  strokeWidth="3" 
                  className="transition-all duration-500"
                  style={{
                    strokeDasharray: 125.6,
                    strokeDashoffset: 125.6 - (125.6 * (sub?.percentage || 70)) / 100
                  }}
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#1A1A1A]">{sub?.percentage}%</span>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">Calorie Goal</p>
              <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{profile.dailyCalorieTarget} kcal</p>
            </div>
          </div>

          {/* Caloric suggested range limits */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-black/10 flex items-center gap-3 shadow-none text-left">
            <div className="w-10 h-10 rounded-full bg-[#A29380]/15 text-[#1A1A1A] flex items-center justify-center shrink-0">
              <Sparkles size={18} className="stroke-[1.5px]" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">Suggested Range</p>
              <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{sub?.suggestedRange}</p>
            </div>
          </div>

          {/* Metabolic Highlight Focus */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-black/10 flex items-center gap-3 shadow-none text-left">
            <div className="w-10 h-10 rounded-full bg-[#4E5851]/15 text-[#1A1A1A] flex items-center justify-center shrink-0">
              <Info size={18} className="stroke-[1.5px]" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">Focus Strategy</p>
              <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{sub?.focus}</p>
            </div>
          </div>
        </section>

        {/* Selected meals ready statement bar */}
        {selectedMealIds.size > 0 && (
          <div className="mb-4 bg-[#1A1A1A] text-[#FAF8F5] p-4 rounded-2xl flex items-center justify-between animate-slide-up border border-black/10">
            <p className="text-xs md:text-sm font-medium">
              Selected <strong>{selectedMealIds.size}</strong> meal{selectedMealIds.size > 1 ? 's' : ''} to log.
            </p>
            <button
              type="button"
              onClick={handleLogMealsToDiary}
              className="px-4 py-2 bg-[#FAF8F5] text-[#1A1A1A] text-xs font-bold rounded-xl hover:bg-[#EAE6DF] active:scale-95 transition-all outline-none"
            >
              Add selected meals
            </button>
          </div>
        )}

        {/* Nutritional Choices Grid */}
        <section className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center">
              <svg className="animate-spin h-8 w-8 text-[#1A1A1A] mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-500 font-medium text-sm">Consulting nutritional algorithms...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="py-16 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-gray-300">
              <RotateCcw size={32} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">No recommendation records returned.</p>
              <button 
                type="button" 
                onClick={() => loadRecommendationMeals(currentCategory)} 
                className="mt-3 text-xs font-bold text-[#1A1A1A] tracking-wider uppercase hover:underline"
              >
                Retry Request
              </button>
            </div>
          ) : (
            meals.map((meal, index) => {
              const isSelected = selectedMealIds.has(meal.id);
              return (
                <div
                  key={meal.id || index}
                  onClick={() => toggleSelectMeal(meal.id)}
                  className={`animate-slide-up bg-[#FAF8F5] p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col md:flex-row gap-4 items-start md:items-center group shadow-none ${
                    isSelected 
                      ? "border-[#1A1A1A] ring-1 ring-black/10 translate-x-1" 
                      : "border-black/10 hover:border-black/25"
                  }`}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Photo representation */}
                  <div className="w-full md:w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-black/[0.04] bg-[#EAE6DF] relative">
                    <img 
                      src={meal.imageUrl} 
                      alt={meal.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 pb-safe bg-black/40 text-white text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                      {meal.prepTime || "10m"}
                    </div>
                  </div>

                  {/* Contents */}
                  <div className="flex-grow w-full">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-left">
                        <h3 className="font-serif italic font-bold text-[#1A1A1A] text-lg group-hover:text-[#A29380] transition-colors">
                          {meal.name}
                        </h3>
                        {/* Tags list */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(meal.tags || []).map((t, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 bg-[#EAE6DF] text-[9px] font-bold text-[#1A1A1A] rounded uppercase tracking-wider"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Selectable check bubble */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectMeal(meal.id);
                        }}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? "bg-[#1A1A1A] border-[#1A1A1A] text-[#FAF8F5] scale-105" 
                            : "border-gray-300 text-transparent hover:border-gray-400"
                        }`}
                      >
                        <Check size={14} className="stroke-[3px]" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed text-left">
                      {meal.description || "Fresh ingredients assembled to deliver precise, high-performance physical energy."}
                    </p>

                    {/* Macro breakdown statistics matching detail charts */}
                    <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-black/10 text-center">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">CAL</p>
                        <p className="text-xs font-bold text-gray-800 mt-1">{meal.calories}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">PRO</p>
                        <p className="text-xs font-bold text-gray-800 mt-1">{meal.protein}g</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">CARBS</p>
                        <p className="text-xs font-bold text-gray-800 mt-1">{meal.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">FAT</p>
                        <p className="text-xs font-bold text-gray-800 mt-1">{meal.fat}g</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Generate Custom plan buttons */}
        <section className="mt-8 space-y-4">
          <button
            type="button"
            disabled={isGeneratingCustom || isLoading}
            onClick={handleGenerateCustomPlan}
            className="w-full h-14 bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {isGeneratingCustom ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Gemini Generating Custom Options...
              </span>
            ) : (
              <>
                <Sparkles size={16} className="fill-[#FAF8F5]" />
                Generate Custom Plan
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-400 font-medium">
            Plans are updated based on your real-time biometric shifts.
          </p>
        </section>
      </main>
    </div>
  );
}
