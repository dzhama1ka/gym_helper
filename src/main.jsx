import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Apple,
  Bike,
  Calculator,
  CalendarDays,
  Camera,
  Dumbbell,
  Flame,
  HeartPulse,
  History,
  LineChart,
  Plus,
  Route,
  Search,
  Timer,
  Trash2,
  Trophy,
  UserRound,
  Utensils,
  Waves,
  Weight,
  X,
} from "lucide-react";
import "./styles.css";

const WORKOUT_KEY = "mobile-workout-tracker-v2";
const OLD_SETTINGS_KEY = "mobile-workout-tracker-settings-v1";
const PROFILE_KEY = "mobile-workout-tracker-profile-v1";
const WEIGHT_LOG_KEY = "mobile-workout-tracker-weight-log-v1";
const NUTRITION_KEY = "mobile-workout-tracker-nutrition-v1";

const strengthExercises = [
  "Жим лёжа",
  "Приседания",
  "Становая тяга",
  "Подтягивания",
  "Жим гантелей",
  "Тяга верхнего блока",
  "Выпады",
  "Планка",
];

const cardioProfiles = {
  "Беговая дорожка": {
    icon: "🏃",
    defaultDistance: "3",
    intensities: [
      { id: "walk-brisk", label: "Быстрая ходьба · 5.6–6.3 км/ч", met: 4.8 },
      { id: "run-8", label: "Лёгкий бег · 8.0–8.4 км/ч", met: 8.5 },
      { id: "run-10", label: "Бег · 9.7–10.1 км/ч", met: 9.3 },
      { id: "run-11", label: "Интенсивный бег · 11.3 км/ч", met: 11.0 },
      { id: "run-13", label: "Быстрый бег · 12.9 км/ч", met: 12.0 },
    ],
  },
  "Гребля": {
    icon: "🚣",
    defaultDistance: "2",
    intensities: [
      { id: "row-100", label: "Умеренно · до 100 Вт", met: 5.0 },
      { id: "row-149", label: "Интенсивно · 100–149 Вт", met: 7.5 },
      { id: "row-199", label: "Очень интенсивно · 150–199 Вт", met: 11.0 },
      { id: "row-200", label: "Максимально · 200+ Вт", met: 14.0 },
    ],
  },
  "Велосипед": {
    icon: "🚴",
    defaultDistance: "8",
    intensities: [
      { id: "bike-50", label: "Легко · 50 Вт", met: 4.0 },
      { id: "bike-100", label: "Умеренно · 90–100 Вт", met: 6.0 },
      { id: "bike-150", label: "Интенсивно · 126–150 Вт", met: 8.0 },
      { id: "bike-199", label: "Очень интенсивно · 151–199 Вт", met: 10.3 },
      { id: "bike-229", label: "Вигорозно · 200–229 Вт", met: 10.8 },
      { id: "bike-250", label: "Максимально · 230–250 Вт", met: 12.5 },
    ],
  },
  "Эллипс": {
    icon: "🔥",
    defaultDistance: "3",
    intensities: [
      { id: "elliptical-moderate", label: "Умеренно", met: 5.0 },
      { id: "elliptical-vigorous", label: "Интенсивно", met: 9.0 },
    ],
  },
};

const cardioAliases = {
  велотренажёр: "Велосипед",
  велотренажер: "Велосипед",
  bike: "Велосипед",
  cycling: "Велосипед",
  дорожка: "Беговая дорожка",
  бег: "Беговая дорожка",
  treadmill: "Беговая дорожка",
  rowing: "Гребля",
  "гребной тренажёр": "Гребля",
  "гребной тренажер": "Гребля",
  эллипсоид: "Эллипс",
  "эллиптический тренажёр": "Эллипс",
  "эллиптический тренажер": "Эллипс",
};

const activityLevels = [
  { value: "1.2", label: "Мало движения", detail: "сидячий день" },
  { value: "1.375", label: "Лёгкая активность", detail: "1–3 тренировки/нед." },
  { value: "1.55", label: "Средняя активность", detail: "3–5 тренировок/нед." },
  { value: "1.725", label: "Высокая активность", detail: "6–7 тренировок/нед." },
  { value: "1.9", label: "Очень высокая", detail: "спорт/физическая работа" },
];

const meals = [
  { id: "breakfast", label: "Завтрак" },
  { id: "lunch", label: "Обед" },
  { id: "dinner", label: "Ужин" },
  { id: "snack", label: "Перекус" },
];

const foodDatabase = [
  { id: "oatmeal", name: "Овсянка сухая", calories: 370, protein: 13, fat: 7, carbs: 60 },
  { id: "chicken", name: "Куриная грудка готовая", calories: 165, protein: 31, fat: 3.6, carbs: 0 },
  { id: "rice", name: "Рис варёный", calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
  { id: "buckwheat", name: "Гречка варёная", calories: 110, protein: 3.6, fat: 1.1, carbs: 21 },
  { id: "egg", name: "Яйцо куриное", calories: 143, protein: 13, fat: 10, carbs: 1.1 },
  { id: "banana", name: "Банан", calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
  { id: "cottage", name: "Творог 5%", calories: 121, protein: 17, fat: 5, carbs: 1.8 },
  { id: "salmon", name: "Лосось", calories: 208, protein: 20, fat: 13, carbs: 0 },
  { id: "potato", name: "Картофель варёный", calories: 87, protein: 1.9, fat: 0.1, carbs: 20 },
  { id: "broccoli", name: "Брокколи", calories: 35, protein: 2.4, fat: 0.4, carbs: 7 },
  { id: "oliveoil", name: "Оливковое масло", calories: 884, protein: 0, fat: 100, carbs: 0 },
  { id: "yogurt", name: "Греческий йогурт 2%", calories: 73, protein: 10, fat: 2, carbs: 3.6 },
];

const sampleMenu = [
  { meal: "breakfast", foodId: "oatmeal", grams: 60 },
  { meal: "breakfast", foodId: "banana", grams: 120 },
  { meal: "breakfast", foodId: "yogurt", grams: 150 },
  { meal: "lunch", foodId: "chicken", grams: 160 },
  { meal: "lunch", foodId: "buckwheat", grams: 220 },
  { meal: "lunch", foodId: "broccoli", grams: 200 },
  { meal: "snack", foodId: "cottage", grams: 180 },
  { meal: "dinner", foodId: "salmon", grams: 150 },
  { meal: "dinner", foodId: "rice", grams: 180 },
  { meal: "dinner", foodId: "broccoli", grams: 180 },
  { meal: "dinner", foodId: "oliveoil", grams: 8 },
];

const defaultProfile = {
  name: "",
  sex: "female",
  age: "25",
  heightCm: "170",
  weightKg: "70",
  targetWeightKg: "65",
  activityLevel: "1.55",
  weeklyChangeKg: "0.4",
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "short",
  }).format(new Date(dateString + "T12:00:00"));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function numeric(value, fallback = 0) {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) ? number : fallback;
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(numeric(value) * factor) / factor;
}

function emptyWorkoutForm() {
  return {
    type: "strength",
    name: "",
    sets: "3",
    reps: "10",
    weight: "",
    duration: "30",
    intensityId: "",
    distance: "",
    calories: "",
    note: "",
  };
}

function emptyFoodForm() {
  return {
    meal: "breakfast",
    foodId: "oatmeal",
    name: "",
    grams: "100",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
  };
}

function resolveCardioName(name) {
  const normalizedName = normalize(name);
  const profileName = Object.keys(cardioProfiles).find((profile) => normalize(profile) === normalizedName);
  if (profileName) return profileName;

  const alias = Object.keys(cardioAliases).find((key) => normalizedName.includes(normalize(key)));
  return alias ? cardioAliases[alias] : null;
}

function getCardioProfile(name) {
  const resolved = resolveCardioName(name);
  return resolved ? cardioProfiles[resolved] : null;
}

function getIntensity(profile, intensityId) {
  if (!profile) return null;
  return profile.intensities.find((item) => item.id === intensityId) || profile.intensities[0];
}

function calculateExerciseCalories({ met, weightKg, minutes }) {
  const numericMet = numeric(met);
  const numericWeight = numeric(weightKg);
  const numericMinutes = numeric(minutes);

  if (!numericMet || !numericWeight || !numericMinutes) return 0;

  return Math.round(((numericMet * 3.5 * numericWeight) / 200) * numericMinutes);
}

function calculateFoodAmount(food, grams) {
  const multiplier = numeric(grams) / 100;
  return {
    calories: Math.round(numeric(food.calories) * multiplier),
    protein: round(numeric(food.protein) * multiplier, 1),
    fat: round(numeric(food.fat) * multiplier, 1),
    carbs: round(numeric(food.carbs) * multiplier, 1),
  };
}

function calculateBmi(weightKg, heightCm) {
  const weight = numeric(weightKg);
  const heightM = numeric(heightCm) / 100;
  if (!weight || !heightM) return 0;
  return weight / heightM ** 2;
}

function bmiCategory(bmi) {
  if (!bmi) return "—";
  if (bmi < 18.5) return "ниже нормы";
  if (bmi < 25) return "норма";
  if (bmi < 30) return "избыточный вес";
  return "ожирение";
}

function calculateBmr(profile) {
  const weight = numeric(profile.weightKg);
  const height = numeric(profile.heightCm);
  const age = numeric(profile.age);
  if (!weight || !height || !age) return 0;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(profile.sex === "male" ? base + 5 : base - 161);
}

function calculateNutritionPlan(profile) {
  const weight = numeric(profile.weightKg, 70);
  const targetWeight = numeric(profile.targetWeightKg, weight);
  const weeklyChange = Math.abs(numeric(profile.weeklyChangeKg, 0.4));
  const bmr = calculateBmr(profile);
  const tdee = Math.round(bmr * numeric(profile.activityLevel, 1.55));
  const direction = targetWeight < weight ? -1 : targetWeight > weight ? 1 : 0;
  const dailyAdjustment = direction * Math.round((weeklyChange * 7700) / 7);
  const targetCalories = Math.max(1200, Math.round(tdee + dailyAdjustment));

  const proteinPerKg = direction < 0 ? 1.6 : direction > 0 ? 1.8 : 1.4;
  const protein = Math.round(weight * proteinPerKg);
  const fatByWeight = Math.round(weight * 0.8);
  const fatByEnergyMin = Math.round((targetCalories * 0.2) / 9);
  const fat = Math.max(fatByWeight, fatByEnergyMin);
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbs = Math.max(0, Math.round((targetCalories - proteinCalories - fatCalories) / 4));

  return { bmr, tdee, targetCalories, dailyAdjustment, protein, fat, carbs, direction };
}

function daysBetween(a, b) {
  const start = new Date(a + "T12:00:00");
  const end = new Date(b + "T12:00:00");
  return Math.max(1, Math.round((end - start) / 86400000));
}

function calculateWeightTrend(weightLog, targetWeight) {
  const sorted = [...weightLog]
    .filter((item) => numeric(item.weightKg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length < 2) return null;

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const days = daysBetween(first.date, last.date);
  const delta = numeric(last.weightKg) - numeric(first.weightKg);
  const kgPerWeek = (delta / days) * 7;
  const caloriesPerDay = Math.round((Math.abs(delta) * 7700) / days);
  const remaining = numeric(targetWeight) - numeric(last.weightKg);
  const movingToGoal = Math.sign(remaining) === Math.sign(kgPerWeek) && Math.abs(kgPerWeek) > 0.03;
  const weeksToGoal = movingToGoal ? Math.abs(remaining / kgPerWeek) : null;

  return {
    first,
    last,
    days,
    delta,
    kgPerWeek,
    caloriesPerDay,
    weeksToGoal,
  };
}

function volume(entry) {
  if (entry.type !== "strength") return 0;
  return numeric(entry.sets) * numeric(entry.reps) * numeric(entry.weight);
}

function App() {
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [weightLog, setWeightLog] = useState([]);
  const [nutritionEntries, setNutritionEntries] = useState([]);
  const [tab, setTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [workoutForm, setWorkoutForm] = useState(emptyWorkoutForm());
  const [foodForm, setFoodForm] = useState(emptyFoodForm());
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weightForm, setWeightForm] = useState({ date: todayISO(), weightKg: "" });
  const [scanner, setScanner] = useState({ active: false, message: "", product: null });
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanFrameRef = useRef(null);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(WORKOUT_KEY);
      const savedOldSettings = localStorage.getItem(OLD_SETTINGS_KEY);
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      const savedWeightLog = localStorage.getItem(WEIGHT_LOG_KEY);
      const savedNutrition = localStorage.getItem(NUTRITION_KEY);

      if (savedEntries) setEntries(JSON.parse(savedEntries));
      if (savedProfile) {
        setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
      } else if (savedOldSettings) {
        const oldSettings = JSON.parse(savedOldSettings);
        setProfile({ ...defaultProfile, weightKg: String(oldSettings.bodyWeightKg || "70") });
      }
      if (savedWeightLog) setWeightLog(JSON.parse(savedWeightLog));
      if (savedNutrition) setNutritionEntries(JSON.parse(savedNutrition));
    } catch (error) {
      console.error("Не удалось загрузить данные", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WORKOUT_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(weightLog));
  }, [weightLog]);

  useEffect(() => {
    localStorage.setItem(NUTRITION_KEY, JSON.stringify(nutritionEntries));
  }, [nutritionEntries]);

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const cardioNames = Object.keys(cardioProfiles);

  const exerciseNames = useMemo(() => {
    const names = new Set([...strengthExercises, ...cardioNames]);
    entries.forEach((entry) => names.add(entry.name));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "ru"));
  }, [entries]);

  const resolvedCardioName = workoutForm.type === "cardio" ? resolveCardioName(workoutForm.name) || workoutForm.name : null;
  const cardioProfile = workoutForm.type === "cardio" ? getCardioProfile(workoutForm.name) || cardioProfiles["Беговая дорожка"] : null;
  const selectedIntensity = getIntensity(cardioProfile, workoutForm.intensityId);
  const estimatedWorkoutCalories = calculateExerciseCalories({
    met: selectedIntensity?.met,
    weightKg: profile.weightKg,
    minutes: workoutForm.duration,
  });

  const suggestions = useMemo(() => {
    const value = normalize(workoutForm.name);
    const source = workoutForm.type === "cardio" ? cardioNames : exerciseNames;
    if (!value) return source.slice(0, 7);
    return source.filter((name) => normalize(name).includes(value)).slice(0, 7);
  }, [exerciseNames, workoutForm.name, workoutForm.type]);

  const dateEntries = useMemo(() => {
    return entries
      .filter((entry) => entry.date === selectedDate)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, selectedDate]);

  const groupedHistory = useMemo(() => {
    const filtered = entries.filter((entry) => entry.name.toLowerCase().includes(query.trim().toLowerCase()));
    return filtered.reduce((acc, entry) => {
      if (!acc[entry.date]) acc[entry.date] = [];
      acc[entry.date].push(entry);
      return acc;
    }, {});
  }, [entries, query]);

  const sortedHistoryDates = useMemo(() => Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a)), [groupedHistory]);

  const nutritionPlan = useMemo(() => calculateNutritionPlan(profile), [profile]);
  const bmi = useMemo(() => calculateBmi(profile.weightKg, profile.heightCm), [profile.weightKg, profile.heightCm]);
  const trend = useMemo(() => calculateWeightTrend(weightLog, profile.targetWeightKg), [weightLog, profile.targetWeightKg]);

  const selectedFood = foodDatabase.find((item) => item.id === foodForm.foodId) || foodDatabase[0];
  const foodSource = foodForm.name.trim()
    ? {
        name: foodForm.name.trim(),
        calories: numeric(foodForm.calories),
        protein: numeric(foodForm.protein),
        fat: numeric(foodForm.fat),
        carbs: numeric(foodForm.carbs),
      }
    : selectedFood;
  const foodPreview = calculateFoodAmount(foodSource, foodForm.grams);

  const dayNutrition = useMemo(() => {
    const daily = nutritionEntries.filter((item) => item.date === selectedDate);
    const totals = daily.reduce(
      (acc, item) => ({
        calories: acc.calories + numeric(item.total.calories),
        protein: acc.protein + numeric(item.total.protein),
        fat: acc.fat + numeric(item.total.fat),
        carbs: acc.carbs + numeric(item.total.carbs),
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    return { daily, totals };
  }, [nutritionEntries, selectedDate]);

  const groupedNutrition = useMemo(() => {
    return meals.reduce((acc, meal) => {
      acc[meal.id] = dayNutrition.daily.filter((item) => item.meal === meal.id);
      return acc;
    }, {});
  }, [dayNutrition.daily]);

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function setWorkoutField(field, value) {
    setWorkoutForm((current) => ({ ...current, [field]: value }));
  }

  function selectWorkoutType(type) {
    setWorkoutForm((current) => ({
      ...emptyWorkoutForm(),
      type,
      name: type === "cardio" ? "Беговая дорожка" : current.name,
    }));
    setShowSuggestions(false);
  }

  function selectSuggestion(name) {
    const profileForCardio = getCardioProfile(name);
    setWorkoutForm((current) => ({
      ...current,
      name,
      distance: current.type === "cardio" ? profileForCardio?.defaultDistance || current.distance : current.distance,
      intensityId: current.type === "cardio" ? profileForCardio?.intensities[0]?.id || "" : current.intensityId,
    }));
    setShowSuggestions(false);
  }

  function addWorkoutEntry(event) {
    event.preventDefault();
    const name = workoutForm.name.trim();
    if (!name) return;

    if (workoutForm.type === "cardio") {
      const profileForEntry = getCardioProfile(name) || cardioProfile;
      const intensity = getIntensity(profileForEntry, workoutForm.intensityId);
      const minutes = numeric(workoutForm.duration);
      const calories = numeric(workoutForm.calories) || calculateExerciseCalories({
        met: intensity?.met,
        weightKg: profile.weightKg,
        minutes,
      });

      if (minutes <= 0) return;

      setEntries((current) => [
        {
          id: uid(),
          date: selectedDate,
          type: "cardio",
          name: resolveCardioName(name) || name,
          duration: minutes,
          intensityId: intensity?.id || "",
          intensityLabel: intensity?.label || "",
          met: intensity?.met || 0,
          distance: numeric(workoutForm.distance),
          calories,
          note: workoutForm.note.trim(),
          createdAt: Date.now(),
        },
        ...current,
      ]);
    } else {
      const sets = numeric(workoutForm.sets);
      const reps = numeric(workoutForm.reps);
      if (sets <= 0 || reps <= 0) return;

      setEntries((current) => [
        {
          id: uid(),
          date: selectedDate,
          type: "strength",
          name,
          sets,
          reps,
          weight: workoutForm.weight === "" ? "" : numeric(workoutForm.weight),
          note: workoutForm.note.trim(),
          createdAt: Date.now(),
        },
        ...current,
      ]);
    }

    setWorkoutForm({ ...emptyWorkoutForm(), type: workoutForm.type, name });
    setShowSuggestions(false);
  }

  function deleteWorkoutEntry(id) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function addWeightRecord(event) {
    event.preventDefault();
    const weight = numeric(weightForm.weightKg || profile.weightKg);
    if (!weight || !weightForm.date) return;

    setWeightLog((current) => {
      const withoutSameDate = current.filter((item) => item.date !== weightForm.date);
      return [...withoutSameDate, { id: uid(), date: weightForm.date, weightKg: weight }].sort((a, b) => b.date.localeCompare(a.date));
    });
    setProfile((current) => ({ ...current, weightKg: String(weight) }));
    setWeightForm({ date: todayISO(), weightKg: "" });
  }

  function deleteWeightRecord(id) {
    setWeightLog((current) => current.filter((item) => item.id !== id));
  }

  function selectFood(foodId) {
    const food = foodDatabase.find((item) => item.id === foodId) || foodDatabase[0];
    setFoodForm((current) => ({
      ...current,
      foodId,
      name: "",
      calories: String(food.calories),
      protein: String(food.protein),
      fat: String(food.fat),
      carbs: String(food.carbs),
    }));
  }

  function addNutritionEntry(event) {
    event.preventDefault();
    const food = foodSource;
    const grams = numeric(foodForm.grams);
    if (!food.name || grams <= 0) return;

    const total = calculateFoodAmount(food, grams);
    setNutritionEntries((current) => [
      {
        id: uid(),
        date: selectedDate,
        meal: foodForm.meal,
        name: food.name,
        grams,
        per100: {
          calories: numeric(food.calories),
          protein: numeric(food.protein),
          fat: numeric(food.fat),
          carbs: numeric(food.carbs),
        },
        total,
        createdAt: Date.now(),
      },
      ...current,
    ]);
    setFoodForm(emptyFoodForm());
  }

  function deleteNutritionEntry(id) {
    setNutritionEntries((current) => current.filter((item) => item.id !== id));
  }

  function addSampleMenu() {
    const baseItems = sampleMenu.map((item) => {
      const food = foodDatabase.find((foodItem) => foodItem.id === item.foodId);
      return { ...item, food, total: calculateFoodAmount(food, item.grams) };
    });
    const baseCalories = baseItems.reduce((sum, item) => sum + item.total.calories, 0);
    const ratio = Math.min(1.45, Math.max(0.65, nutritionPlan.targetCalories / baseCalories));

    const generated = baseItems.map((item) => {
      const grams = Math.round((item.grams * ratio) / 5) * 5;
      const total = calculateFoodAmount(item.food, grams);
      return {
        id: uid(),
        date: selectedDate,
        meal: item.meal,
        name: item.food.name,
        grams,
        per100: {
          calories: item.food.calories,
          protein: item.food.protein,
          fat: item.food.fat,
          carbs: item.food.carbs,
        },
        total,
        createdAt: Date.now(),
      };
    });

    setNutritionEntries((current) => [...generated, ...current.filter((item) => item.date !== selectedDate)]);
  }

  async function fetchOpenFoodFactsProduct(code) {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
      code
    )}.json?fields=product_name,brands,nutriments,serving_size`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Не удалось получить продукт");
    const data = await response.json();
    if (data.status !== 1 || !data.product) throw new Error("Продукт не найден в базе Open Food Facts");

    const nutriments = data.product.nutriments || {};
    const calories = nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0;
    const protein = nutriments.proteins_100g || 0;
    const fat = nutriments.fat_100g || 0;
    const carbs = nutriments.carbohydrates_100g || 0;
    const name = [data.product.product_name, data.product.brands].filter(Boolean).join(" · ") || `Продукт ${code}`;

    setFoodForm((current) => ({
      ...current,
      name,
      calories: String(round(calories, 1)),
      protein: String(round(protein, 1)),
      fat: String(round(fat, 1)),
      carbs: String(round(carbs, 1)),
    }));
    setScanner({ active: false, message: `Найдено: ${name}`, product: { code, name } });
  }

  function stopScanner() {
    if (scanFrameRef.current) cancelAnimationFrame(scanFrameRef.current);
    scanFrameRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanner((current) => ({ ...current, active: false }));
  }

  async function startScanner() {
    try {
      if (!("BarcodeDetector" in window)) {
        setScanner({
          active: false,
          message: "Этот браузер не поддерживает BarcodeDetector. Можно ввести продукт вручную.",
          product: null,
        });
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setScanner({ active: false, message: "Камера недоступна в этом браузере.", product: null });
        return;
      }

      const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanner({ active: true, message: "Наведи камеру на штрихкод упаковки", product: null });

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 0);

      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            const code = codes[0].rawValue;
            stopScanner();
            setScanner({ active: false, message: `Штрихкод найден: ${code}. Ищу продукт...`, product: { code } });
            await fetchOpenFoodFactsProduct(code);
            return;
          }
        } catch (error) {
          console.error(error);
        }
        scanFrameRef.current = requestAnimationFrame(scan);
      };

      scanFrameRef.current = requestAnimationFrame(scan);
    } catch (error) {
      stopScanner();
      setScanner({ active: false, message: error.message || "Не удалось открыть камеру", product: null });
    }
  }

  return (
    <div className="app-shell">
      <div className="phone">
        <header className="header">
          <div className="header-top">
            <div>
              <p className="eyebrow">Training & Nutrition</p>
              <h1>Мой фитнес-дневник</h1>
            </div>
            <div className="logo"><HeartPulse /></div>
          </div>

          <div className="tabs four-tabs">
            <TabButton active={tab === "today"} onClick={() => setTab("today")} icon={Dumbbell} label="Трен" />
            <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={History} label="История" />
            <TabButton active={tab === "profile"} onClick={() => setTab("profile")} icon={UserRound} label="Профиль" />
            <TabButton active={tab === "nutrition"} onClick={() => setTab("nutrition")} icon={Utensils} label="Питание" />
          </div>
        </header>

        <main className="main">
          {tab === "today" && (
            <section className="screen stack">
              <DateCard selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

              <form onSubmit={addWorkoutEntry} className="card stack">
                <div className="section-head">
                  <div>
                    <h2>Добавить упражнение</h2>
                    <p>Силовые и кардио сохраняются в одном дневнике</p>
                  </div>
                  <button type="button" className="icon-button" onClick={() => setWorkoutForm(emptyWorkoutForm())} aria-label="Очистить форму">
                    <X size={18} />
                  </button>
                </div>

                <div className="segmented">
                  <button type="button" className={workoutForm.type === "strength" ? "active" : ""} onClick={() => selectWorkoutType("strength")}>Силовое</button>
                  <button type="button" className={workoutForm.type === "cardio" ? "active" : ""} onClick={() => selectWorkoutType("cardio")}>Кардио</button>
                </div>

                <div className="field with-dropdown">
                  <label>Упражнение</label>
                  <input
                    value={workoutForm.name}
                    onChange={(event) => {
                      setWorkoutField("name", event.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={workoutForm.type === "cardio" ? "Например: беговая дорожка" : "Например: жим лёжа"}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="dropdown">
                      {suggestions.map((name) => (
                        <button key={name} type="button" onClick={() => selectSuggestion(name)}>{name}</button>
                      ))}
                    </div>
                  )}
                </div>

                {workoutForm.type === "cardio" ? (
                  <div className="stack">
                    <div className="info-card compact-info">
                      <span>{cardioProfile?.icon || "🔥"}</span>
                      <div>
                        <strong>{resolvedCardioName || "Кардио"}</strong>
                        <p>Ккал считаются по весу из профиля: {profile.weightKg || 70} кг</p>
                      </div>
                    </div>

                    <div className="field">
                      <label>Сложность / настройка</label>
                      <select value={workoutForm.intensityId || selectedIntensity?.id || ""} onChange={(event) => setWorkoutField("intensityId", event.target.value)}>
                        {cardioProfile?.intensities.map((item) => (
                          <option key={item.id} value={item.id}>{item.label} · MET {item.met}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid-2">
                      <NumberField label="Время, мин" value={workoutForm.duration} onChange={(value) => setWorkoutField("duration", value)} />
                      <NumberField label="Дистанция, км" value={workoutForm.distance || cardioProfile?.defaultDistance || ""} onChange={(value) => setWorkoutField("distance", value)} />
                    </div>
                    <div className="grid-2">
                      <NumberField label="Ккал вручную" value={workoutForm.calories} onChange={(value) => setWorkoutField("calories", value)} placeholder={String(estimatedWorkoutCalories)} />
                      <ReadOnlyMetric label="Оценка" value={`${estimatedWorkoutCalories} ккал`} />
                    </div>
                  </div>
                ) : (
                  <div className="grid-3">
                    <NumberField label="Подходы" value={workoutForm.sets} onChange={(value) => setWorkoutField("sets", value)} />
                    <NumberField label="Повторы" value={workoutForm.reps} onChange={(value) => setWorkoutField("reps", value)} />
                    <NumberField label="Вес, кг" value={workoutForm.weight} onChange={(value) => setWorkoutField("weight", value)} placeholder="0" />
                  </div>
                )}

                <div className="field">
                  <label>Заметка</label>
                  <textarea
                    value={workoutForm.note}
                    onChange={(event) => setWorkoutField("note", event.target.value)}
                    placeholder="Например: увеличить вес на следующей тренировке"
                    rows={3}
                  />
                </div>

                <button className="primary-button" type="submit"><Plus size={19} /> Добавить</button>
              </form>

              <section className="stack">
                <div className="section-head inline">
                  <h2>{formatDate(selectedDate)}</h2>
                  <span className="pill">{dateEntries.length} записей</span>
                </div>
                {dateEntries.length === 0 ? (
                  <EmptyState text="За этот день пока нет упражнений." />
                ) : (
                  <div className="stack small-gap">
                    {dateEntries.map((entry) => <ExerciseCard key={entry.id} entry={entry} onDelete={() => deleteWorkoutEntry(entry.id)} />)}
                  </div>
                )}
              </section>
            </section>
          )}

          {tab === "history" && (
            <section className="screen stack">
              <div className="search-box">
                <Search size={20} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти упражнение" />
              </div>
              {sortedHistoryDates.length === 0 ? (
                <EmptyState text="История пустая. После первой тренировки записи появятся здесь." />
              ) : (
                sortedHistoryDates.map((date) => (
                  <section key={date} className="stack small-gap">
                    <h2 className="date-title">{formatDate(date)}</h2>
                    {groupedHistory[date]
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map((entry) => <ExerciseCard key={entry.id} entry={entry} onDelete={() => deleteWorkoutEntry(entry.id)} compact />)}
                  </section>
                ))
              )}
            </section>
          )}

          {tab === "profile" && (
            <section className="screen stack">
              <div className="card stack">
                <div className="section-head">
                  <div>
                    <h2>Профиль</h2>
                    <p>Эти данные нужны для ккал, БЖУ и графика веса</p>
                  </div>
                  <UserRound className="muted-icon" />
                </div>

                <div className="field">
                  <label>Имя</label>
                  <input value={profile.name} onChange={(event) => updateProfile("name", event.target.value)} placeholder="Например: Мария" />
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label>Пол</label>
                    <select value={profile.sex} onChange={(event) => updateProfile("sex", event.target.value)}>
                      <option value="female">Женский</option>
                      <option value="male">Мужской</option>
                    </select>
                  </div>
                  <NumberField label="Возраст" value={profile.age} onChange={(value) => updateProfile("age", value)} />
                </div>

                <div className="grid-3">
                  <NumberField label="Рост, см" value={profile.heightCm} onChange={(value) => updateProfile("heightCm", value)} />
                  <NumberField label="Вес, кг" value={profile.weightKg} onChange={(value) => updateProfile("weightKg", value)} />
                  <NumberField label="Цель, кг" value={profile.targetWeightKg} onChange={(value) => updateProfile("targetWeightKg", value)} />
                </div>

                <div className="field">
                  <label>Активность</label>
                  <select value={profile.activityLevel} onChange={(event) => updateProfile("activityLevel", event.target.value)}>
                    {activityLevels.map((level) => <option key={level.value} value={level.value}>{level.label} · {level.detail}</option>)}
                  </select>
                </div>

                <NumberField
                  label="План изменения веса, кг/нед."
                  value={profile.weeklyChangeKg}
                  onChange={(value) => updateProfile("weeklyChangeKg", value)}
                />
              </div>

              <div className="grid-2">
                <StatCard icon={Calculator} label="BMR" value={`${nutritionPlan.bmr || 0}`} suffix="ккал" />
                <StatCard icon={Flame} label="TDEE" value={`${nutritionPlan.tdee || 0}`} suffix="ккал" />
                <StatCard icon={Activity} label="Цель питания" value={`${nutritionPlan.targetCalories || 0}`} suffix="ккал" />
                <StatCard icon={Weight} label="BMI" value={bmi ? round(bmi, 1) : "—"} suffix={bmiCategory(bmi)} />
              </div>

              <div className="card stack">
                <div className="section-head">
                  <div>
                    <h2>Цель по БЖУ</h2>
                    <p>Автоматический ориентир на день</p>
                  </div>
                  <Apple className="muted-icon" />
                </div>
                <div className="macro-row">
                  <MacroChip label="Белки" value={nutritionPlan.protein} unit="г" />
                  <MacroChip label="Жиры" value={nutritionPlan.fat} unit="г" />
                  <MacroChip label="Углеводы" value={nutritionPlan.carbs} unit="г" />
                </div>
                <p className="hint">
                  Это расчетный ориентир, не медицинское назначение. При заболеваниях, беременности, РПП или приеме препаратов питание лучше согласовывать со специалистом.
                </p>
              </div>

              <div className="card stack">
                <div className="section-head">
                  <div>
                    <h2>График веса</h2>
                    <p>Смотри тренд, а не случайные колебания воды</p>
                  </div>
                  <LineChart className="muted-icon" />
                </div>
                <form onSubmit={addWeightRecord} className="grid-3 align-end">
                  <div className="field grid-span-1">
                    <label>Дата</label>
                    <input type="date" value={weightForm.date} onChange={(event) => setWeightForm((current) => ({ ...current, date: event.target.value }))} />
                  </div>
                  <NumberField label="Вес" value={weightForm.weightKg} onChange={(value) => setWeightForm((current) => ({ ...current, weightKg: value }))} placeholder={profile.weightKg} />
                  <button className="mini-primary" type="submit"><Plus size={18} /></button>
                </form>
                <WeightChart data={weightLog} targetWeight={profile.targetWeightKg} />
                {trend ? (
                  <div className="trend-box">
                    <p><strong>{trend.delta > 0 ? "+" : ""}{round(trend.delta, 1)} кг</strong> за {trend.days} дн.</p>
                    <p>Темп: <strong>{trend.kgPerWeek > 0 ? "+" : ""}{round(trend.kgPerWeek, 2)} кг/нед.</strong></p>
                    <p>Средний энергетический сдвиг: ~{trend.caloriesPerDay} ккал/день.</p>
                    {trend.weeksToGoal ? <p>До цели при текущем темпе: ~{Math.ceil(trend.weeksToGoal)} нед.</p> : <p>Текущий тренд пока не ведет к цели или данных мало.</p>}
                  </div>
                ) : (
                  <p className="hint">Добавь минимум две записи веса в разные даты, чтобы увидеть темп изменения.</p>
                )}
                <div className="weight-list">
                  {weightLog.slice(0, 5).map((item) => (
                    <div key={item.id} className="mini-row">
                      <span>{formatDate(item.date)}</span>
                      <strong>{item.weightKg} кг</strong>
                      <button type="button" onClick={() => deleteWeightRecord(item.id)}><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "nutrition" && (
            <section className="screen stack">
              <DateCard selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

              <div className="card stack nutrition-summary">
                <div className="section-head">
                  <div>
                    <h2>Питание за день</h2>
                    <p>Цель: {nutritionPlan.targetCalories} ккал</p>
                  </div>
                  <Utensils className="muted-icon" />
                </div>
                <ProgressBar value={dayNutrition.totals.calories} max={nutritionPlan.targetCalories} />
                <div className="grid-4 compact-grid">
                  <MacroChip label="Ккал" value={Math.round(dayNutrition.totals.calories)} unit="" target={nutritionPlan.targetCalories} />
                  <MacroChip label="Белки" value={round(dayNutrition.totals.protein, 1)} unit="г" target={nutritionPlan.protein} />
                  <MacroChip label="Жиры" value={round(dayNutrition.totals.fat, 1)} unit="г" target={nutritionPlan.fat} />
                  <MacroChip label="Углев." value={round(dayNutrition.totals.carbs, 1)} unit="г" target={nutritionPlan.carbs} />
                </div>
              </div>

              <form onSubmit={addNutritionEntry} className="card stack">
                <div className="section-head">
                  <div>
                    <h2>Добавить продукт</h2>
                    <p>Выбери из базы или введи данные с этикетки</p>
                  </div>
                  <Apple className="muted-icon" />
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label>Приём пищи</label>
                    <select value={foodForm.meal} onChange={(event) => setFoodForm((current) => ({ ...current, meal: event.target.value }))}>
                      {meals.map((meal) => <option key={meal.id} value={meal.id}>{meal.label}</option>)}
                    </select>
                  </div>
                  <NumberField label="Граммы" value={foodForm.grams} onChange={(value) => setFoodForm((current) => ({ ...current, grams: value }))} />
                </div>

                <div className="field">
                  <label>Быстрая база</label>
                  <select value={foodForm.foodId} onChange={(event) => selectFood(event.target.value)}>
                    {foodDatabase.map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
                  </select>
                </div>

                <details className="details-box">
                  <summary>Ввести свой продукт / данные с этикетки</summary>
                  <div className="stack details-content">
                    <div className="field">
                      <label>Название продукта</label>
                      <input value={foodForm.name} onChange={(event) => setFoodForm((current) => ({ ...current, name: event.target.value }))} placeholder="Например: йогурт клубничный" />
                    </div>
                    <div className="grid-4 compact-grid">
                      <NumberField label="Ккал/100г" value={foodForm.calories} onChange={(value) => setFoodForm((current) => ({ ...current, calories: value }))} />
                      <NumberField label="Б/100г" value={foodForm.protein} onChange={(value) => setFoodForm((current) => ({ ...current, protein: value }))} />
                      <NumberField label="Ж/100г" value={foodForm.fat} onChange={(value) => setFoodForm((current) => ({ ...current, fat: value }))} />
                      <NumberField label="У/100г" value={foodForm.carbs} onChange={(value) => setFoodForm((current) => ({ ...current, carbs: value }))} />
                    </div>
                  </div>
                </details>

                <div className="info-card compact-info">
                  <span>≈</span>
                  <div>
                    <strong>{foodPreview.calories} ккал</strong>
                    <p>Б {foodPreview.protein} г · Ж {foodPreview.fat} г · У {foodPreview.carbs} г</p>
                  </div>
                </div>

                <button className="primary-button" type="submit"><Plus size={19} /> Добавить продукт</button>
              </form>

              <div className="card stack">
                <div className="section-head">
                  <div>
                    <h2>Сканер упаковки</h2>
                    <p>Считывает штрихкод и ищет БЖУ в Open Food Facts</p>
                  </div>
                  <Camera className="muted-icon" />
                </div>
                {scanner.active && <video ref={videoRef} className="scanner-video" muted playsInline />}
                <div className="grid-2">
                  <button type="button" className="secondary-button" onClick={scanner.active ? stopScanner : startScanner}>
                    <Camera size={18} /> {scanner.active ? "Остановить" : "Сканировать"}
                  </button>
                  <button type="button" className="secondary-button" onClick={addSampleMenu}>
                    <Utensils size={18} /> Меню на день
                  </button>
                </div>
                {scanner.message && <p className="hint">{scanner.message}</p>}
                <p className="hint">Камера работает только на HTTPS или localhost. По фото тарелки точность ограничена: без веса порции приложение не знает реальное количество граммов.</p>
              </div>

              <section className="stack">
                {meals.map((meal) => {
                  const items = groupedNutrition[meal.id] || [];
                  return (
                    <div key={meal.id} className="card stack small-gap">
                      <div className="section-head inline">
                        <h2>{meal.label}</h2>
                        <span className="pill">{items.reduce((sum, item) => sum + item.total.calories, 0)} ккал</span>
                      </div>
                      {items.length === 0 ? <p className="hint">Пока пусто.</p> : items.map((item) => (
                        <FoodCard key={item.id} item={item} onDelete={() => deleteNutritionEntry(item.id)} />
                      ))}
                    </div>
                  );
                })}
              </section>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return <button onClick={onClick} className={`tab ${active ? "active" : ""}`}><Icon size={17} />{label}</button>;
}

function DateCard({ selectedDate, setSelectedDate }) {
  return (
    <div className="card compact-card">
      <label className="date-label"><CalendarDays size={18} /> Дата</label>
      <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
    </div>
  );
}

function NumberField({ label, value, onChange, placeholder }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="number" inputMode="decimal" min="0" step="any" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ReadOnlyMetric({ label, value }) {
  return (
    <div className="read-only-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ExerciseCard({ entry, onDelete, compact = false }) {
  const isCardio = entry.type === "cardio";
  const currentVolume = volume(entry);
  return (
    <article className="exercise-card">
      <div className="card-top">
        <div>
          <div className="type-line">
            <span className={`type-dot ${isCardio ? "cardio" : "strength"}`} />
            {isCardio ? "Кардио" : "Силовое"}
          </div>
          <h3>{entry.name}</h3>
          {!compact && entry.note && <p className="entry-note">{entry.note}</p>}
        </div>
        <button onClick={onDelete} className="delete-button" aria-label="Удалить"><Trash2 size={17} /></button>
      </div>

      {isCardio ? (
        <div className="metric-grid cardio-metrics">
          <MiniMetric icon={Timer} label="Время" value={`${entry.duration} мин`} />
          <MiniMetric icon={Route} label="Дистанция" value={entry.distance ? `${entry.distance} км` : "—"} />
          <MiniMetric icon={Flame} label="Ккал" value={entry.calories || "—"} />
          <MiniMetric icon={Activity} label="MET" value={entry.met || "—"} />
        </div>
      ) : (
        <div className="metric-grid">
          <MiniMetric icon={Dumbbell} label="Подходы" value={entry.sets} />
          <MiniMetric icon={Activity} label="Повторы" value={entry.reps} />
          <MiniMetric icon={Weight} label="Вес" value={entry.weight ? `${entry.weight} кг` : "—"} />
        </div>
      )}

      {isCardio && entry.intensityLabel && <p className="hint tight">{entry.intensityLabel}</p>}
      {!isCardio && currentVolume > 0 && <p className="volume-line">Объём: <strong>{currentVolume.toLocaleString("ru-RU")} кг</strong></p>}
    </article>
  );
}

function MiniMetric({ icon: Icon, label, value }) {
  return (
    <div className="mini-metric">
      <Icon size={15} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix }) {
  return (
    <div className="stat-card">
      <Icon size={20} />
      <strong>{value}</strong>
      <span>{label}</span>
      {suffix && <em>{suffix}</em>}
    </div>
  );
}

function MacroChip({ label, value, unit, target }) {
  return (
    <div className="macro-chip">
      <span>{label}</span>
      <strong>{value}{unit && ` ${unit}`}</strong>
      {target ? <small>/ {target}{unit && ` ${unit}`}</small> : null}
    </div>
  );
}

function ProgressBar({ value, max }) {
  const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress-wrap">
      <div className="progress-head"><span>{Math.round(value)} ккал</span><span>{percent}%</span></div>
      <div className="progress"><span style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

function WeightChart({ data, targetWeight }) {
  const points = [...data]
    .filter((item) => numeric(item.weightKg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length < 2) {
    return <div className="chart-empty">Недостаточно данных для графика</div>;
  }

  const width = 320;
  const height = 170;
  const padding = 26;
  const values = points.map((item) => numeric(item.weightKg));
  const target = numeric(targetWeight);
  const min = Math.min(...values, target || Infinity) - 1;
  const max = Math.max(...values, target || -Infinity) + 1;
  const firstDate = new Date(points[0].date + "T12:00:00").getTime();
  const lastDate = new Date(points[points.length - 1].date + "T12:00:00").getTime();
  const span = Math.max(1, lastDate - firstDate);

  const coords = points.map((item) => {
    const x = padding + ((new Date(item.date + "T12:00:00").getTime() - firstDate) / span) * (width - padding * 2);
    const y = height - padding - ((numeric(item.weightKg) - min) / (max - min)) * (height - padding * 2);
    return { x, y, ...item };
  });
  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const targetY = target ? height - padding - ((target - min) / (max - min)) * (height - padding * 2) : null;

  return (
    <svg className="weight-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График изменения веса">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="axis" />
      {targetY && <line x1={padding} y1={targetY} x2={width - padding} y2={targetY} className="target-line" />}
      <path d={path} className="weight-path" />
      {coords.map((point) => <circle key={point.id || point.date} cx={point.x} cy={point.y} r="4" className="weight-point" />)}
      <text x={padding} y={18} className="chart-label">{round(max, 1)} кг</text>
      <text x={padding} y={height - 6} className="chart-label">{round(min, 1)} кг</text>
      {targetY && <text x={width - padding - 65} y={targetY - 6} className="target-label">цель {target} кг</text>}
    </svg>
  );
}

function FoodCard({ item, onDelete }) {
  const mealLabel = meals.find((meal) => meal.id === item.meal)?.label || "Еда";
  return (
    <article className="food-card">
      <div>
        <span>{mealLabel} · {item.grams} г</span>
        <h3>{item.name}</h3>
        <p>Б {item.total.protein} г · Ж {item.total.fat} г · У {item.total.carbs} г</p>
      </div>
      <div className="food-side">
        <strong>{item.total.calories}</strong>
        <small>ккал</small>
        <button onClick={onDelete} aria-label="Удалить"><Trash2 size={15} /></button>
      </div>
    </article>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <Dumbbell size={28} />
      <p>{text}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
