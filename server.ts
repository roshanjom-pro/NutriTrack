import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with recommended user-agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Highly stylized stock images mapping for different meal types to assure visually pristine layout
const PRESETS_IMAGES = [
  {
    keywords: ["toast", "avocado", "egg", "bread"],
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMCojUQJH3llFVhyjsFPnbTUUE9FxOthBK2slgVP2dLKM_xfNSp6s4V5VRG9El6h_wD4e8KAbvMFgGR9I7RDumj5UqHKjP5n7hIj3EJltpjHEgAScD6kqKwFdIoH6XRslSXJrx1Z5EixiO6ukFvreyh0LrsYdWqyb-s0-pWF6zJM79kTBxKAKZ_ILZDu9xmH4uv7IcJG6HMy6Ay5oE3WK6k14eXTZlhrpSIYVGpqnXg1jwKtRJsebI-M8_gvIoDzKVnEW0d3pRkRE"
  },
  {
    keywords: ["yogurt", "berry", "fruit", "parfait", "bowl", "chia"],
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqnJjUuM4YEGqg0eRDDQsdNZEp5QKzfFZD5zyGHT73qJh53yKHGU1xujvgkvQQleJLX0qUULWXF9jvKti6JuRw7Ss4ZzItwUDWAYG3hgHqaJpArGe6lJCJ4fXY-uNETaTOAZL1tbIZZSF9UbItLA4AZD7iTF1uF_2L0uSlU9BUFOH22DnBvVvpyDgdUMVGasLYcmtAFIJkwKjHzeJxZO56IXZaCD_bhgqVpFVvBqiiQHPI8Q6Fi6tqDQhFc01GpR9EpoINRUu-EwA"
  },
  {
    keywords: ["oat", "oatmeal", "porridge", "almond", "banana"],
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGOU7udxsknFCzd975fYco7gmSmG94TSYv2zgxruRt_DuKRDzLoQsvbw1OZfeXgmjuH5jTUOUPTr-YpFUdyLfJcCxFQ9S710ShuOD34Q2yNM2GX65kL3zYapgO7lTClfJxsdUvYhGceZIyMOU-g3JEHUKRzw7RK6L9dIyleANNkaI5n8_pAefuv8Ea_Gg2vGR--CA9_RCC-om6gw7rzILVaqEP-yqQ-6N2ef8as29TvPeeTpIgB07RVEfUo0SZYN2iz8JaI8f8n7c"
  },
  {
    keywords: ["omelette", "egg", "scramble", "spinach", "feta"],
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDia-h3RhtSyz1tQ_2lC8x2lvg1Z_PJGyAqEDT5lIHZgGAi6xJyAP01NHWkBz1DNTW8wVlZgtF_4sWgVb6Wr7IBCJpXaWGkxkigNpeA3ji0lzSerVGa3-hlBXdJtJDunjw-XDnmNSrxCa-YBCkDScR2K4TtCQQjq4h8SAHB4IBdfgvrabi75lcVs70fcgwFC3Hyp5NbccF7qVr7YuSW1tPj8vr6vVfI8iVALw_p-K5w9vJc2ECYa2c37BmR5m7vu8LsFLh_LPrNK3Q"
  },
  {
    keywords: ["salmon", "fish", "tuna"],
    url: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=600&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["steak", "beef", "meat", "pork"],
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["salad", "greens", "spinach", "kale", "vegan"],
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["soup", "broth", "warm"],
    url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["chicken", "poultry", "turkey", "quinoa"],
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  }
];

// Helper to select a beautiful matching image based on food keywords
function getMatchingFoodImage(text: string): string {
  const normalized = text.toLowerCase();
  for (const preset of PRESETS_IMAGES) {
    if (preset.keywords.some(kw => normalized.includes(kw))) {
      return preset.url;
    }
  }
  return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80"; // standard delicious display
}

// 1. Plan Personalization API Endpoint
app.post("/api/gemini/generate-plan", async (req, res) => {
  const { height, weight, age, gender, activityLevel } = req.body;

  if (!height || !weight || !age || !gender || !activityLevel) {
    return res.status(400).json({ error: "Missing required vitals for personalization." });
  }

  // Backup BMR fallback calculations in case client is offline or Gemini API keys aren't configured
  const heightNum = Number(height);
  const weightNum = Number(weight);
  const ageNum = Number(age);

  let bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum;
  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const multipliers = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.725
  };
  const multiplier = multipliers[activityLevel as 'sedentary' | 'moderate' | 'active'] || 1.2;
  const maintenanceCalories = Math.round(bmr * multiplier);

  // Default fallback values
  const defaultCalorieTarget = Math.round(maintenanceCalories * 0.85); // 15% deficit for general wellness
  const defaultProtein = Math.round((defaultCalorieTarget * 0.3) / 4);
  const defaultCarbs = Math.round((defaultCalorieTarget * 0.45) / 4);
  const defaultFat = Math.round((defaultCalorieTarget * 0.25) / 9);

  if (!ai) {
    // If no API key, return offline/fallback values gracefully
    return res.json({
      dailyCalorieTarget: defaultCalorieTarget,
      dailyProteinTarget: defaultProtein,
      dailyCarbsTarget: defaultCarbs,
      dailyFatTarget: defaultFat,
      metabolicFocus: defaultProtein > 130 ? "High Protein" : "Balanced Nutrition",
      analysis: `Calculated with Mifflin-St Jeor equation. Target BMR is ${Math.round(bmr)} kcal with moderate calorie control for high performance status.`
    });
  }

  try {
    const prompt = `You are a clinical grade nutritionist. Let's personalize a high-performance, motivational nutrition plan based on these exact vitals:
    - Height: ${heightNum} cm
    - Weight: ${weightNum} kg
    - Age: ${ageNum} years
    - Gender: ${gender}
    - Activity level: ${activityLevel}

    Calculate exact daily calorie targets (using Mifflin-St Jeor formula multiplied by appropriate activity index: sedentary=1.2, moderate=1.55, active=1.725, with a safe moderate caloric deficit or control to optimize wellness).
    Produce macro splits:
    - Protein (approx. 2.0g - 2.4g per kg if active, or 25-30% of total calories)
    - Fat (approx. 20-30% of total calories)
    - Carbs (remaining calories)
    
    Determine a Metabolic Focus tagline (e.g. "High Protein", "Keto Deficit", "Balanced Lifestyle", "Sustained Endurance").
    Provide a clinical yet inspiring 2-sentence max 'analysis' explanation specifically referencing their metrics.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyCalorieTarget: { type: Type.INTEGER },
            dailyProteinTarget: { type: Type.INTEGER },
            dailyCarbsTarget: { type: Type.INTEGER },
            dailyFatTarget: { type: Type.INTEGER },
            metabolicFocus: { type: Type.STRING },
            analysis: { type: Type.STRING }
          },
          required: ["dailyCalorieTarget", "dailyProteinTarget", "dailyCarbsTarget", "dailyFatTarget", "metabolicFocus", "analysis"]
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    return res.json(data);
  } catch (err: any) {
    console.error("Gemini personalization error:", err?.message || err);
    return res.json({
      dailyCalorieTarget: defaultCalorieTarget,
      dailyProteinTarget: defaultProtein,
      dailyCarbsTarget: defaultCarbs,
      dailyFatTarget: defaultFat,
      metabolicFocus: "Balanced Nutrition",
      analysis: `Personalization initialized. Utilizing clinical algorithms to target ${defaultCalorieTarget} kcal with sustained daily macros.`
    });
  }
});

// 2. Custom Meal Recommended Generator
app.post("/api/gemini/generate-meals", async (req, res) => {
  const { category, profile } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Meal category is required." });
  }

  const height = profile?.height || 180;
  const weight = profile?.weight || 75;
  const focus = profile?.metabolicFocus || "High Protein";

  // Pre-configured elegant fallbacks for immediate responsiveness
  const FALLBACKS = {
    Breakfast: [
      {
        name: "Avocado Toast & Egg",
        calories: 480,
        protein: 18,
        carbs: 30,
        fat: 32,
        prepTime: "10m",
        tags: ["KETO", "QUICK"],
        imageUrl: getMatchingFoodImage("avocado toast"),
        description: "Artisan multigrain toast loaded with crushed hass avocado and a poached egg with red pepper chili flakes."
      },
      {
        name: "Protein Berry Bowl",
        calories: 320,
        protein: 24,
        carbs: 38,
        fat: 8,
        prepTime: "5m",
        tags: ["HIGH PROTEIN", "LEAN"],
        imageUrl: getMatchingFoodImage("yogurt bowl"),
        description: "Greek yogurt base sweetened with organic vanilla, topped with fresh blueberries, chia seeds, and light honey."
      },
      {
        name: "Steel-Cut Almond Oats",
        calories: 410,
        protein: 12,
        carbs: 58,
        fat: 14,
        prepTime: "15m",
        tags: ["FIBER", "VEGAN"],
        imageUrl: getMatchingFoodImage("oatmeal"),
        description: "Moody steel-cut oats simmered in pure almond milk, finished with raw sliced almonds and fresh bananas."
      }
    ],
    Lunch: [
      {
        name: "Quinoa Protein Bowl",
        calories: 580,
        protein: 34,
        carbs: 65,
        fat: 18,
        prepTime: "12m",
        tags: ["POST-WORKOUT", "GRAINS"],
        imageUrl: getMatchingFoodImage("chicken quinoa bowl"),
        description: "Fluffy white quinoa served with roasted sweet potato cubes, hormone-free grilled chicken breast, and dark spinach."
      },
      {
        name: "Zesty Salmon Greens",
        calories: 520,
        protein: 38,
        carbs: 12,
        fat: 34,
        prepTime: "15m",
        tags: ["OMEGA-3", "LOW CARB"],
        imageUrl: getMatchingFoodImage("salmon salad"),
        description: "Pan-seared Atlantic salmon on a vibrant bed of field greens, roasted pine nuts, and lemon olive oil drizzle."
      }
    ],
    Dinner: [
      {
        name: "Seared Sirloin & Asparagus",
        calories: 610,
        protein: 48,
        carbs: 18,
        fat: 36,
        prepTime: "18m",
        tags: ["HIGH IRON", "PALEO"],
        imageUrl: getMatchingFoodImage("steak beef"),
        description: "Tender grain-fed thin cut sirloin steak cooked in grass-fed butter, paired with flame-grilled asparagus rods."
      },
      {
        name: "Hearty Tuscan Root Stew",
        calories: 440,
        protein: 16,
        carbs: 62,
        fat: 12,
        prepTime: "25m",
        tags: ["VEGAN", "FIBER-RICH"],
        imageUrl: getMatchingFoodImage("soup soup"),
        description: "Rich white bean broth incorporating slow-simmered carrots, tuscan kale, rosemary leaves, and warm butternut squash."
      }
    ]
  };

  const categoryKey = category as 'Breakfast' | 'Lunch' | 'Dinner';
  const defaultMeals = FALLBACKS[categoryKey] || FALLBACKS.Breakfast;

  if (!ai) {
    return res.json(defaultMeals);
  }

  try {
    const prompt = `You are a clinical-grade chef and performance dietitian. Generate a custom set of 3 healthy meal recommendations for ${categoryKey}.
    Personalization Context:
    - User Profile: ${height}cm, ${weight}kg.
    - Metabolic Active Focus: ${focus}.
    
    Ensure meals strictly match the meal style (e.g. Breakfast should be sunrise-focused, Lunch/Dinner more savory and energizing).
    Provide exact realistic nutritional estimations.
    
    Respond with a JSON array of exactly 3 meal objects:
    [
      {
        "name": "Meal Name",
        "calories": number (e.g. 420),
        "protein": number in grams,
        "carbs": number in grams,
        "fat": number in grams,
        "prepTime": "Prep time (e.g. 10m, 15m)",
        "tags": ["Tag1", "Tag2"] (all tags uppercase),
        "description": "Short appetizing Description"
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.INTEGER },
              protein: { type: Type.INTEGER },
              carbs: { type: Type.INTEGER },
              fat: { type: Type.INTEGER },
              prepTime: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              description: { type: Type.STRING }
            },
            required: ["name", "calories", "protein", "carbs", "fat", "prepTime", "tags", "description"]
          }
        }
      }
    });

    const parsed: any[] = JSON.parse(response.text?.trim() || "[]");
    
    // Inject dynamic hotlinked or beautiful image URLs to fit our exquisite UI standard
    const resolvedMeals = parsed.map(meal => ({
      ...meal,
      id: Math.random().toString(36).substring(2, 9),
      imageUrl: getMatchingFoodImage(meal.name + " " + (meal.description || ""))
    }));

    return res.json(resolvedMeals);
  } catch (err: any) {
    console.error("Gemini meals generator error:", err?.message || err);
    return res.json(defaultMeals);
  }
});

// Configure Vite integration for single-port full-stack architecture
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running securely on port ${PORT}`);
  });
}

startServer();
