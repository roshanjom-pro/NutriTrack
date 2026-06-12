export interface UserProfile {
  height: number; // in cm
  weight: number; // in kg
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'moderate' | 'active';
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  metabolicFocus: string;
  planGenerated: boolean;
}

export interface Meal {
  id: string; // unique identifier
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string; // e.g. '10m'
  tags: string[]; // e.g. ['Keto', 'Quick']
  imageUrl: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner';
  description?: string;
}

export interface LoggedEntry {
  id: string;
  mealId?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner';
  timestamp: number;
}

export interface WaterLog {
  amount: number; // in liters, e.g. 1.8
  timestamp: number;
}

export interface AppState {
  profile: UserProfile;
  loggedEntries: LoggedEntry[];
  waterIntake: number; // in liters
  streakCount: number;
}
