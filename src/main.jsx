import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORAGE_KEY = 'mobile-workout-tracker-v1';
const DEFAULT_EXERCISES = [
  'Жим лёжа',
  'Приседания',
  'Становая тяга',
  'Подтягивания',
  'Жим гантелей',
  'Тяга верхнего блока',
  'Выпады',
  'Планка',
  'Скручивания',
  'Беговая дорожка'
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long'
  }).format(new Date(`${dateString}T12:00:00`));
}

function emptyForm() {
  return {
    name: '',
    sets: '3',
    reps: '10',
    weight: '',
    note: ''
  };
}

function App() {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [form, setForm] = useState(emptyForm());
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const exerciseNames = useMemo(() => {
    const names = new Set(DEFAULT_EXERCISES);
    entries.forEach((entry) => names.add(entry.name));
    return [...names].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [entries]);

  const suggestions = useMemo(() => {
    const value = form.name.trim().toLowerCase();
    if (!value) return exerciseNames.slice(0, 6);
    return exerciseNames.filter((name) => name.toLowerCase().includes(value)).slice(0, 6);
  }, [exerciseNames, form.name]);

  const dateEntries = useMemo(() => {
    return entries
      .filter((entry) => entry.date === selectedDate)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, selectedDate]);

  const groupedHistory = useMemo(() => {
    const search = query.trim().toLowerCase();
    return entries
      .filter((entry) => entry.name.toLowerCase().includes(search))
      .sort((a, b) => b.createdAt - a.createdAt)
      .reduce((acc, entry) => {
        acc[entry.date] = acc[entry.date] || [];
        acc[entry.date].push(entry);
        return acc;
      }, {});
  }, [entries, query]);

  const historyDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  const stats = useMemo(() => {
    const workoutDays = new Set(entries.map((entry) => entry.date)).size;
    const totalSets = entries.reduce((sum, entry) => sum + Number(entry.sets || 0), 0);
    const totalReps = entries.reduce((sum, entry) => sum + Number(entry.sets || 0) * Number(entry.reps || 0), 0);
    const totalVolume = entries.reduce((sum, entry) => {
      return sum + Number(entry.sets || 0) * Number(entry.reps || 0) * Number(entry.weight || 0);
    }, 0);

    const bestByExercise = Object.values(
      entries.reduce((acc, entry) => {
        const weight = Number(entry.weight || 0);
        if (!weight) return acc;
        if (!acc[entry.name] || weight > acc[entry.name].weight) {
          acc[entry.name] = { name: entry.name, weight, date: entry.date };
        }
        return acc;
      }, {})
    ).sort((a, b) => b.weight - a.weight);

    return {
      workoutDays,
      totalExercises: entries.length,
      totalSets,
      totalReps,
      totalVolume,
      bestByExercise
    };
  }, [entries]);

  function addEntry(event) {
    event.preventDefault();
    const name = form.name.trim();
    const sets = Number(form.sets);
    const reps = Number(form.reps);
    const weight = form.weight === '' ? '' : Number(form.weight);

    if (!name || sets <= 0 || reps <= 0) return;

    setEntries((current) => [
      {
        id: createId(),
        date: selectedDate,
        name,
        sets,
        reps,
        weight,
        note: form.note.trim(),
        createdAt: Date.now()
      },
      ...current
    ]);

    setForm({ ...emptyForm(), name });
    setShowSuggestions(false);
  }

  function deleteEntry(id) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function clearAllData() {
    const confirmed = window.confirm('Удалить все записи тренировок?');
    if (confirmed) setEntries([]);
  }

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <header className="app-header">
          <div>
            <p className="eyebrow">Training Log</p>
            <h1>Мои тренировки</h1>
          </div>
          <div className="logo">🏋️</div>
        </header>

        <nav className="tabs" aria-label="Разделы приложения">
          <button className={activeTab === 'today' ? 'active' : ''} onClick={() => setActiveTab('today')}>Сегодня</button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>История</button>
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>Статы</button>
        </nav>

        {activeTab === 'today' && (
          <section className="screen">
            <div className="card">
              <label className="label" htmlFor="date">Дата тренировки</label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>

            <form className="card form-card" onSubmit={addEntry}>
              <div className="section-title-row">
                <div>
                  <h2>Добавить упражнение</h2>
                  <p>Подходы, повторы, вес и заметка</p>
                </div>
                <button className="ghost-button" type="button" onClick={() => setForm(emptyForm())}>Очистить</button>
              </div>

              <div className="suggest-wrapper">
                <label className="label" htmlFor="exercise">Упражнение</label>
                <input
                  id="exercise"
                  value={form.name}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, name: event.target.value }));
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Например: жим лёжа"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions">
                    {suggestions.map((name) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => {
                          setForm((current) => ({ ...current, name }));
                          setShowSuggestions(false);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="number-grid">
                <NumberInput label="Подходы" value={form.sets} onChange={(value) => setForm((current) => ({ ...current, sets: value }))} />
                <NumberInput label="Повторы" value={form.reps} onChange={(value) => setForm((current) => ({ ...current, reps: value }))} />
                <NumberInput label="Вес, кг" value={form.weight} onChange={(value) => setForm((current) => ({ ...current, weight: value }))} />
              </div>

              <label className="label" htmlFor="note">Заметка</label>
              <textarea
                id="note"
                rows="3"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="Например: последний подход был тяжелым"
              />

              <button className="primary-button" type="submit">+ Добавить в тренировку</button>
            </form>

            <div className="section-title-row compact-title">
              <h2>{formatDate(selectedDate)}</h2>
              <span>{dateEntries.length} записей</span>
            </div>

            {dateEntries.length === 0 ? (
              <EmptyState text="Пока нет упражнений за этот день. Добавь первое выше." />
            ) : (
              <div className="entry-list">
                {dateEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section className="screen">
            <input
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по упражнению"
            />

            {historyDates.length === 0 ? (
              <EmptyState text="История пустая. После первой тренировки записи появятся здесь." />
            ) : (
              <div className="history-list">
                {historyDates.map((date) => (
                  <section key={date}>
                    <h2 className="history-date">{formatDate(date)}</h2>
                    <div className="entry-list">
                      {groupedHistory[date].map((entry) => (
                        <EntryCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} compact />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'stats' && (
          <section className="screen">
            <div className="stats-grid">
              <StatCard label="Дней" value={stats.workoutDays} />
              <StatCard label="Упражнений" value={stats.totalExercises} />
              <StatCard label="Подходов" value={stats.totalSets} />
              <StatCard label="Повторов" value={stats.totalReps} />
            </div>

            <div className="card">
              <h2>Общий объем</h2>
              <p className="big-number">{Math.round(stats.totalVolume).toLocaleString('ru-RU')} кг</p>
              <p className="muted">Считается как подходы × повторы × вес.</p>
            </div>

            <div className="card">
              <h2>Личные рекорды по весу</h2>
              {stats.bestByExercise.length === 0 ? (
                <p className="muted">Добавь вес к упражнениям, и здесь появятся лучшие результаты.</p>
              ) : (
                <div className="records">
                  {stats.bestByExercise.slice(0, 10).map((record) => (
                    <div className="record" key={record.name}>
                      <div>
                        <strong>{record.name}</strong>
                        <span>{formatDate(record.date)}</span>
                      </div>
                      <b>{record.weight} кг</b>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="danger-button" type="button" onClick={clearAllData}>Удалить все данные</button>
          </section>
        )}
      </section>
    </main>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function EntryCard({ entry, onDelete, compact = false }) {
  const volume = Number(entry.sets || 0) * Number(entry.reps || 0) * Number(entry.weight || 0);

  return (
    <article className="entry-card">
      <div className="entry-head">
        <div>
          <h3>{entry.name}</h3>
          {!compact && entry.note && <p>{entry.note}</p>}
        </div>
        <button type="button" onClick={onDelete} aria-label="Удалить запись">🗑️</button>
      </div>

      <div className="metrics">
        <Metric label="Подходы" value={entry.sets} />
        <Metric label="Повторы" value={entry.reps} />
        <Metric label="Вес" value={entry.weight ? `${entry.weight} кг` : '—'} />
      </div>

      {volume > 0 && <div className="volume">Объем: <strong>{volume.toLocaleString('ru-RU')} кг</strong></div>}
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <strong>{value.toLocaleString('ru-RU')}</strong>
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div>🏋️</div>
      <p>{text}</p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
