
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Bike,
  CalendarDays,
  Dumbbell,
  Flame,
  History,
  Plus,
  Route,
  Search,
  Settings2,
  Timer,
  Trash2,
  Trophy,
  Waves,
  Weight,
  X,
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "mobile-workout-tracker-v2";
const SETTINGS_KEY = "mobile-workout-tracker-settings-v1";

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
  "велотренажёр": "Велосипед",
  "велотренажер": "Велосипед",
  "bike": "Велосипед",
  "cycling": "Велосипед",
  "дорожка": "Беговая дорожка",
  "бег": "Беговая дорожка",
  "treadmill": "Беговая дорожка",
  "rowing": "Гребля",
  "гребной тренажёр": "Гребля",
  "гребной тренажер": "Гребля",
  "эллипсоид": "Эллипс",
  "эллиптический тренажёр": "Эллипс",
  "эллиптический тренажер": "Эллипс",
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

function emptyForm() {
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

function calculateCalories({ met, weightKg, minutes }) {
  const numericMet = Number(met || 0);
  const numericWeight = Number(weightKg || 0);
  const numericMinutes = Number(minutes || 0);

  if (!numericMet || !numericWeight || !numericMinutes) return 0;

  return Math.round(((numericMet * 3.5 * numericWeight) / 200) * numericMinutes);
}

function volume(entry) {
  if (entry.type !== "strength") return 0;
  return Number(entry.sets || 0) * Number(entry.reps || 0) * Number(entry.weight || 0);
}

function App() {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({ bodyWeightKg: "70" });
  const [tab, setTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [form, setForm] = useState(emptyForm());
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(STORAGE_KEY);
      const savedSettings = localStorage.getItem(SETTINGS_KEY);

      if (savedEntries) setEntries(JSON.parse(savedEntries));
      if (savedSettings) setSettings({ bodyWeightKg: "70", ...JSON.parse(savedSettings) });
    } catch (error) {
      console.error("Не удалось загрузить данные", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error("Не удалось сохранить тренировки", error);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Не удалось сохранить настройки", error);
    }
  }, [settings]);

  const cardioNames = Object.keys(cardioProfiles);

  const exerciseNames = useMemo(() => {
    const names = new Set([...strengthExercises, ...cardioNames]);
    entries.forEach((entry) => names.add(entry.name));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "ru"));
  }, [entries]);

  const resolvedCardioName = form.type === "cardio" ? resolveCardioName(form.name) || form.name : null;
  const cardioProfile = form.type === "cardio" ? getCardioProfile(form.name) || cardioProfiles["Беговая дорожка"] : null;
  const selectedIntensity = getIntensity(cardioProfile, form.intensityId);
  const estimatedCalories = calculateCalories({
    met: selectedIntensity?.met,
    weightKg: settings.bodyWeightKg,
    minutes: form.duration,
  });

  useEffect(() => {
    if (form.type !== "cardio") return;

    const profile = getCardioProfile(form.name) || cardioProfiles["Беговая дорожка"];
    const defaultIntensity = profile.intensities[0]?.id || "";

    setForm((current) => {
      const currentProfile = getCardioProfile(current.name) || cardioProfiles["Беговая дорожка"];
      const intensityExists = currentProfile.intensities.some((item) => item.id === current.intensityId);

      return {
        ...current,
        intensityId: intensityExists ? current.intensityId : defaultIntensity,
        distance: current.distance || profile.defaultDistance || "",
      };
    });
  }, [form.name, form.type]);

  const dateEntries = useMemo(() => {
    return entries
      .filter((entry) => entry.date === selectedDate)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, selectedDate]);

  const groupedHistory = useMemo(() => {
    const value = query.trim().toLowerCase();

    return entries
      .filter((entry) => {
        if (!value) return true;
        return entry.name.toLowerCase().includes(value) || entry.type.toLowerCase().includes(value);
      })
      .reduce((acc, entry) => {
        if (!acc[entry.date]) acc[entry.date] = [];
        acc[entry.date].push(entry);
        return acc;
      }, {});
  }, [entries, query]);

  const sortedHistoryDates = useMemo(() => {
    return Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));
  }, [groupedHistory]);

  const stats = useMemo(() => {
    const strengthEntries = entries.filter((entry) => entry.type !== "cardio");
    const cardioEntries = entries.filter((entry) => entry.type === "cardio");

    const totalExercises = entries.length;
    const totalSets = strengthEntries.reduce((sum, entry) => sum + Number(entry.sets || 0), 0);
    const totalReps = strengthEntries.reduce(
      (sum, entry) => sum + Number(entry.sets || 0) * Number(entry.reps || 0),
      0
    );
    const workoutDays = new Set(entries.map((entry) => entry.date)).size;
    const totalVolume = strengthEntries.reduce((sum, entry) => sum + volume(entry), 0);
    const totalCardioMinutes = cardioEntries.reduce((sum, entry) => sum + Number(entry.duration || 0), 0);
    const totalCardioKcal = cardioEntries.reduce((sum, entry) => sum + Number(entry.calories || 0), 0);
    const totalDistance = cardioEntries.reduce((sum, entry) => sum + Number(entry.distance || 0), 0);

    const personalBests = Object.values(
      strengthEntries.reduce((acc, entry) => {
        const weight = Number(entry.weight || 0);
        if (!weight) return acc;
        if (!acc[entry.name] || weight > acc[entry.name].weight) {
          acc[entry.name] = { name: entry.name, weight, date: entry.date };
        }
        return acc;
      }, {})
    ).sort((a, b) => b.weight - a.weight);

    return {
      totalExercises,
      totalSets,
      totalReps,
      workoutDays,
      totalVolume,
      totalCardioMinutes,
      totalCardioKcal,
      totalDistance,
      personalBests,
    };
  }, [entries]);

  const suggestions = useMemo(() => {
    const value = form.name.trim().toLowerCase();
    const filtered = exerciseNames.filter((name) => {
      if (!value) return true;
      return name.toLowerCase().includes(value);
    });

    return filtered.slice(0, 7);
  }, [exerciseNames, form.name]);

  function selectExercise(name) {
    const isCardio = Boolean(resolveCardioName(name));
    const profile = getCardioProfile(name);

    setForm((current) => ({
      ...current,
      type: isCardio ? "cardio" : current.type,
      name,
      intensityId: isCardio ? profile?.intensities[0]?.id || "" : current.intensityId,
      distance: isCardio ? profile?.defaultDistance || current.distance : current.distance,
    }));
    setShowSuggestions(false);
  }

  function changeType(type) {
    setForm((current) => {
      if (type === "cardio") {
        const name = resolveCardioName(current.name) ? current.name : "Беговая дорожка";
        const profile = getCardioProfile(name) || cardioProfiles["Беговая дорожка"];

        return {
          ...current,
          type,
          name,
          intensityId: profile.intensities[0]?.id || "",
          distance: current.distance || profile.defaultDistance || "",
        };
      }

      return {
        ...current,
        type,
        name: resolveCardioName(current.name) ? "" : current.name,
      };
    });
  }

  function addEntry(event) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name) return;

    if (form.type === "cardio") {
      const profile = getCardioProfile(name) || cardioProfiles["Беговая дорожка"];
      const intensity = getIntensity(profile, form.intensityId);
      const duration = Number(form.duration || 0);
      const distance = form.distance === "" ? "" : Number(form.distance);
      const calories = form.calories === "" ? estimatedCalories : Number(form.calories);

      if (duration <= 0) return;

      setEntries((current) => [
        {
          id: uid(),
          type: "cardio",
          date: selectedDate,
          name: resolveCardioName(name) || name,
          duration,
          intensityId: intensity?.id || "",
          intensityLabel: intensity?.label || "Кардио",
          met: intensity?.met || 0,
          distance,
          calories,
          bodyWeightKg: Number(settings.bodyWeightKg || 70),
          note: form.note.trim(),
          createdAt: Date.now(),
        },
        ...current,
      ]);

      setForm((current) => ({
        ...emptyForm(),
        type: "cardio",
        name: resolveCardioName(name) || name,
        duration: current.duration,
        intensityId: current.intensityId,
        distance: current.distance,
      }));
      setShowSuggestions(false);
      return;
    }

    const sets = Number(form.sets);
    const reps = Number(form.reps);
    const weight = form.weight === "" ? "" : Number(form.weight);

    if (sets <= 0 || reps <= 0) return;

    setEntries((current) => [
      {
        id: uid(),
        type: "strength",
        date: selectedDate,
        name,
        sets,
        reps,
        weight,
        note: form.note.trim(),
        createdAt: Date.now(),
      },
      ...current,
    ]);

    setForm({ ...emptyForm(), name });
    setShowSuggestions(false);
  }

  function deleteEntry(id) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function clearForm() {
    setForm(emptyForm());
    setShowSuggestions(false);
  }

  return (
    <div className="app-shell">
      <div className="phone">
        <header className="header">
          <div className="header-top">
            <div>
              <p className="eyebrow">Training Log</p>
              <h1>Мои тренировки</h1>
            </div>
            <div className="logo">
              <Dumbbell size={24} />
            </div>
          </div>

          <div className="tabs">
            <TabButton active={tab === "today"} onClick={() => setTab("today")} icon={Plus} label="Сегодня" />
            <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={History} label="История" />
            <TabButton active={tab === "stats"} onClick={() => setTab("stats")} icon={Activity} label="Статы" />
          </div>
        </header>

        <main className="content">
          {tab === "today" && (
            <section className="screen">
              <div className="card">
                <label className="label-with-icon">
                  <CalendarDays size={16} />
                  Дата тренировки
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="input"
                />
              </div>

              <form onSubmit={addEntry} className="card">
                <div className="card-title-row">
                  <div>
                    <h2>Добавить упражнение</h2>
                    <p>Силовые и кардио теперь имеют разные поля</p>
                  </div>
                  <button type="button" onClick={clearForm} className="icon-button" aria-label="Очистить форму">
                    <X size={18} />
                  </button>
                </div>

                <div className="type-switch">
                  <button type="button" className={form.type === "strength" ? "active" : ""} onClick={() => changeType("strength")}>
                    <Dumbbell size={16} /> Силовое
                  </button>
                  <button type="button" className={form.type === "cardio" ? "active" : ""} onClick={() => changeType("cardio")}>
                    <Flame size={16} /> Кардио
                  </button>
                </div>

                <div className="field relative">
                  <label>Упражнение</label>
                  <input
                    value={form.name}
                    onChange={(event) => {
                      const nextName = event.target.value;
                      const cardioName = resolveCardioName(nextName);

                      setForm((current) => ({
                        ...current,
                        name: nextName,
                        type: cardioName ? "cardio" : current.type,
                      }));
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={form.type === "cardio" ? "Например: беговая дорожка" : "Например: жим лёжа"}
                    className="input"
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions">
                      {suggestions.map((name) => (
                        <button key={name} type="button" onClick={() => selectExercise(name)}>
                          <span>{resolveCardioName(name) ? cardioProfiles[resolveCardioName(name)]?.icon : "🏋️"}</span>
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {form.type === "strength" ? (
                  <StrengthFields form={form} setForm={setForm} />
                ) : (
                  <CardioFields
                    form={form}
                    setForm={setForm}
                    settings={settings}
                    setSettings={setSettings}
                    profile={cardioProfile}
                    selectedIntensity={selectedIntensity}
                    estimatedCalories={estimatedCalories}
                    resolvedCardioName={resolvedCardioName}
                  />
                )}

                <label className="field">
                  <span>Заметка</span>
                  <textarea
                    value={form.note}
                    onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                    placeholder={form.type === "cardio" ? "Например: пульс держался около 150" : "Например: последний подход тяжело"}
                    rows={3}
                    className="textarea"
                  />
                </label>

                <button type="submit" className="primary-button">
                  <Plus size={20} />
                  Добавить в тренировку
                </button>
              </form>

              <section>
                <div className="section-title">
                  <h2>{formatDate(selectedDate)}</h2>
                  <span>{dateEntries.length} записей</span>
                </div>

                {dateEntries.length === 0 ? (
                  <EmptyState text="Пока нет упражнений за этот день. Добавь первое выше." />
                ) : (
                  <div className="list">
                    {dateEntries.map((entry) => (
                      <ExerciseCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} />
                    ))}
                  </div>
                )}
              </section>
            </section>
          )}

          {tab === "history" && (
            <section className="screen">
              <div className="search-box">
                <Search size={20} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Найти упражнение или cardio"
                />
              </div>

              {sortedHistoryDates.length === 0 ? (
                <EmptyState text="История пустая. После первой тренировки записи появятся здесь." />
              ) : (
                sortedHistoryDates.map((date) => (
                  <section key={date} className="history-group">
                    <h2>{formatDate(date)}</h2>
                    <div className="list">
                      {groupedHistory[date]
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map((entry) => (
                          <ExerciseCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} compact />
                        ))}
                    </div>
                  </section>
                ))
              )}
            </section>
          )}

          {tab === "stats" && (
            <section className="screen">
              <div className="stats-grid">
                <StatCard icon={CalendarDays} label="Дней тренировок" value={stats.workoutDays} />
                <StatCard icon={Dumbbell} label="Всего записей" value={stats.totalExercises} />
                <StatCard icon={Flame} label="Кардио, мин" value={stats.totalCardioMinutes} />
                <StatCard icon={Activity} label="Ккал кардио" value={stats.totalCardioKcal} />
                <StatCard icon={Route} label="Дистанция, км" value={Number(stats.totalDistance.toFixed(1))} />
                <StatCard icon={Weight} label="Объём, кг" value={stats.totalVolume} />
              </div>

              <section className="card">
                <div className="record-title">
                  <Trophy size={20} />
                  <h2>Личные рекорды по весу</h2>
                </div>

                {stats.personalBests.length === 0 ? (
                  <p className="muted">Добавь вес к силовым упражнениям, и здесь появятся лучшие результаты.</p>
                ) : (
                  <div className="list">
                    {stats.personalBests.slice(0, 8).map((record) => (
                      <div key={record.name} className="record-row">
                        <div>
                          <p>{record.name}</p>
                          <span>{formatDate(record.date)}</span>
                        </div>
                        <strong>{record.weight} кг</strong>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="card info-card">
                <div className="label-with-icon">
                  <Settings2 size={16} />
                  Расчет ккал
                </div>
                <p>
                  Для кардио используется формула: MET × 3.5 × вес / 200 × минуты.
                  Это оценка, а не медицинское измерение.
                </p>
              </section>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function StrengthFields({ form, setForm }) {
  return (
    <div className="grid-3">
      <NumberField label="Подходы" value={form.sets} onChange={(value) => setForm((current) => ({ ...current, sets: value }))} />
      <NumberField label="Повторы" value={form.reps} onChange={(value) => setForm((current) => ({ ...current, reps: value }))} />
      <NumberField label="Вес, кг" value={form.weight} onChange={(value) => setForm((current) => ({ ...current, weight: value }))} placeholder="0" />
    </div>
  );
}

function CardioFields({
  form,
  setForm,
  settings,
  setSettings,
  profile,
  selectedIntensity,
  estimatedCalories,
  resolvedCardioName,
}) {
  const currentProfile = profile || cardioProfiles["Беговая дорожка"];

  return (
    <div className="cardio-panel">
      <div className="cardio-head">
        <span>{currentProfile.icon}</span>
        <div>
          <strong>{resolvedCardioName || "Кардио"}</strong>
          <p>Поля автоматически заменены на кардио-метрики</p>
        </div>
      </div>

      <div className="grid-2">
        <NumberField
          label="Время, мин"
          value={form.duration}
          onChange={(value) => setForm((current) => ({ ...current, duration: value }))}
        />
        <NumberField
          label="Дистанция, км"
          value={form.distance}
          onChange={(value) => setForm((current) => ({ ...current, distance: value }))}
          placeholder="0"
        />
      </div>

      <label className="field">
        <span>Сложность / настройка</span>
        <select
          value={form.intensityId || currentProfile.intensities[0]?.id}
          onChange={(event) => setForm((current) => ({ ...current, intensityId: event.target.value }))}
          className="input"
        >
          {currentProfile.intensities.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label} · MET {item.met}
            </option>
          ))}
        </select>
      </label>

      <div className="grid-2">
        <NumberField
          label="Вес для расчёта, кг"
          value={settings.bodyWeightKg}
          onChange={(value) => setSettings((current) => ({ ...current, bodyWeightKg: value }))}
          placeholder="70"
        />
        <NumberField
          label="Ккал"
          value={form.calories}
          onChange={(value) => setForm((current) => ({ ...current, calories: value }))}
          placeholder={String(estimatedCalories || 0)}
        />
      </div>

      <div className="estimate">
        <Timer size={17} />
        <span>
          Оценка: <strong>{estimatedCalories || 0} ккал</strong>
          {selectedIntensity ? ` · ${selectedIntensity.met} MET` : ""}
        </span>
        <button
          type="button"
          onClick={() => setForm((current) => ({ ...current, calories: String(estimatedCalories || 0) }))}
        >
          Подставить
        </button>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={active ? "tab active" : "tab"}>
      <Icon size={16} />
      {label}
    </button>
  );
}

function NumberField({ label, value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="input number-input"
      />
    </label>
  );
}

function ExerciseCard({ entry, onDelete, compact = false }) {
  const isCardio = entry.type === "cardio";

  return (
    <article className="exercise-card">
      <div className="exercise-top">
        <div>
          <div className="badge">{isCardio ? "Кардио" : "Силовое"}</div>
          <h3>{entry.name}</h3>
          {!compact && entry.note && <p>{entry.note}</p>}
        </div>

        <button onClick={onDelete} className="delete-button" aria-label="Удалить запись">
          <Trash2 size={17} />
        </button>
      </div>

      {isCardio ? (
        <>
          <div className="metrics">
            <MiniMetric icon={Timer} label="Время" value={`${entry.duration} мин`} />
            <MiniMetric icon={Route} label="Дистанция" value={entry.distance ? `${entry.distance} км` : "—"} />
            <MiniMetric icon={Flame} label="Ккал" value={entry.calories || "—"} />
          </div>
          <div className="volume-row">
            Сложность: <strong>{entry.intensityLabel}</strong>
          </div>
        </>
      ) : (
        <>
          <div className="metrics">
            <MiniMetric icon={Dumbbell} label="Подходы" value={entry.sets} />
            <MiniMetric icon={Activity} label="Повторы" value={entry.reps} />
            <MiniMetric icon={Weight} label="Вес" value={entry.weight ? `${entry.weight} кг` : "—"} />
          </div>

          {volume(entry) > 0 && (
            <div className="volume-row">
              Объём: <strong>{volume(entry).toLocaleString("ru-RU")} кг</strong>
            </div>
          )}
        </>
      )}
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

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <strong>{Number(value || 0).toLocaleString("ru-RU")}</strong>
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div>
        <Dumbbell size={26} />
      </div>
      <p>{text}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
