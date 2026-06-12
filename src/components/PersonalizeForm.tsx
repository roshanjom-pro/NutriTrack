import React, { useState } from "react";
import { UserProfile } from "../types";
import { Ruler, Scale, Info, ArrowRight, ArrowLeft } from "lucide-react";
import WaveShader from "./WaveShader";

interface PersonalizeFormProps {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
  currentProfile?: UserProfile;
}

export default function PersonalizeForm({ onComplete, onSkip, currentProfile }: PersonalizeFormProps) {
  const [height, setHeight] = useState<string>(currentProfile?.height?.toString() || "175");
  const [weight, setWeight] = useState<string>(currentProfile?.weight?.toString() || "70");
  const [age, setAge] = useState<string>(currentProfile?.age?.toString() || "28");
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(currentProfile?.gender || "male");
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'active'>(currentProfile?.activityLevel || "moderate");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Expanded fields drawer for extra medical completeness without cluttering the premium mockup
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const h = Number(height);
    const w = Number(weight);
    const a = Number(age);

    if (!h || !w || !a || h <= 0 || w <= 0 || a <= 0) {
      setErrorStatus("Please enter valid positive metric vitals.");
      return;
    }

    setIsGenerating(true);
    setErrorStatus(null);

    try {
      const res = await fetch("/api/gemini/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: h,
          weight: w,
          age: a,
          gender,
          activityLevel
        })
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with our AI engine.");
      }

      const planData = await res.json();
      
      onComplete({
        height: h,
        weight: w,
        age: a,
        gender,
        activityLevel,
        dailyCalorieTarget: planData.dailyCalorieTarget,
        dailyProteinTarget: planData.dailyProteinTarget,
        dailyCarbsTarget: planData.dailyCarbsTarget,
        dailyFatTarget: planData.dailyFatTarget,
        metabolicFocus: planData.metabolicFocus || "Balanced Wellness",
        planGenerated: true
      });
    } catch (err: any) {
      console.error(err);
      // Clean fallback calculation logic if server endpoint experiences latency or limits
      const bmr = 10 * w + 6.25 * h - 5 * a + (gender === "male" ? 5 : gender === "female" ? -161 : -80);
      const mult = activityLevel === "sedentary" ? 1.2 : activityLevel === "active" ? 1.725 : 1.55;
      const maintenance = Math.round(bmr * mult);
      const safeTarget = Math.round(maintenance * 0.85); // Healthy steady control

      onComplete({
        height: h,
        weight: w,
        age: a,
        gender,
        activityLevel,
        dailyCalorieTarget: safeTarget,
        dailyProteinTarget: Math.round((safeTarget * 0.3) / 4),
        dailyCarbsTarget: Math.round((safeTarget * 0.45) / 4),
        dailyFatTarget: Math.round((safeTarget * 0.25) / 9),
        metabolicFocus: "Balanced Intake",
        planGenerated: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-surface-bg min-h-screen flex flex-col justify-between relative overflow-x-hidden animate-fade-in-up">
      {/* Top half wave shader decoration */}
      <section className="relative h-[300px] md:h-[350px] w-full overflow-hidden shrink-0">
        <div className="absolute inset-0">
          <WaveShader />
        </div>
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F4F1ED]/85 pointer-events-none" />
        
        {/* Branding */}
        <div className="absolute top-8 left-5 md:left-12 z-20">
          <span className="font-serif italic text-3xl text-white tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            NutriTrack
          </span>
        </div>
      </section>

      {/* Main personalization canvas block */}
      <main className="flex-grow flex flex-col items-center px-5 md:px-0 -mt-24 relative z-20 pb-16">
        <div className="w-full max-w-[480px] bg-[#FAF8F5] rounded-3xl p-6 md:p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.02)] border border-black/[0.04]">
          <header className="mb-6 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-60 mb-1.5 block">Volume 04</span>
            <h1 className="font-serif italic text-3xl md:text-4xl text-[#1A1A1A] tracking-tighter leading-tight">
              Personalize your plan.
            </h1>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Provide your basic vitals to help us calculate your daily nutritional targets with clinical precision.
            </p>
          </header>

          <form onSubmit={handleGenerate} className="space-y-4">
            {errorStatus && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs text-center font-medium">
                {errorStatus}
              </div>
            )}

            {/* Height input matching standard look */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest" htmlFor="height">
                Height (CM)
              </label>
              <div className="relative group">
                <input
                  id="height"
                  type="number"
                  required
                  min="50"
                  max="300"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  disabled={isGenerating}
                  className="w-full h-14 px-4 pr-12 rounded-2xl bg-[#FAF8F5] border border-black/10 focus:ring-2 focus:ring-[#1A1A1A] text-lg font-semibold transition-all duration-200 outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Ruler size={20} className="stroke-[1.5px] opacity-60" />
                </div>
              </div>
            </div>

            {/* Weight input matching standard look */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest" htmlFor="weight">
                Weight (KG)
              </label>
              <div className="relative group">
                <input
                  id="weight"
                  type="number"
                  required
                  min="20"
                  max="500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  disabled={isGenerating}
                  className="w-full h-14 px-4 pr-12 rounded-2xl bg-[#FAF8F5] border border-black/10 focus:ring-2 focus:ring-[#1A1A1A] text-lg font-semibold transition-all duration-200 outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Scale size={20} className="stroke-[1.5px] opacity-60" />
                </div>
              </div>
            </div>

            {/* Advanced toggle for precision medicine calculations */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-[#1A1A1A] tracking-wider uppercase hover:opacity-80 flex items-center gap-1 transition-all"
              >
                {showAdvanced ? "Hide Advanced Settings" : "Adjust Age, Gender & Activity"}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-neutral-bg/50 rounded-2xl border border-black/[0.02] animate-slide-up">
                {/* Age field */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider" htmlFor="age">
                    Age (Years)
                  </label>
                  <input
                    id="age"
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#007AFF] text-sm font-semibold outline-none"
                  />
                </div>

                {/* Gender toggle */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Biological Gender
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 text-xs rounded-lg font-bold capitalize transition-all ${
                          gender === g
                            ? "bg-black text-white text-[11px]"
                            : "bg-white text-gray-500 border border-gray-100"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity index */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Activity Factor
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['sedentary', 'moderate', 'active'] as const).map((act) => (
                      <button
                        key={act}
                        type="button"
                        onClick={() => setActivityLevel(act)}
                        className={`py-2 text-[10px] rounded-lg font-extrabold uppercase tracking-wide transition-all ${
                          activityLevel === act
                            ? "bg-black text-white"
                            : "bg-white text-gray-500 border border-gray-100"
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medical Disclaimer Card matching mockup */}
            <div className="p-4 bg-[#EAE6DF] rounded-2xl flex gap-3 items-start border border-black/[0.04]">
              <Info size={18} className="text-[#1A1A1A] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                We use the Mifflin-St Jeor equation to estimate your basal metabolic rate based on these biometric metrics.
              </p>
            </div>

            {/* Dynamic CTA Actions */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full h-14 bg-[#1A1A1A] text-[#FAF8F5] font-semibold text-base rounded-2xl tracking-wide hover:bg-[#2C2C2C] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Clinical Assessment...
                  </span>
                ) : (
                  <>
                    Generate Plan
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onSkip}
                disabled={isGenerating}
                className="w-full text-center h-14 bg-transparent text-[#1A1A1A]/70 font-bold hover:text-black hover:bg-[#EAE6DF]/60 rounded-2xl text-xs uppercase tracking-widest transition-all"
              >
                I'll do this later
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Subtle encryption footer */}
      <footer className="mt-auto py-6 text-center shrink-0 opacity-40">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          SECURE & PRIVATE DATA ENCRYPTION
        </p>
      </footer>
    </div>
  );
}
