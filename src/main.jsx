import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  Apple,
  BarChart3,
  Bike,
  Calculator,
  CalendarDays,
  Camera,
  ClipboardList,
  Copy,
  Dumbbell,
  Flame,
  HeartPulse,
  History,
  Home,
  Info,
  LineChart,
  ListPlus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Route,
  Save,
  Search,
  Star,
  Target,
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

const WORKOUT_KEY = "mobile-workout-tracker-v3";
const OLD_WORKOUT_KEY = "mobile-workout-tracker-v2";
const OLD_SETTINGS_KEY = "mobile-workout-tracker-settings-v1";
const PROFILE_KEY = "mobile-workout-tracker-profile-v1";
const WEIGHT_LOG_KEY = "mobile-workout-tracker-weight-log-v1";
const NUTRITION_KEY = "mobile-workout-tracker-nutrition-v1";
const FAVORITE_FOODS_KEY = "mobile-workout-tracker-favorite-foods-v1";
const SAVED_MENUS_KEY = "mobile-workout-tracker-saved-menus-v1";
const CLOUD_TABLE = "app_state";
const APP_STATE_VERSION = 6;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const exerciseLibrary = [
  {
    name: "Жим лёжа",
    category: "Грудь",
    equipment: "штанга / скамья",
    primary: ["Грудь"],
    secondary: ["Трицепс", "Передняя дельта"],
    steps: [
      "Ляг так, чтобы глаза были примерно под грифом, лопатки сведены и опущены.",
      "Поставь стопы устойчиво, возьми гриф чуть шире плеч.",
      "Опускай гриф к нижней части груди, сохраняя контроль и напряжение корпуса.",
      "Выжимай гриф вверх по небольшой дуге, не отрывая плечи от скамьи."
    ],
    tips: ["Не отбивай гриф от груди", "Держи запястья над локтями", "Оставляй 1–2 повтора в запасе, если нет страховки"],
    mistakes: ["локти строго в стороны", "отрыв таза", "слишком быстрый негатив"]
  },
  {
    name: "Приседания",
    category: "Ноги",
    equipment: "штанга / стойка",
    primary: ["Квадрицепс", "Ягодицы"],
    secondary: ["Задняя поверхность бедра", "Кор"],
    steps: [
      "Поставь стопы примерно на ширине плеч, носки слегка наружу.",
      "Напряги корпус, держи грудную клетку раскрытой и взгляд вперед.",
      "Опускайся, уводя колени по направлению носков, не заваливая их внутрь.",
      "Поднимайся через всю стопу, сохраняя спину нейтральной."
    ],
    tips: ["Глубина — до комфортного контроля", "Колени двигаются в сторону носков", "Не расслабляй корпус внизу"],
    mistakes: ["круглая спина", "колени внутрь", "отрыв пяток"]
  },
  {
    name: "Становая тяга",
    category: "Спина / ноги",
    equipment: "штанга",
    primary: ["Задняя поверхность бедра", "Ягодицы", "Спина"],
    secondary: ["Кор", "Предплечья", "Трапеции"],
    steps: [
      "Подойди к грифу: он примерно над серединой стопы.",
      "Возьми гриф, натяни корпус и держи спину нейтральной.",
      "Начинай движение ногами, гриф веди близко к телу.",
      "Вверху выпрямись без переразгибания поясницы, затем верни гриф под контролем."
    ],
    tips: ["Гриф скользит близко к ногам", "Сначала создай напряжение, потом тяни", "Лучше меньше вес, но ровная техника"],
    mistakes: ["рывок с расслабленной спиной", "гриф далеко от тела", "запрокидывание корпуса назад"]
  },
  {
    name: "Подтягивания",
    category: "Спина",
    equipment: "турник",
    primary: ["Широчайшие"],
    secondary: ["Бицепс", "Предплечья", "Кор"],
    steps: [
      "Возьмись за перекладину и слегка опусти плечи от ушей.",
      "Начинай движение лопатками, затем тяни грудь к перекладине.",
      "Поднимайся без раскачки и рывков.",
      "Опускайся контролируемо почти до полного выпрямления рук."
    ],
    tips: ["Думай: локти вниз", "Не задирай подбородок", "Используй резинку, если техника ломается"],
    mistakes: ["раскачка", "полуамплитуда", "плечи у ушей"]
  },
  {
    name: "Жим гантелей",
    category: "Грудь",
    equipment: "гантели / скамья",
    primary: ["Грудь"],
    secondary: ["Трицепс", "Передняя дельта"],
    steps: [
      "Ляг на скамью, сведи лопатки и стабилизируй стопы.",
      "Держи гантели над грудью, ладони слегка развернуты внутрь.",
      "Опускай гантели до комфортной глубины, локти под контролем.",
      "Выжимай вверх, не сталкивая гантели слишком резко."
    ],
    tips: ["Контролируй нижнюю точку", "Не растягивай плечо через боль", "Держи одинаковую траекторию рук"],
    mistakes: ["слишком глубокое опускание", "потеря лопаток", "рывок внизу"]
  },
  {
    name: "Тяга верхнего блока",
    category: "Спина",
    equipment: "верхний блок",
    primary: ["Широчайшие"],
    secondary: ["Бицепс", "Задняя дельта"],
    steps: [
      "Сядь так, чтобы бедра были зафиксированы валиком.",
      "Слегка отклонись назад и опусти плечи.",
      "Тяни рукоять к верхней части груди, ведя локти вниз.",
      "Верни рукоять вверх медленно, сохраняя контроль лопаток."
    ],
    tips: ["Не тяни только руками", "Грудь тянется к рукояти", "Не бросай вес вверх"],
    mistakes: ["сильный отклон корпуса", "рывок", "плечи поднимаются к ушам"]
  },
  {
    name: "Тяга штанги в наклоне",
    category: "Спина",
    equipment: "штанга",
    primary: ["Широчайшие", "Середина спины"],
    secondary: ["Бицепс", "Задняя дельта", "Кор"],
    steps: [
      "Наклони корпус, сохраняя нейтральную спину и мягкие колени.",
      "Держи гриф чуть ниже колен или у голеней.",
      "Тяни гриф к низу живота, сводя лопатки.",
      "Опускай гриф под контролем без округления спины."
    ],
    tips: ["Корпус почти неподвижен", "Тяни локтями назад", "Вес не должен ломать позицию спины"],
    mistakes: ["подброс корпусом", "круглая поясница", "тяга к груди вместо живота"]
  },
  {
    name: "Жим ногами",
    category: "Ноги",
    equipment: "тренажер",
    primary: ["Квадрицепс", "Ягодицы"],
    secondary: ["Задняя поверхность бедра", "Икры"],
    steps: [
      "Поставь стопы на платформу на ширине плеч.",
      "Опускай платформу до комфортной глубины без отрыва таза.",
      "Толкай платформу всей стопой, колени веди по линии носков.",
      "Вверху не запирай колени жестко."
    ],
    tips: ["Поясница прижата", "Контролируй глубину", "Не своди колени внутрь"],
    mistakes: ["отрыв таза", "полное запирание коленей", "слишком узкая постановка без контроля"]
  },
  {
    name: "Румынская тяга",
    category: "Ноги / задняя цепь",
    equipment: "штанга / гантели",
    primary: ["Задняя поверхность бедра", "Ягодицы"],
    secondary: ["Спина", "Кор"],
    steps: [
      "Встань ровно, держи вес перед бедрами.",
      "Отводи таз назад, слегка сгибая колени.",
      "Опускай вес вдоль ног до растяжения задней поверхности бедра.",
      "Вернись вверх за счет ягодиц и задней поверхности бедра."
    ],
    tips: ["Это движение тазом, не присед", "Спина нейтральная", "Гантели/гриф близко к ногам"],
    mistakes: ["округление спины", "глубина через поясницу", "слишком согнутые колени"]
  },
  {
    name: "Разгибание ног",
    category: "Ноги",
    equipment: "тренажер",
    primary: ["Квадрицепс"],
    secondary: [],
    steps: [
      "Отрегулируй валик над нижней частью голени.",
      "Сядь плотно, держись за ручки.",
      "Разогни ноги вверх до сильного сокращения квадрицепса.",
      "Опускай вес медленно, не бросая плиту."
    ],
    tips: ["Пауза вверху 0.5–1 сек", "Не дергай корпусом", "Колени должны совпадать с осью тренажера"],
    mistakes: ["рывок", "слишком большой вес", "неполная амплитуда"]
  },
  {
    name: "Сгибание ног",
    category: "Ноги",
    equipment: "тренажер",
    primary: ["Задняя поверхность бедра"],
    secondary: ["Икры"],
    steps: [
      "Настрой валик чуть выше пяток.",
      "Зафиксируй корпус и таз.",
      "Согни ноги, подтягивая пятки к себе.",
      "Медленно верни вес, сохраняя напряжение."
    ],
    tips: ["Не отрывай таз", "Работай без рывка", "Ощущай заднюю поверхность бедра"],
    mistakes: ["подброс весом", "потеря таза", "короткая амплитуда"]
  },
  {
    name: "Подъём на бицепс",
    category: "Руки",
    equipment: "гантели / штанга",
    primary: ["Бицепс"],
    secondary: ["Предплечья"],
    steps: [
      "Встань ровно, локти держи рядом с корпусом.",
      "Поднимай вес, сгибая локти без раскачки корпуса.",
      "Вверху сожми бицепс, не выводя локти далеко вперед.",
      "Опускай вес медленно почти до полного выпрямления рук."
    ],
    tips: ["Локти стабильны", "Контроль вниз важнее веса", "Не помогай спиной"],
    mistakes: ["раскачка", "локти гуляют", "слишком короткая амплитуда"]
  },
  {
    name: "Французский жим",
    category: "Руки",
    equipment: "EZ-гриф / гантели",
    primary: ["Трицепс"],
    secondary: ["Плечи"],
    steps: [
      "Ляг или сядь, удерживая вес над головой/грудью.",
      "Сохраняй плечи почти неподвижными.",
      "Сгибай локти, опуская вес контролируемо.",
      "Разгибай руки за счет трицепса, не разводя локти слишком широко."
    ],
    tips: ["Локти смотрят вперед", "Не работай через боль в локтях", "Движение плавное"],
    mistakes: ["разъезжающиеся локти", "слишком большой вес", "рывки"]
  },
  {
    name: "Выпады",
    category: "Ноги",
    equipment: "свой вес / гантели",
    primary: ["Ягодицы", "Квадрицепс"],
    secondary: ["Задняя поверхность бедра", "Кор"],
    steps: [
      "Сделай шаг вперед или назад и стабилизируй корпус.",
      "Опускайся вниз, удерживая колено передней ноги по линии стопы.",
      "Оттолкнись пяткой/серединой стопы и вернись в исходное положение.",
      "Повтори на вторую ногу без потери равновесия."
    ],
    tips: ["Корпус высокий", "Длина шага влияет на акцент", "Начинай без веса, если шатает"],
    mistakes: ["колено внутрь", "падение корпусом вперед", "удар коленом об пол"]
  },
  {
    name: "Планка",
    category: "Кор",
    equipment: "свой вес",
    primary: ["Кор"],
    secondary: ["Ягодицы", "Плечи"],
    steps: [
      "Поставь локти под плечи, тело — в одну линию.",
      "Подкрути таз слегка под себя и напряги ягодицы.",
      "Дыши ровно, не задерживай дыхание.",
      "Держи позицию до момента, пока техника не начинает ломаться."
    ],
    tips: ["Качество важнее времени", "Не провисай в пояснице", "Шея продолжает линию позвоночника"],
    mistakes: ["таз слишком высоко", "провисание", "задержка дыхания"]
  },
  {
    name: "Отжимания",
    category: "Грудь",
    equipment: "свой вес",
    primary: ["Грудь", "Трицепс"],
    secondary: ["Передняя дельта", "Кор"],
    steps: [
      "Поставь ладони чуть шире плеч, корпус держи прямым.",
      "Опускайся, сохраняя локти примерно под углом 30–60° к корпусу.",
      "Коснись грудью почти пола или опустись до контролируемой глубины.",
      "Выжми себя вверх, не ломая линию корпуса."
    ],
    tips: ["Напряги пресс и ягодицы", "Можно начать с колен/опоры", "Лопатки двигаются естественно"],
    mistakes: ["провисший таз", "локти строго в стороны", "полуамплитуда"]
  },
  {
    name: "Жим стоя",
    category: "Плечи",
    equipment: "штанга / гантели",
    primary: ["Плечи"],
    secondary: ["Трицепс", "Кор", "Верх груди"],
    steps: [
      "Поставь стопы устойчиво, напряги пресс и ягодицы.",
      "Начни с веса на уровне ключиц/плеч.",
      "Выжимай вес вверх, проводя голову под гриф/между руками.",
      "Опускай вес под контролем в исходную точку."
    ],
    tips: ["Не прогибайся в пояснице", "Путь веса почти вертикальный", "Не превращай в швунг, если цель — жим"],
    mistakes: ["сильный прогиб", "вывод веса далеко вперед", "расслабленный корпус"]
  },
  {
    name: "Махи в стороны",
    category: "Плечи",
    equipment: "гантели / блок",
    primary: ["Средняя дельта"],
    secondary: ["Трапеции"],
    steps: [
      "Возьми легкие гантели и слегка согни локти.",
      "Поднимай руки в стороны до уровня плеч или чуть ниже.",
      "Веди локти, а не кисти, корпус почти неподвижен.",
      "Опускай медленно, сохраняя напряжение в дельтах."
    ],
    tips: ["Легкий вес — нормальный выбор", "Не пожимай плечами", "Контроль важнее высоты"],
    mistakes: ["раскачка", "слишком тяжелые гантели", "подъем трапециями"]
  },
  {
    name: "Горизонтальная тяга",
    category: "Спина",
    equipment: "блок / тренажер",
    primary: ["Середина спины", "Широчайшие"],
    secondary: ["Бицепс", "Задняя дельта"],
    steps: [
      "Сядь ровно, упри стопы и возьми рукоять.",
      "Начни движение с лопаток, затем тяни локти назад.",
      "Подтяни рукоять к животу, не заваливая корпус назад.",
      "Вернись вперед под контролем, сохраняя спину нейтральной."
    ],
    tips: ["Пауза в сведении лопаток", "Тяни к животу", "Не раскачивайся"],
    mistakes: ["рывок корпусом", "круглая спина", "плечи вперед в конце без контроля"]
  },
  {
    name: "Гиперэкстензия",
    category: "Спина / ягодицы",
    equipment: "римский стул",
    primary: ["Ягодицы", "Задняя поверхность бедра", "Разгибатели спины"],
    secondary: ["Кор"],
    steps: [
      "Настрой подушку так, чтобы таз мог свободно сгибаться.",
      "Опусти корпус вниз с нейтральной спиной.",
      "Поднимайся до прямой линии тела, сжимая ягодицы.",
      "Не переразгибай поясницу в верхней точке."
    ],
    tips: ["Движение через таз", "Верхняя точка — ровная линия", "Вес добавляй только после техники"],
    mistakes: ["переразгибание", "круглая спина", "рывки"]
  },
  {
    name: "Ягодичный мост",
    category: "Ягодицы",
    equipment: "свой вес / штанга",
    primary: ["Ягодицы"],
    secondary: ["Задняя поверхность бедра", "Кор"],
    steps: [
      "Ляг или обопрись верхом спины на скамью, стопы поставь устойчиво.",
      "Подкрути таз и напряги пресс.",
      "Поднимай таз за счет ягодиц до прямой линии корпуса.",
      "Опускайся медленно, не теряя контроля таза."
    ],
    tips: ["Пауза вверху", "Не прогибай поясницу", "Стопы не слишком далеко"],
    mistakes: ["движение поясницей", "колени внутрь", "слишком быстрая амплитуда"]
  },
  {
    name: "Болгарские выпады",
    category: "Ноги",
    equipment: "скамья / гантели",
    primary: ["Ягодицы", "Квадрицепс"],
    secondary: ["Задняя поверхность бедра", "Кор"],
    steps: [
      "Поставь заднюю ногу на скамью, передняя стопа устойчиво на полу.",
      "Опускайся вниз, сохраняя корпус собранным.",
      "Колено передней ноги веди по линии стопы.",
      "Поднимайся через переднюю ногу, не отталкиваясь задней."
    ],
    tips: ["Сначала найди удобную дистанцию", "Можно держаться за опору", "Контролируй равновесие"],
    mistakes: ["слишком короткий шаг", "завал колена", "прыжок вверх вместо контроля"]
  },
  {
    name: "Подъёмы на носки",
    category: "Икры",
    equipment: "тренажер / гантели",
    primary: ["Икры"],
    secondary: [],
    steps: [
      "Поставь носки на платформу или пол, пятки свободны.",
      "Опустись до растяжения икр.",
      "Поднимись максимально высоко на носки.",
      "Задержись вверху и медленно опустись."
    ],
    tips: ["Работай в полной амплитуде", "Не пружинь", "Колени под контролем"],
    mistakes: ["короткая амплитуда", "подскоки", "слишком быстрый темп"]
  },
  {
    name: "Скручивания",
    category: "Пресс",
    equipment: "коврик",
    primary: ["Пресс"],
    secondary: ["Кор"],
    steps: [
      "Ляг на спину, согни ноги и зафиксируй поясницу комфортно.",
      "Поднимай верх спины, как будто ребра идут к тазу.",
      "Не тяни шею руками.",
      "Опускайся медленно, сохраняя напряжение пресса."
    ],
    tips: ["Маленькая амплитуда — нормально", "Выдох на подъеме", "Шея расслаблена"],
    mistakes: ["рывок шеей", "подъем всем корпусом", "потеря напряжения"]
  },
  {
    name: "Подъём ног",
    category: "Пресс",
    equipment: "турник / брусья / коврик",
    primary: ["Пресс"],
    secondary: ["Сгибатели бедра", "Кор"],
    steps: [
      "Зафиксируй корпус, не раскачивайся.",
      "Поднимай ноги или колени вверх, подкручивая таз.",
      "В верхней точке напряги пресс.",
      "Опускай ноги медленно, не бросая их вниз."
    ],
    tips: ["Начни с согнутых коленей", "Главное — подкрутка таза", "Не раскачивайся"],
    mistakes: ["махи ногами", "работа только сгибателями бедра", "провисание в плечах"]
  },
  {
    name: "Тяга гантели одной рукой",
    category: "Спина",
    equipment: "гантель / скамья",
    primary: ["Широчайшие", "Середина спины"],
    secondary: ["Бицепс", "Задняя дельта"],
    steps: [
      "Упрись рукой и коленом в скамью или займи устойчивую позицию.",
      "Держи спину нейтральной, плечо рабочей руки слегка вниз.",
      "Тяни локоть назад к тазу.",
      "Опускай гантель под контролем, не разворачивая корпус."
    ],
    tips: ["Локоть идет к бедру", "Не крути корпусом", "Пауза в верхней точке"],
    mistakes: ["рывок", "разворот корпуса", "тяга к плечу"]
  },
  {
    name: "Face pull",
    category: "Плечи / осанка",
    equipment: "канат / блок",
    primary: ["Задняя дельта", "Середина спины"],
    secondary: ["Трапеции", "Вращатели плеча"],
    steps: [
      "Поставь блок примерно на уровень лица и возьми канат.",
      "Отойди назад, руки вытянуты, корпус устойчив.",
      "Тяни канат к лицу, разводя концы в стороны.",
      "Вернись под контролем, не теряя положения плеч."
    ],
    tips: ["Легкий/средний вес", "Локти высоко, но без боли", "Думай о задней дельте"],
    mistakes: ["рывок поясницей", "слишком большой вес", "плечи к ушам"]
  }
];

const strengthExercises = exerciseLibrary.map((exercise) => exercise.name);


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
  { id: "apple", name: "Яблоко", calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
  { id: "tuna", name: "Тунец в собственном соку", calories: 116, protein: 26, fat: 1, carbs: 0 },
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

const workoutTemplates = [
  {
    id: "push",
    name: "Грудь + трицепс",
    detail: "4 упражнения · базовая силовая",
    items: [
      { type: "strength", name: "Жим лёжа", sets: 4, reps: 8, weight: "" },
      { type: "strength", name: "Жим гантелей", sets: 3, reps: 10, weight: "" },
      { type: "strength", name: "Французский жим", sets: 3, reps: 12, weight: "" },
      { type: "strength", name: "Планка", sets: 3, reps: 1, weight: "" },
    ],
  },
  {
    id: "pull",
    name: "Спина + бицепс",
    detail: "4 упражнения · тяги и руки",
    items: [
      { type: "strength", name: "Подтягивания", sets: 4, reps: 6, weight: "" },
      { type: "strength", name: "Тяга верхнего блока", sets: 3, reps: 10, weight: "" },
      { type: "strength", name: "Тяга штанги в наклоне", sets: 3, reps: 8, weight: "" },
      { type: "strength", name: "Подъём на бицепс", sets: 3, reps: 12, weight: "" },
    ],
  },
  {
    id: "legs",
    name: "Ноги",
    detail: "5 упражнений · квадрицепс/задняя поверхность",
    items: [
      { type: "strength", name: "Приседания", sets: 4, reps: 8, weight: "" },
      { type: "strength", name: "Румынская тяга", sets: 3, reps: 10, weight: "" },
      { type: "strength", name: "Жим ногами", sets: 3, reps: 12, weight: "" },
      { type: "strength", name: "Разгибание ног", sets: 3, reps: 12, weight: "" },
      { type: "strength", name: "Сгибание ног", sets: 3, reps: 12, weight: "" },
    ],
  },
  {
    id: "fullbody",
    name: "Full body",
    detail: "5 упражнений · всё тело",
    items: [
      { type: "strength", name: "Приседания", sets: 3, reps: 8, weight: "" },
      { type: "strength", name: "Жим лёжа", sets: 3, reps: 8, weight: "" },
      { type: "strength", name: "Тяга верхнего блока", sets: 3, reps: 10, weight: "" },
      { type: "strength", name: "Выпады", sets: 3, reps: 10, weight: "" },
      { type: "strength", name: "Планка", sets: 3, reps: 1, weight: "" },
    ],
  },
  {
    id: "cardio",
    name: "Кардио 30 минут",
    detail: "дорожка + эллипс",
    items: [
      { type: "cardio", name: "Беговая дорожка", duration: 20, distance: 3, intensityId: "run-8" },
      { type: "cardio", name: "Эллипс", duration: 10, distance: 1, intensityId: "elliptical-moderate" },
    ],
  },
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

function shiftDateISO(dateString, days) {
  const date = new Date(dateString + "T12:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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

function createAppState({ entries, profile, weightLog, nutritionEntries, favoriteFoods, savedMenus }) {
  return {
    version: APP_STATE_VERSION,
    savedAt: new Date().toISOString(),
    entries: Array.isArray(entries) ? entries : [],
    profile: { ...defaultProfile, ...(profile || {}) },
    weightLog: Array.isArray(weightLog) ? weightLog : [],
    nutritionEntries: Array.isArray(nutritionEntries) ? nutritionEntries : [],
    favoriteFoods: Array.isArray(favoriteFoods) ? favoriteFoods : [],
    savedMenus: Array.isArray(savedMenus) ? savedMenus : [],
  };
}

function mergeById(cloudItems = [], localItems = []) {
  const map = new Map();
  [...cloudItems, ...localItems].forEach((item) => {
    if (!item) return;
    const id = item.id || uid();
    map.set(id, { ...item, id });
  });
  return Array.from(map.values()).sort((a, b) => numeric(b.createdAt) - numeric(a.createdAt));
}

function mergeWeightLog(cloudItems = [], localItems = []) {
  const map = new Map();
  [...cloudItems, ...localItems].forEach((item) => {
    if (!item?.date) return;
    map.set(item.date, { ...item, id: item.id || uid() });
  });
  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function mergeFavoriteFoods(cloudItems = [], localItems = []) {
  const map = new Map();
  [...cloudItems, ...localItems].forEach((item) => {
    if (!item?.name) return;
    map.set(normalize(item.name), { ...item, id: item.id || uid() });
  });
  return Array.from(map.values()).slice(0, 30);
}

function mergeAppStates(cloudState, localState, preferLocalProfile) {
  const cloud = cloudState || {};
  const local = localState || {};
  return createAppState({
    entries: mergeById(cloud.entries, local.entries),
    profile: preferLocalProfile
      ? { ...defaultProfile, ...(cloud.profile || {}), ...(local.profile || {}) }
      : { ...defaultProfile, ...(local.profile || {}), ...(cloud.profile || {}) },
    weightLog: mergeWeightLog(cloud.weightLog, local.weightLog),
    nutritionEntries: mergeById(cloud.nutritionEntries, local.nutritionEntries),
    favoriteFoods: mergeFavoriteFoods(cloud.favoriteFoods, local.favoriteFoods),
    savedMenus: mergeById(cloud.savedMenus, local.savedMenus).slice(0, 20),
  });
}

function pickNumber(...values) {
  for (const value of values) {
    const parsed = numeric(value, NaN);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

function parseServingGrams(value) {
  if (!value) return 0;
  const match = String(value).replace(",", ".").match(/(\d+(?:\.\d+)?)\s*g/i);
  return match ? numeric(match[1]) : 0;
}

function extractOpenFoodFactsNutrients(nutriments = {}) {
  const energyKcal = pickNumber(
    nutriments["energy-kcal_100g"],
    nutriments["energy-kcal"],
    nutriments.energy_kcal_100g,
    nutriments.energy_kcal
  );
  const energyKj = pickNumber(nutriments.energy_100g, nutriments.energy, nutriments["energy-kj_100g"], nutriments["energy-kj"]);
  return {
    calories: round(energyKcal || (energyKj ? energyKj / 4.184 : 0), 1),
    protein: round(pickNumber(nutriments.proteins_100g, nutriments.proteins, nutriments.protein_100g), 1),
    fat: round(pickNumber(nutriments.fat_100g, nutriments.fat), 1),
    carbs: round(pickNumber(nutriments.carbohydrates_100g, nutriments.carbohydrates, nutriments.carbs_100g), 1),
  };
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

function getExerciseInfo(name) {
  const normalizedName = normalize(name);
  return exerciseLibrary.find((exercise) => normalize(exercise.name) === normalizedName) || null;
}

function formatMuscles(primary = [], secondary = []) {
  const all = [...primary, ...secondary];
  return all.length ? all.join(", ") : "нет данных";
}

const translitMap = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugifyExercise(name) {
  return normalize(name)
    .split("")
    .map((letter) => translitMap[letter] ?? letter)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "exercise";
}

function getExerciseImageSrc(name) {
  return `/exercises/${slugifyExercise(name)}.png`;
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

  return { first, last, days, delta, kgPerWeek, caloriesPerDay, weeksToGoal };
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
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [savedMenus, setSavedMenus] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [workoutForm, setWorkoutForm] = useState(emptyWorkoutForm());
  const [foodForm, setFoodForm] = useState(emptyFoodForm());
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weightForm, setWeightForm] = useState({ date: todayISO(), weightKg: "" });
  const [scanner, setScanner] = useState({ active: false, message: "", product: null });
  const [restTimer, setRestTimer] = useState({ seconds: 90, left: 90, running: false });
  const [exerciseInfoName, setExerciseInfoName] = useState("");
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState("signin");
  const [authMessage, setAuthMessage] = useState("");
  const [cloudStatus, setCloudStatus] = useState(supabase ? "Войдите, чтобы включить облачную синхронизацию" : "Supabase пока не подключен");
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanFrameRef = useRef(null);
  const zxingControlsRef = useRef(null);
  const hasLocalDataRef = useRef(false);
  const skipCloudSaveRef = useRef(false);
  const appStateRef = useRef(null);

  appStateRef.current = createAppState({ entries, profile, weightLog, nutritionEntries, favoriteFoods, savedMenus });

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(WORKOUT_KEY) || localStorage.getItem(OLD_WORKOUT_KEY);
      const savedOldSettings = localStorage.getItem(OLD_SETTINGS_KEY);
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      const savedWeightLog = localStorage.getItem(WEIGHT_LOG_KEY);
      const savedNutrition = localStorage.getItem(NUTRITION_KEY);
      const savedFavorites = localStorage.getItem(FAVORITE_FOODS_KEY);
      const savedMenusValue = localStorage.getItem(SAVED_MENUS_KEY);
      hasLocalDataRef.current = Boolean(savedEntries || savedProfile || savedOldSettings || savedWeightLog || savedNutrition || savedFavorites || savedMenusValue);

      if (savedEntries) setEntries(JSON.parse(savedEntries));
      if (savedProfile) {
        setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
      } else if (savedOldSettings) {
        const oldSettings = JSON.parse(savedOldSettings);
        setProfile({ ...defaultProfile, weightKg: String(oldSettings.bodyWeightKg || "70") });
      }
      if (savedWeightLog) setWeightLog(JSON.parse(savedWeightLog));
      if (savedNutrition) setNutritionEntries(JSON.parse(savedNutrition));
      if (savedFavorites) setFavoriteFoods(JSON.parse(savedFavorites));
      if (savedMenusValue) setSavedMenus(JSON.parse(savedMenusValue));
    } catch (error) {
      console.error("Не удалось загрузить данные", error);
    }
  }, []);

  useEffect(() => localStorage.setItem(WORKOUT_KEY, JSON.stringify(entries)), [entries]);
  useEffect(() => localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(weightLog)), [weightLog]);
  useEffect(() => localStorage.setItem(NUTRITION_KEY, JSON.stringify(nutritionEntries)), [nutritionEntries]);
  useEffect(() => localStorage.setItem(FAVORITE_FOODS_KEY, JSON.stringify(favoriteFoods)), [favoriteFoods]);
  useEffect(() => localStorage.setItem(SAVED_MENUS_KEY, JSON.stringify(savedMenus)), [savedMenus]);


  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthMessage(error.message);
      setSession(data?.session || null);
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user?.id) {
      setCloudLoaded(false);
      return undefined;
    }

    let cancelled = false;
    async function loadCloudState() {
      try {
        setCloudLoaded(false);
        setCloudStatus("Загружаю облачные данные...");
        const { data, error } = await supabase
          .from(CLOUD_TABLE)
          .select("state, updated_at")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;

        const localState = appStateRef.current;
        const nextState = data?.state
          ? mergeAppStates(data.state, localState, hasLocalDataRef.current)
          : localState;

        skipCloudSaveRef.current = true;
        applyAppState(nextState);
        window.setTimeout(() => { skipCloudSaveRef.current = false; }, 0);
        await saveCloudState(session.user.id, nextState);

        if (!cancelled) {
          setCloudLoaded(true);
          setCloudStatus(data?.state ? "Облако подключено · данные объединены" : "Облако подключено · локальные данные сохранены");
        }
      } catch (error) {
        if (!cancelled) {
          setCloudLoaded(false);
          setCloudStatus(`Ошибка синхронизации: ${error.message}`);
        }
      }
    }

    loadCloudState();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!supabase || !session?.user?.id || !cloudLoaded || skipCloudSaveRef.current) return undefined;

    const timeout = window.setTimeout(async () => {
      try {
        setCloudStatus("Сохраняю изменения...");
        await saveCloudState(session.user.id, appStateRef.current);
        setCloudStatus("Сохранено в облаке");
      } catch (error) {
        setCloudStatus(`Ошибка сохранения: ${error.message}`);
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [session?.user?.id, cloudLoaded, entries, profile, weightLog, nutritionEntries, favoriteFoods, savedMenus]);

  useEffect(() => {
    if (!restTimer.running) return undefined;
    const interval = window.setInterval(() => {
      setRestTimer((current) => {
        if (current.left <= 1) return { ...current, left: 0, running: false };
        return { ...current, left: current.left - 1 };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [restTimer.running]);

  useEffect(() => () => stopScanner(), []);

  const cardioNames = Object.keys(cardioProfiles);

  const exerciseNames = useMemo(() => {
    const names = new Set([...strengthExercises, ...cardioNames]);
    entries.forEach((entry) => names.add(entry.name));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "ru"));
  }, [entries]);

  const resolvedCardioName = workoutForm.type === "cardio" ? resolveCardioName(workoutForm.name) || workoutForm.name : null;
  const activeCardioProfile = workoutForm.type === "cardio" ? getCardioProfile(workoutForm.name) || cardioProfiles["Беговая дорожка"] : null;
  const selectedIntensity = getIntensity(activeCardioProfile, workoutForm.intensityId);
  const selectedExerciseInfo = workoutForm.type === "strength" ? getExerciseInfo(workoutForm.name) : null;
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

  const dateEntries = useMemo(() => entries.filter((entry) => entry.date === selectedDate).sort((a, b) => b.createdAt - a.createdAt), [entries, selectedDate]);

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
    ? { name: foodForm.name.trim(), calories: numeric(foodForm.calories), protein: numeric(foodForm.protein), fat: numeric(foodForm.fat), carbs: numeric(foodForm.carbs) }
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

  const dayWorkoutSummary = useMemo(() => {
    const strength = dateEntries.filter((entry) => entry.type !== "cardio");
    const cardio = dateEntries.filter((entry) => entry.type === "cardio");
    return {
      strengthCount: strength.length,
      cardioCount: cardio.length,
      cardioCalories: cardio.reduce((sum, entry) => sum + numeric(entry.calories), 0),
      volume: strength.reduce((sum, entry) => sum + volume(entry), 0),
      minutes: cardio.reduce((sum, entry) => sum + numeric(entry.duration), 0),
    };
  }, [dateEntries]);



  function applyAppState(state) {
    if (!state) return;
    setEntries(Array.isArray(state.entries) ? state.entries : []);
    setProfile({ ...defaultProfile, ...(state.profile || {}) });
    setWeightLog(Array.isArray(state.weightLog) ? state.weightLog : []);
    setNutritionEntries(Array.isArray(state.nutritionEntries) ? state.nutritionEntries : []);
    setFavoriteFoods(Array.isArray(state.favoriteFoods) ? state.favoriteFoods : []);
    setSavedMenus(Array.isArray(state.savedMenus) ? state.savedMenus : []);
  }

  async function saveCloudState(userId, state) {
    if (!supabase || !userId) return;
    const { error } = await supabase.from(CLOUD_TABLE).upsert(
      {
        user_id: userId,
        state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    if (!supabase) {
      setAuthMessage("Supabase не подключен: добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.");
      return;
    }
    const email = authEmail.trim();
    const password = authPassword;
    if (!email || password.length < 6) {
      setAuthMessage("Введи email и пароль минимум 6 символов.");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");
    try {
      const result = authMode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      setAuthMessage(authMode === "signup" ? "Аккаунт создан. Если включено подтверждение email, проверь почту." : "Вход выполнен.");
      setAuthPassword("");
    } catch (error) {
      setAuthMessage(error.message || "Не удалось выполнить вход.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setCloudLoaded(false);
      setCloudStatus("Вы вышли. Данные остаются локально на устройстве.");
    } catch (error) {
      setAuthMessage(error.message || "Не удалось выйти.");
    } finally {
      setAuthLoading(false);
    }
  }

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function setWorkoutField(field, value) {
    setWorkoutForm((current) => ({ ...current, [field]: value }));
  }

  function selectWorkoutType(type) {
    setWorkoutForm((current) => ({ ...emptyWorkoutForm(), type, name: type === "cardio" ? "Беговая дорожка" : current.name }));
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

  function makeWorkoutEntryFromTemplate(item, index = 0) {
    if (item.type === "cardio") {
      const profileForEntry = getCardioProfile(item.name) || cardioProfiles["Беговая дорожка"];
      const intensity = getIntensity(profileForEntry, item.intensityId);
      const calories = calculateExerciseCalories({ met: intensity?.met, weightKg: profile.weightKg, minutes: item.duration });
      return {
        id: uid(),
        date: selectedDate,
        type: "cardio",
        name: resolveCardioName(item.name) || item.name,
        duration: numeric(item.duration),
        intensityId: intensity?.id || "",
        intensityLabel: intensity?.label || "",
        met: intensity?.met || 0,
        distance: numeric(item.distance),
        calories,
        note: "Из шаблона",
        createdAt: Date.now() + index,
      };
    }
    return {
      id: uid(),
      date: selectedDate,
      type: "strength",
      name: item.name,
      sets: numeric(item.sets),
      reps: numeric(item.reps),
      weight: item.weight === "" ? "" : numeric(item.weight),
      note: "Из шаблона",
      createdAt: Date.now() + index,
    };
  }

  function applyTemplate(template) {
    const generated = template.items.map((item, index) => makeWorkoutEntryFromTemplate(item, index));
    setEntries((current) => [...generated, ...current]);
    setTab("training");
  }

  function addWorkoutEntry(event) {
    event.preventDefault();
    const name = workoutForm.name.trim();
    if (!name) return;

    if (workoutForm.type === "cardio") {
      const profileForEntry = getCardioProfile(name) || activeCardioProfile;
      const intensity = getIntensity(profileForEntry, workoutForm.intensityId);
      const minutes = numeric(workoutForm.duration);
      const calories = numeric(workoutForm.calories) || calculateExerciseCalories({ met: intensity?.met, weightKg: profile.weightKg, minutes });
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

  function applyFoodToForm(food) {
    setFoodForm((current) => ({
      ...current,
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      fat: String(food.fat),
      carbs: String(food.carbs),
      grams: String(food.defaultGrams || current.grams || 100),
    }));
  }

  function saveCurrentFoodAsFavorite() {
    const food = foodSource;
    if (!food.name || !numeric(food.calories)) return;
    setFavoriteFoods((current) => {
      const withoutSame = current.filter((item) => normalize(item.name) !== normalize(food.name));
      return [
        {
          id: uid(),
          name: food.name,
          calories: numeric(food.calories),
          protein: numeric(food.protein),
          fat: numeric(food.fat),
          carbs: numeric(food.carbs),
          defaultGrams: numeric(foodForm.grams, 100),
        },
        ...withoutSame,
      ].slice(0, 20);
    });
  }

  function deleteFavoriteFood(id) {
    setFavoriteFoods((current) => current.filter((item) => item.id !== id));
  }

  function addNutritionEntry(event) {
    event?.preventDefault?.();
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
        per100: { calories: numeric(food.calories), protein: numeric(food.protein), fat: numeric(food.fat), carbs: numeric(food.carbs) },
        total,
        createdAt: Date.now(),
      },
      ...current,
    ]);
    setFoodForm(emptyFoodForm());
    setScanner((current) => current.product?.name ? { ...current, product: null, message: `Добавлено: ${food.name}` } : current);
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
        per100: { calories: item.food.calories, protein: item.food.protein, fat: item.food.fat, carbs: item.food.carbs },
        total,
        createdAt: Date.now(),
      };
    });

    setNutritionEntries((current) => [...generated, ...current.filter((item) => item.date !== selectedDate)]);
  }

  function copyYesterdayNutrition() {
    const yesterday = shiftDateISO(selectedDate, -1);
    const yesterdayItems = nutritionEntries.filter((item) => item.date === yesterday);
    if (!yesterdayItems.length) return;
    const copied = yesterdayItems.map((item) => ({ ...item, id: uid(), date: selectedDate, createdAt: Date.now() }));
    setNutritionEntries((current) => [...copied, ...current.filter((item) => item.date !== selectedDate)]);
  }

  function saveDayAsMenu() {
    if (!dayNutrition.daily.length) return;
    const title = `Меню ${formatDate(selectedDate)}`;
    const saved = {
      id: uid(),
      title,
      items: dayNutrition.daily.map((item) => ({ meal: item.meal, name: item.name, grams: item.grams, per100: item.per100 })),
      calories: Math.round(dayNutrition.totals.calories),
      createdAt: Date.now(),
    };
    setSavedMenus((current) => [saved, ...current].slice(0, 8));
  }

  function applySavedMenu(menu) {
    const items = menu.items.map((item) => {
      const total = calculateFoodAmount(item.per100, item.grams);
      return { id: uid(), date: selectedDate, meal: item.meal, name: item.name, grams: item.grams, per100: item.per100, total, createdAt: Date.now() };
    });
    setNutritionEntries((current) => [...items, ...current.filter((item) => item.date !== selectedDate)]);
  }

  function deleteSavedMenu(id) {
    setSavedMenus((current) => current.filter((item) => item.id !== id));
  }

  function startRestTimer(seconds = restTimer.seconds) {
    setRestTimer({ seconds, left: seconds, running: true });
  }

  function pauseRestTimer() {
    setRestTimer((current) => ({ ...current, running: !current.running && current.left > 0 }));
  }

  function resetRestTimer() {
    setRestTimer((current) => ({ ...current, left: current.seconds, running: false }));
  }

  async function fetchOpenFoodFactsProduct(code) {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,serving_size`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Не удалось получить продукт");
    const data = await response.json();
    if (data.status !== 1 || !data.product) throw new Error("Продукт не найден в базе Open Food Facts");

    const nutriments = data.product.nutriments || {};
    const per100 = extractOpenFoodFactsNutrients(nutriments);
    const name = [data.product.product_name, data.product.brands].filter(Boolean).join(" · ") || `Продукт ${code}`;
    const servingGrams = parseServingGrams(data.product.serving_size);
    const hasMacros = per100.calories || per100.protein || per100.fat || per100.carbs;

    setFoodForm((current) => ({
      ...current,
      name,
      grams: current.grams || String(servingGrams || 100),
      calories: String(per100.calories || ""),
      protein: String(per100.protein || ""),
      fat: String(per100.fat || ""),
      carbs: String(per100.carbs || ""),
    }));
    setScanner({
      active: false,
      message: hasMacros
        ? `Найдено: ${name}. КБЖУ заполнены на 100 г — проверь граммы и нажми «Добавить».`
        : `Найдено: ${name}, но в базе нет полного КБЖУ. Введи данные с этикетки вручную.`,
      product: { code, name, per100 },
    });
  }

  function stopScanner() {
    if (scanFrameRef.current) cancelAnimationFrame(scanFrameRef.current);
    scanFrameRef.current = null;
    if (zxingControlsRef.current) {
      try { zxingControlsRef.current.stop?.(); } catch (error) { console.error(error); }
      zxingControlsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanner((current) => ({ ...current, active: false }));
  }

  async function startNativeBarcodeScanner() {
    const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    streamRef.current = stream;
    setScanner({ active: true, message: "Наведи камеру на штрихкод упаковки", product: null, engine: "native" });

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
          setScanner({ active: false, message: `Штрихкод найден: ${code}. Ищу продукт...`, product: { code }, engine: "native" });
          await fetchOpenFoodFactsProduct(code);
          return;
        }
      } catch (error) {
        console.error(error);
      }
      scanFrameRef.current = requestAnimationFrame(scan);
    };

    scanFrameRef.current = requestAnimationFrame(scan);
  }

  async function startZxingScanner() {
    setScanner({ active: true, message: "Safari/Firefox: включаю совместимый сканер ZXing...", product: null, engine: "zxing" });

    setTimeout(async () => {
      try {
        const zxing = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@zxing/browser@latest/+esm");
        const reader = new zxing.BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, async (result, error, callbackControls) => {
          if (!result) return;
          const code = typeof result.getText === "function" ? result.getText() : String(result.text || result);
          try { callbackControls?.stop?.(); } catch (stopError) { console.error(stopError); }
          zxingControlsRef.current = null;
          setScanner({ active: false, message: `Штрихкод найден: ${code}. Ищу продукт...`, product: { code }, engine: "zxing" });
          await fetchOpenFoodFactsProduct(code);
        });
        zxingControlsRef.current = controls;
        setScanner({ active: true, message: "Наведи камеру на штрихкод упаковки. Работает через ZXing fallback.", product: null, engine: "zxing" });
      } catch (error) {
        stopScanner();
        setScanner({ active: false, message: error.message || "Не удалось запустить совместимый сканер. Введи штрихкод вручную.", product: null, engine: "zxing" });
      }
    }, 0);
  }

  async function startScanner() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setScanner({ active: false, message: "Камера недоступна в этом браузере. Можно ввести штрихкод вручную.", product: null });
        return;
      }

      if ("BarcodeDetector" in window) {
        await startNativeBarcodeScanner();
      } else {
        await startZxingScanner();
      }
    } catch (error) {
      stopScanner();
      setScanner({ active: false, message: error.message || "Не удалось открыть камеру", product: null });
    }
  }

  return (
    <div className="app-shell">
      <div className="phone">
        <header className="header slim-header">
          <div className="header-top">
            <div>
              <p className="eyebrow">Training & Nutrition</p>
              <h1>{profile.name ? `${profile.name}, план на день` : "Мой фитнес-дневник"}</h1>
            </div>
            <div className="logo"><HeartPulse /></div>
          </div>
        </header>

        <main className="main with-bottom-nav">
          {tab === "dashboard" && (
            <DashboardScreen
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              profile={profile}
              nutritionPlan={nutritionPlan}
              dayNutrition={dayNutrition}
              dayWorkoutSummary={dayWorkoutSummary}
              dateEntries={dateEntries}
              groupedNutrition={groupedNutrition}
              weightLog={weightLog}
              setTab={setTab}
              addSampleMenu={addSampleMenu}
              startRestTimer={startRestTimer}
            />
          )}

          {tab === "training" && (
            <section className="screen stack">
              <DateCard selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
              <RestTimerCard restTimer={restTimer} setRestTimer={setRestTimer} startRestTimer={startRestTimer} pauseRestTimer={pauseRestTimer} resetRestTimer={resetRestTimer} />

              <div className="card stack">
                <div className="section-head">
                  <div>
                    <h2>Шаблоны тренировок</h2>
                    <p>Добавляют готовый план на выбранную дату</p>
                  </div>
                  <ClipboardList className="muted-icon" />
                </div>
                <div className="template-grid">
                  {workoutTemplates.map((template) => (
                    <button key={template.id} type="button" className="template-card" onClick={() => applyTemplate(template)}>
                      <strong>{template.name}</strong>
                      <span>{template.detail}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={addWorkoutEntry} className="card stack">
                <div className="section-head">
                  <div>
                    <h2>Добавить упражнение</h2>
                    <p>Силовые и кардио сохраняются в одном дневнике</p>
                  </div>
                  <button type="button" className="icon-button" onClick={() => setWorkoutForm(emptyWorkoutForm())} aria-label="Очистить форму"><X size={18} /></button>
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
                      {suggestions.map((name) => <button key={name} type="button" onClick={() => selectSuggestion(name)}>{name}</button>)}
                    </div>
                  )}
                </div>

                {workoutForm.type === "cardio" ? (
                  <div className="stack">
                    <div className="info-card compact-info">
                      <span>{activeCardioProfile?.icon || "🔥"}</span>
                      <div>
                        <strong>{resolvedCardioName || "Кардио"}</strong>
                        <p>Ккал считаются по весу из профиля: {profile.weightKg || 70} кг</p>
                      </div>
                    </div>

                    <div className="field">
                      <label>Сложность / настройка</label>
                      <select value={workoutForm.intensityId || selectedIntensity?.id || ""} onChange={(event) => setWorkoutField("intensityId", event.target.value)}>
                        {activeCardioProfile?.intensities.map((item) => <option key={item.id} value={item.id}>{item.label} · MET {item.met}</option>)}
                      </select>
                    </div>

                    <div className="grid-2">
                      <NumberField label="Время, мин" value={workoutForm.duration} onChange={(value) => setWorkoutField("duration", value)} />
                      <NumberField label="Дистанция, км" value={workoutForm.distance || activeCardioProfile?.defaultDistance || ""} onChange={(value) => setWorkoutField("distance", value)} />
                    </div>
                    <div className="grid-2">
                      <NumberField label="Ккал вручную" value={workoutForm.calories} onChange={(value) => setWorkoutField("calories", value)} placeholder={String(estimatedWorkoutCalories)} />
                      <ReadOnlyMetric label="Оценка" value={`${estimatedWorkoutCalories} ккал`} />
                    </div>
                  </div>
                ) : (
                  <div className="stack">
                    {selectedExerciseInfo && (
                      <div className="exercise-help-strip">
                        <img className="exercise-thumb" src={getExerciseImageSrc(selectedExerciseInfo.name)} alt="" loading="lazy" />
                        <div>
                          <strong>{selectedExerciseInfo.category}</strong>
                          <p>{formatMuscles(selectedExerciseInfo.primary, selectedExerciseInfo.secondary)}</p>
                        </div>
                        <button type="button" onClick={() => setExerciseInfoName(selectedExerciseInfo.name)}><Info size={16} /> Как делать</button>
                      </div>
                    )}
                    <div className="grid-3">
                      <NumberField label="Подходы" value={workoutForm.sets} onChange={(value) => setWorkoutField("sets", value)} />
                      <NumberField label="Повторы" value={workoutForm.reps} onChange={(value) => setWorkoutField("reps", value)} />
                      <NumberField label="Вес, кг" value={workoutForm.weight} onChange={(value) => setWorkoutField("weight", value)} placeholder="0" />
                    </div>
                  </div>
                )}

                <div className="field">
                  <label>Заметка</label>
                  <textarea value={workoutForm.note} onChange={(event) => setWorkoutField("note", event.target.value)} placeholder="Например: увеличить вес на следующей тренировке" rows={3} />
                </div>

                <button className="primary-button" type="submit"><Plus size={19} /> Добавить</button>
              </form>

              <WorkoutList selectedDate={selectedDate} dateEntries={dateEntries} deleteWorkoutEntry={deleteWorkoutEntry} startRestTimer={startRestTimer} openExerciseInfo={setExerciseInfoName} />
            </section>
          )}

          {tab === "nutrition" && (
            <NutritionScreen
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              nutritionPlan={nutritionPlan}
              dayNutrition={dayNutrition}
              groupedNutrition={groupedNutrition}
              foodForm={foodForm}
              setFoodForm={setFoodForm}
              selectedFood={selectedFood}
              selectFood={selectFood}
              favoriteFoods={favoriteFoods}
              applyFoodToForm={applyFoodToForm}
              deleteFavoriteFood={deleteFavoriteFood}
              foodPreview={foodPreview}
              addNutritionEntry={addNutritionEntry}
              saveCurrentFoodAsFavorite={saveCurrentFoodAsFavorite}
              scanner={scanner}
              videoRef={videoRef}
              startScanner={startScanner}
              stopScanner={stopScanner}
              lookupBarcode={fetchOpenFoodFactsProduct}
              addSampleMenu={addSampleMenu}
              copyYesterdayNutrition={copyYesterdayNutrition}
              saveDayAsMenu={saveDayAsMenu}
              savedMenus={savedMenus}
              applySavedMenu={applySavedMenu}
              deleteSavedMenu={deleteSavedMenu}
              deleteNutritionEntry={deleteNutritionEntry}
            />
          )}


          {tab === "profile" && (
            <ProfileScreen
              profile={profile}
              updateProfile={updateProfile}
              nutritionPlan={nutritionPlan}
              bmi={bmi}
              trend={trend}
              weightForm={weightForm}
              setWeightForm={setWeightForm}
              addWeightRecord={addWeightRecord}
              weightLog={weightLog}
              deleteWeightRecord={deleteWeightRecord}
              auth={{
                enabled: Boolean(supabase),
                session,
                authLoading,
                authEmail,
                setAuthEmail,
                authPassword,
                setAuthPassword,
                authMode,
                setAuthMode,
                authMessage,
                cloudStatus,
                cloudLoaded,
                handleAuthSubmit,
                handleSignOut,
              }}
            />
          )}
        </main>

        <nav className="bottom-nav">
          <BottomNavButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={Home} label="Сегодня" />
          <BottomNavButton active={tab === "training"} onClick={() => setTab("training")} icon={Dumbbell} label="Трен" />
          <BottomNavButton active={tab === "nutrition"} onClick={() => setTab("nutrition")} icon={Utensils} label="Питание" />
          <BottomNavButton active={tab === "profile"} onClick={() => setTab("profile")} icon={UserRound} label="Профиль" />
        </nav>

        {exerciseInfoName && (
          <ExerciseInfoModal name={exerciseInfoName} onClose={() => setExerciseInfoName("")} />
        )}
      </div>
    </div>
  );
}

function DashboardScreen({ selectedDate, setSelectedDate, profile, nutritionPlan, dayNutrition, dayWorkoutSummary, dateEntries, groupedNutrition, weightLog, setTab, addSampleMenu, startRestTimer }) {
  const caloriesLeft = nutritionPlan.targetCalories - dayNutrition.totals.calories;
  const latestWeight = weightLog[0]?.weightKg || profile.weightKg;
  const targetWeight = numeric(profile.targetWeightKg);
  const currentWeight = numeric(latestWeight);
  const weightDelta = targetWeight && currentWeight ? round(targetWeight - currentWeight, 1) : 0;

  return (
    <section className="screen stack">
      <DateCard selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <div className="hero-card">
        <div>
          <p className="eyebrow">Сегодня</p>
          <h2>{profile.name ? `${profile.name}, держим курс` : "План на день"}</h2>
          <p>Открой приложение, быстро проверь питание, тренировку и вес — без лишних вкладок.</p>
        </div>
        <div className="hero-ring">
          <strong>{Math.max(0, Math.min(100, Math.round((dayNutrition.totals.calories / Math.max(1, nutritionPlan.targetCalories)) * 100)))}%</strong>
          <span>ккал</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <SummaryTile icon={Utensils} label="Осталось" value={`${Math.round(caloriesLeft)} ккал`} detail={`съедено ${Math.round(dayNutrition.totals.calories)}`} tone={caloriesLeft >= 0 ? "good" : "warn"} />
        <SummaryTile icon={Dumbbell} label="Треня" value={`${dateEntries.length} записей`} detail={`${dayWorkoutSummary.minutes} мин кардио`} />
        <SummaryTile icon={Flame} label="Сожжено" value={`${dayWorkoutSummary.cardioCalories} ккал`} detail="по кардио" tone="hot" />
        <SummaryTile icon={Target} label="Вес" value={`${latestWeight || "—"} кг`} detail={weightDelta ? `до цели ${weightDelta > 0 ? "+" : ""}${weightDelta} кг` : "цель задана"} />
      </div>

      <div className="card stack">
        <div className="section-head">
          <div>
            <h2>Быстрые действия</h2>
            <p>Самые частые сценарии — в один тап</p>
          </div>
          <ListPlus className="muted-icon" />
        </div>
        <div className="quick-actions">
          <button type="button" onClick={() => setTab("training")}><Dumbbell size={18} /> Добавить тренировку</button>
          <button type="button" onClick={() => setTab("nutrition")}><Apple size={18} /> Добавить еду</button>
          <button type="button" onClick={addSampleMenu}><Utensils size={18} /> Меню на день</button>
          <button type="button" onClick={() => startRestTimer(90)}><Timer size={18} /> Таймер 90с</button>
        </div>
      </div>

      <div className="grid-2 dashboard-panels">
        <div className="card stack small-gap">
          <div className="section-head inline"><h2>Треня</h2><button className="tiny-link" onClick={() => setTab("training")}>Открыть</button></div>
          {dateEntries.length ? dateEntries.slice(0, 3).map((entry) => <MiniWorkoutRow key={entry.id} entry={entry} />) : <p className="hint">Пока нет упражнений за день.</p>}
        </div>
        <div className="card stack small-gap">
          <div className="section-head inline"><h2>Питание</h2><button className="tiny-link" onClick={() => setTab("nutrition")}>Открыть</button></div>
          {meals.map((meal) => {
            const items = groupedNutrition[meal.id] || [];
            const calories = items.reduce((sum, item) => sum + item.total.calories, 0);
            return <MiniMealRow key={meal.id} label={meal.label} calories={calories} count={items.length} />;
          })}
        </div>
      </div>
    </section>
  );
}

function RestTimerCard({ restTimer, setRestTimer, startRestTimer, pauseRestTimer, resetRestTimer }) {
  const minutes = Math.floor(restTimer.left / 60);
  const seconds = restTimer.left % 60;
  const progress = restTimer.seconds ? Math.max(0, Math.min(1, restTimer.left / restTimer.seconds)) : 0;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="card rest-card">
      <div className="section-head">
        <div>
          <h2>Таймер отдыха</h2>
          <p>Круговой циферблат показывает, сколько паузы осталось</p>
        </div>
        <Timer className="muted-icon" />
      </div>
      <div className="timer-dial" aria-label="Таймер отдыха">
        <svg viewBox="0 0 160 160">
          <circle className="timer-track" cx="80" cy="80" r={radius} />
          <circle
            className="timer-progress"
            cx="80"
            cy="80"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="timer-dial-center">
          <strong>{minutes}:{String(seconds).padStart(2, "0")}</strong>
          <span>{restTimer.running ? "идёт отдых" : restTimer.left === 0 ? "готово" : "готов"}</span>
        </div>
      </div>
      <div className="timer-presets">
        {[60, 90, 120, 180].map((secondsValue) => (
          <button key={secondsValue} type="button" className={restTimer.seconds === secondsValue ? "active" : ""} onClick={() => setRestTimer({ seconds: secondsValue, left: secondsValue, running: false })}>{secondsValue / 60}м</button>
        ))}
      </div>
      <div className="grid-3 timer-controls">
        <button type="button" className="secondary-button" onClick={() => startRestTimer(restTimer.seconds)}><Play size={18} /> Старт</button>
        <button type="button" className="secondary-button" onClick={pauseRestTimer}><Pause size={18} /> Пауза</button>
        <button type="button" className="secondary-button" onClick={resetRestTimer}><RotateCcw size={18} /> Сброс</button>
      </div>
    </div>
  );
}

function WorkoutList({ selectedDate, dateEntries, deleteWorkoutEntry, startRestTimer, openExerciseInfo }) {
  return (
    <section className="stack">
      <div className="section-head inline">
        <h2>{formatDate(selectedDate)}</h2>
        <span className="pill">{dateEntries.length} записей</span>
      </div>
      {dateEntries.length === 0 ? (
        <EmptyState text="За этот день пока нет упражнений." />
      ) : (
        <div className="stack small-gap">
          {dateEntries.map((entry) => <ExerciseCard key={entry.id} entry={entry} onDelete={() => deleteWorkoutEntry(entry.id)} onRest={() => startRestTimer(90)} onInfo={openExerciseInfo} />)}
        </div>
      )}
    </section>
  );
}

function NutritionScreen({
  selectedDate,
  setSelectedDate,
  nutritionPlan,
  dayNutrition,
  groupedNutrition,
  foodForm,
  setFoodForm,
  selectedFood,
  selectFood,
  favoriteFoods,
  applyFoodToForm,
  deleteFavoriteFood,
  foodPreview,
  addNutritionEntry,
  saveCurrentFoodAsFavorite,
  scanner,
  videoRef,
  startScanner,
  stopScanner,
  lookupBarcode,
  addSampleMenu,
  copyYesterdayNutrition,
  saveDayAsMenu,
  savedMenus,
  applySavedMenu,
  deleteSavedMenu,
  deleteNutritionEntry,
}) {
  const [manualBarcode, setManualBarcode] = useState("");

  async function submitManualBarcode() {
    const code = manualBarcode.trim();
    if (!code) return;
    try {
      await lookupBarcode(code);
      setManualBarcode("");
    } catch (error) {
      console.error(error);
    }
  }

  return (
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

      <div className="card stack">
        <div className="section-head">
          <div>
            <h2>Ускорители питания</h2>
            <p>Копируй рацион, сохраняй меню и повторяй любимые продукты</p>
          </div>
          <Star className="muted-icon" />
        </div>
        <div className="grid-3">
          <button type="button" className="secondary-button" onClick={copyYesterdayNutrition}><Copy size={18} /> Вчера</button>
          <button type="button" className="secondary-button" onClick={saveDayAsMenu}><Save size={18} /> Сохранить</button>
          <button type="button" className="secondary-button" onClick={addSampleMenu}><Utensils size={18} /> Меню</button>
        </div>
        {savedMenus.length > 0 && (
          <div className="saved-menu-list">
            {savedMenus.map((menu) => (
              <div key={menu.id} className="saved-menu-row">
                <button type="button" onClick={() => applySavedMenu(menu)}><strong>{menu.title}</strong><span>{menu.calories} ккал</span></button>
                <button type="button" onClick={() => deleteSavedMenu(menu.id)} aria-label="Удалить меню"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={addNutritionEntry} className="card stack">
        <div className="section-head">
          <div>
            <h2>Добавить продукт</h2>
            <p>Выбери из базы, избранного или введи данные с этикетки</p>
          </div>
          <Apple className="muted-icon" />
        </div>

        {favoriteFoods.length > 0 && (
          <div className="favorite-foods">
            {favoriteFoods.map((food) => (
              <div key={food.id} className="favorite-chip">
                <button type="button" onClick={() => applyFoodToForm(food)}>{food.name}</button>
                <button type="button" onClick={() => deleteFavoriteFood(food.id)} aria-label="Удалить из избранного"><X size={13} /></button>
              </div>
            ))}
          </div>
        )}

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

        <div className="grid-2">
          <button className="primary-button" type="submit"><Plus size={19} /> Добавить</button>
          <button className="secondary-button" type="button" onClick={saveCurrentFoodAsFavorite}><Star size={18} /> В избранное</button>
        </div>
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
        <button type="button" className="secondary-button" onClick={scanner.active ? stopScanner : startScanner}>
          <Camera size={18} /> {scanner.active ? "Остановить" : "Сканировать"}
        </button>
        <div className="manual-barcode-row">
          <input value={manualBarcode} onChange={(event) => setManualBarcode(event.target.value)} inputMode="numeric" placeholder="Или введи штрихкод вручную" />
          <button type="button" className="tiny-link" onClick={submitManualBarcode}>Найти</button>
        </div>
        {scanner.message && <p className="hint">{scanner.message}</p>}
        {scanner.product?.name && (
          <div className="scanner-product-card">
            <div>
              <strong>{scanner.product.name}</strong>
              <p>{scanner.product.per100?.calories || 0} ккал · Б {scanner.product.per100?.protein || 0} · Ж {scanner.product.per100?.fat || 0} · У {scanner.product.per100?.carbs || 0} на 100 г</p>
            </div>
            <button type="button" className="primary-button" onClick={() => addNutritionEntry()}><Plus size={18} /> Добавить найденный продукт</button>
          </div>
        )}
        <p className="hint">В Safari используется fallback через ZXing. Камера работает только на HTTPS или localhost. По фото тарелки точность ограничена: без веса порции приложение не знает реальное количество граммов.</p>
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
              {items.length === 0 ? <p className="hint">Пока пусто.</p> : items.map((item) => <FoodCard key={item.id} item={item} onDelete={() => deleteNutritionEntry(item.id)} />)}
            </div>
          );
        })}
      </section>
    </section>
  );
}

function ProgressScreen({ query, setQuery, progressNames, progressExercise, setProgressExercise, selectedProgressEntries, sortedHistoryDates, groupedHistory, deleteWorkoutEntry, openExerciseInfo }) {
  const bestWeight = Math.max(0, ...selectedProgressEntries.filter((entry) => entry.type !== "cardio").map((entry) => numeric(entry.weight)));
  const bestVolume = Math.max(0, ...selectedProgressEntries.map((entry) => volume(entry)));
  const totalCardio = selectedProgressEntries.filter((entry) => entry.type === "cardio").reduce((sum, entry) => sum + numeric(entry.calories), 0);

  return (
    <section className="screen stack">
      <div className="card stack">
        <div className="section-head">
          <div>
            <h2>Прогресс упражнения</h2>
            <p>Выбери упражнение и смотри динамику по датам</p>
          </div>
          <LineChart className="muted-icon" />
        </div>
        <div className="field">
          <label>Упражнение</label>
          <select value={progressExercise} onChange={(event) => setProgressExercise(event.target.value)}>
            {progressNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <ExerciseProgressChart entries={selectedProgressEntries} />
        <div className="grid-3">
          <StatCard icon={History} label="Записей" value={selectedProgressEntries.length} />
          <StatCard icon={Weight} label="Лучший вес" value={bestWeight || "—"} suffix={bestWeight ? "кг" : ""} />
          <StatCard icon={Flame} label="Ккал кардио" value={totalCardio || "—"} />
        </div>
        {bestVolume > 0 && <p className="volume-line">Лучший силовой объём: <strong>{bestVolume.toLocaleString("ru-RU")} кг</strong></p>}
      </div>

      <div className="search-box">
        <Search size={20} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти в истории тренировок" />
      </div>
      {sortedHistoryDates.length === 0 ? (
        <EmptyState text="История пустая. После первой тренировки записи появятся здесь." />
      ) : (
        sortedHistoryDates.map((date) => (
          <section key={date} className="stack small-gap">
            <h2 className="date-title">{formatDate(date)}</h2>
            {groupedHistory[date]
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((entry) => <ExerciseCard key={entry.id} entry={entry} onDelete={() => deleteWorkoutEntry(entry.id)} compact onInfo={openExerciseInfo} />)}
          </section>
        ))
      )}
    </section>
  );
}


function AuthCard({ auth }) {
  if (!auth) return null;

  if (!auth.enabled) {
    return (
      <div className="card auth-card stack small-gap">
        <div className="section-head inline">
          <div>
            <h2>Аккаунт и синхронизация</h2>
            <p>Авторизация подготовлена, но Supabase еще не подключен</p>
          </div>
          <UserRound className="muted-icon" />
        </div>
        <p className="hint">Добавь в Vercel переменные VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY, затем создай таблицу app_state из файла supabase-schema.sql.</p>
      </div>
    );
  }

  if (auth.session?.user) {
    return (
      <div className="card auth-card stack small-gap">
        <div className="section-head inline">
          <div>
            <h2>Аккаунт подключен</h2>
            <p>{auth.session.user.email}</p>
          </div>
          <span className={`sync-badge ${auth.cloudLoaded ? "ready" : "pending"}`}>{auth.cloudLoaded ? "sync" : "..."}</span>
        </div>
        <div className="cloud-status">{auth.cloudStatus}</div>
        <button type="button" className="secondary-button" onClick={auth.handleSignOut} disabled={auth.authLoading}>Выйти</button>
      </div>
    );
  }

  return (
    <form className="card auth-card stack small-gap" onSubmit={auth.handleAuthSubmit}>
      <div className="section-head inline">
        <div>
          <h2>Аккаунт и синхронизация</h2>
          <p>Войди, чтобы данные были доступны с телефона и компьютера</p>
        </div>
        <UserRound className="muted-icon" />
      </div>
      <div className="segmented">
        <button type="button" className={auth.authMode === "signin" ? "active" : ""} onClick={() => auth.setAuthMode("signin")}>Вход</button>
        <button type="button" className={auth.authMode === "signup" ? "active" : ""} onClick={() => auth.setAuthMode("signup")}>Регистрация</button>
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" value={auth.authEmail} onChange={(event) => auth.setAuthEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
      </div>
      <div className="field">
        <label>Пароль</label>
        <input type="password" value={auth.authPassword} onChange={(event) => auth.setAuthPassword(event.target.value)} placeholder="Минимум 6 символов" autoComplete={auth.authMode === "signup" ? "new-password" : "current-password"} />
      </div>
      <button type="submit" className="primary-button" disabled={auth.authLoading}>{auth.authLoading ? "Подождите..." : auth.authMode === "signup" ? "Создать аккаунт" : "Войти"}</button>
      {auth.authMessage && <p className="hint">{auth.authMessage}</p>}
      <p className="hint">После входа локальные данные объединяются с облаком и дальше сохраняются автоматически.</p>
    </form>
  );
}

function ProfileMetric({ icon: Icon, label, value, detail }) {
  return (
    <div className="profile-metric">
      <div className="profile-metric-icon"><Icon size={18} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function ProfileScreen({ profile, updateProfile, nutritionPlan, bmi, trend, weightForm, setWeightForm, addWeightRecord, weightLog, deleteWeightRecord, auth }) {
  const [editing, setEditing] = useState(false);
  const activity = activityLevels.find((level) => level.value === profile.activityLevel) || activityLevels[2];
  const currentWeight = numeric(profile.weightKg);
  const targetWeight = numeric(profile.targetWeightKg);
  const goalDelta = targetWeight && currentWeight ? round(targetWeight - currentWeight, 1) : 0;
  const goalLabel = goalDelta === 0 ? "поддержание" : `${goalDelta > 0 ? "+" : ""}${goalDelta} кг до цели`;
  const sexLabel = profile.sex === "male" ? "мужской" : "женский";

  return (
    <section className="screen stack">
      <AuthCard auth={auth} />
      <div className="card profile-hero-card">
        <div className="profile-hero-main">
          <div className="profile-avatar"><UserRound size={28} /></div>
          <div className="profile-title-block">
            <p className="eyebrow">Личный профиль</p>
            <h2>{profile.name?.trim() || "Мой профиль"}</h2>
            <p>{sexLabel} · {profile.age || "—"} лет · {activity.label.toLowerCase()}</p>
          </div>
          <button type="button" className="edit-profile-button" onClick={() => setEditing((value) => !value)}>
            {editing ? <><Save size={17} /> Готово</> : <><UserRound size={17} /> Редактировать профиль</>}
          </button>
        </div>

        <div className="goal-strip">
          <div>
            <span>Текущая цель</span>
            <strong>{goalLabel}</strong>
          </div>
          <div>
            <span>Калории на день</span>
            <strong>{nutritionPlan.targetCalories || 0} ккал</strong>
          </div>
        </div>

        <div className="profile-overview-grid">
          <ProfileMetric icon={Weight} label="Вес" value={`${profile.weightKg || "—"} кг`} detail="используется в кардио" />
          <ProfileMetric icon={Target} label="Цель" value={`${profile.targetWeightKg || "—"} кг`} detail={`темп ${profile.weeklyChangeKg || "—"} кг/нед.`} />
          <ProfileMetric icon={Activity} label="Активность" value={activity.label} detail={activity.detail} />
          <ProfileMetric icon={Calculator} label="BMI" value={bmi ? round(bmi, 1) : "—"} detail={bmiCategory(bmi)} />
        </div>
      </div>

      {editing && (
        <div className="card stack profile-editor">
          <div className="section-head">
            <div>
              <h2>Редактирование профиля</h2>
              <p>Меняй данные здесь — расчеты обновятся автоматически</p>
            </div>
            <button type="button" className="icon-button" onClick={() => setEditing(false)} aria-label="Закрыть редактирование"><X size={18} /></button>
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

          <NumberField label="План изменения веса, кг/нед." value={profile.weeklyChangeKg} onChange={(value) => updateProfile("weeklyChangeKg", value)} />
          <button type="button" className="primary-button" onClick={() => setEditing(false)}><Save size={18} /> Сохранить и скрыть форму</button>
        </div>
      )}

      <div className="grid-2">
        <StatCard icon={Calculator} label="BMR" value={`${nutritionPlan.bmr || 0}`} suffix="ккал" />
        <StatCard icon={Flame} label="TDEE" value={`${nutritionPlan.tdee || 0}`} suffix="ккал" />
        <StatCard icon={Activity} label="Цель питания" value={`${nutritionPlan.targetCalories || 0}`} suffix="ккал" />
        <StatCard icon={Weight} label="BMI" value={bmi ? round(bmi, 1) : "—"} suffix={bmiCategory(bmi)} />
      </div>

      <div className="card stack macro-goal-card">
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
        <p className="hint">Это расчетный ориентир, не медицинское назначение. При заболеваниях, беременности, РПП или приеме препаратов питание лучше согласовывать со специалистом.</p>
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
          <div className="field">
            <label>Дата</label>
            <input type="date" value={weightForm.date} onChange={(event) => setWeightForm((current) => ({ ...current, date: event.target.value }))} />
          </div>
          <NumberField label="Вес, кг" value={weightForm.weightKg} onChange={(value) => setWeightForm((current) => ({ ...current, weightKg: value }))} placeholder={profile.weightKg} />
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
        ) : <p className="hint">Добавь минимум две записи веса в разные даты, чтобы увидеть темп изменения.</p>}
        <div className="weight-list">
          {weightLog.slice(0, 8).map((item) => (
            <div key={item.id} className="mini-row">
              <span>{formatDate(item.date)}</span>
              <strong>{item.weightKg} кг</strong>
              <button type="button" onClick={() => deleteWeightRecord(item.id)}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function muscleClass(targets, primary = [], secondary = []) {
  const normalizedTargets = targets.map(normalize);
  const primaryHit = primary.some((muscle) => normalizedTargets.some((target) => normalize(muscle).includes(target) || target.includes(normalize(muscle))));
  if (primaryHit) return "muscle-part primary";
  const secondaryHit = secondary.some((muscle) => normalizedTargets.some((target) => normalize(muscle).includes(target) || target.includes(normalize(muscle))));
  return secondaryHit ? "muscle-part secondary" : "muscle-part neutral";
}

function MuscleMiniMap({ primary = [], secondary = [] }) {
  return (
    <svg className="muscle-mini-map" viewBox="0 0 96 112" role="img" aria-label="Карта мышц">
      <circle className="muscle-outline" cx="48" cy="13" r="8" />
      <path className={muscleClass(["грудь", "широчайшие", "середина спины", "спина"], primary, secondary)} d="M34 27h28l6 29-10 15H38L28 56z" />
      <path className={muscleClass(["плечи", "дельта", "передняя дельта", "средняя дельта", "задняя дельта"], primary, secondary)} d="M27 30l-9 15 9 8 7-24zM69 30l9 15-9 8-7-24z" />
      <path className={muscleClass(["бицепс", "трицепс", "предплечья", "руки"], primary, secondary)} d="M17 46l-7 28 10 3 9-25zM79 46l7 28-10 3-9-25z" />
      <path className={muscleClass(["пресс", "кор"], primary, secondary)} d="M39 55h18l4 20H35z" />
      <path className={muscleClass(["ягодицы", "задняя поверхность бедра"], primary, secondary)} d="M36 75h24l-4 13H40z" />
      <path className={muscleClass(["квадрицепс", "ноги", "задняя поверхность бедра"], primary, secondary)} d="M35 87l-4 24h13l4-24zM61 87l4 24H52l-4-24z" />
      <path className={muscleClass(["икры"], primary, secondary)} d="M30 109h14v3H28zM52 109h14l2 3H52z" />
    </svg>
  );
}

function MuscleDiagram({ primary = [], secondary = [] }) {
  return (
    <div className="muscle-diagram-wrap">
      <MuscleMiniMap primary={primary} secondary={secondary} />
      <div className="muscle-legend">
        <span><i className="legend-dot primary" /> основная нагрузка</span>
        <span><i className="legend-dot secondary" /> вспомогательно</span>
      </div>
    </div>
  );
}

function ExerciseImagePanel({ info }) {
  return (
    <div className="exercise-image-panel">
      <img src={getExerciseImageSrc(info.name)} alt={`Карта мышц: ${info.name}`} loading="lazy" />
      <div className="muscle-legend image-legend">
        <span><i className="legend-dot primary" /> основная нагрузка</span>
        <span><i className="legend-dot secondary" /> вспомогательно</span>
      </div>
    </div>
  );
}

function ExerciseInfoModal({ name, onClose }) {
  const info = getExerciseInfo(name);
  if (!info) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="exercise-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">Техника упражнения</p>
            <h2>{info.name}</h2>
            <p>{info.category} · {info.equipment}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </div>

        <ExerciseImagePanel info={info} />

        <div className="muscle-chip-row">
          {info.primary.map((muscle) => <span key={`p-${muscle}`} className="muscle-chip primary">{muscle}</span>)}
          {info.secondary.map((muscle) => <span key={`s-${muscle}`} className="muscle-chip secondary">{muscle}</span>)}
        </div>

        <div className="instruction-block">
          <h3>Как выполнять</h3>
          <ol>
            {info.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>

        <div className="instruction-grid">
          <div className="instruction-block compact">
            <h3>Полезно помнить</h3>
            <ul>{info.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </div>
          <div className="instruction-block compact warning">
            <h3>Частые ошибки</h3>
            <ul>{info.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul>
          </div>
        </div>

        <p className="hint">Подсказки не заменяют работу с тренером. Если появляется боль в суставе или спине — уменьши нагрузку и проверь технику.</p>
      </div>
    </div>
  );
}

function BottomNavButton({ active, onClick, icon: Icon, label }) {
  return <button onClick={onClick} className={`bottom-tab ${active ? "active" : ""}`}><Icon size={19} /><span>{label}</span></button>;
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

function ExerciseCard({ entry, onDelete, onRest, onInfo, compact = false }) {
  const isCardio = entry.type === "cardio";
  const currentVolume = volume(entry);
  const exerciseInfo = !isCardio ? getExerciseInfo(entry.name) : null;
  return (
    <article className="exercise-card">
      <div className="card-top">
        <div>
          <div className="type-line"><span className={`type-dot ${isCardio ? "cardio" : "strength"}`} />{isCardio ? "Кардио" : "Силовое"}</div>
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
      {!isCardio && exerciseInfo && (
        <div className="muscle-summary">
          <img className="exercise-thumb" src={getExerciseImageSrc(exerciseInfo.name)} alt="" loading="lazy" />
          <p><strong>{exerciseInfo.primary.join(", ")}</strong>{exerciseInfo.secondary.length ? ` · также: ${exerciseInfo.secondary.join(", ")}` : ""}</p>
        </div>
      )}
      {!isCardio && currentVolume > 0 && <p className="volume-line">Объём: <strong>{currentVolume.toLocaleString("ru-RU")} кг</strong></p>}
      {!isCardio && (
        <div className="exercise-actions">
          {onRest && <button type="button" className="rest-mini-button" onClick={onRest}><Timer size={15} /> Отдых 90с</button>}
          {exerciseInfo && onInfo && <button type="button" className="info-mini-button" onClick={() => onInfo(entry.name)}><Info size={15} /> Как делать</button>}
        </div>
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

function SummaryTile({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className={`summary-tile ${tone || ""}`}>
      <Icon size={19} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
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
  const points = [...data].filter((item) => numeric(item.weightKg) > 0).sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 2) return <div className="chart-empty">Недостаточно данных для графика</div>;

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

function ExerciseProgressChart({ entries }) {
  const points = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 2) return <div className="chart-empty">Недостаточно данных по упражнению</div>;

  const width = 320;
  const height = 160;
  const padding = 26;
  const values = points.map((entry) => entry.type === "cardio" ? numeric(entry.calories) || numeric(entry.duration) : numeric(entry.weight) || volume(entry));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const firstDate = new Date(points[0].date + "T12:00:00").getTime();
  const lastDate = new Date(points[points.length - 1].date + "T12:00:00").getTime();
  const span = Math.max(1, lastDate - firstDate);
  const coords = points.map((entry, index) => {
    const value = values[index];
    const x = padding + ((new Date(entry.date + "T12:00:00").getTime() - firstDate) / span) * (width - padding * 2);
    const y = height - padding - ((value - min) / Math.max(1, max - min)) * (height - padding * 2);
    return { x, y, id: entry.id, value };
  });
  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <svg className="weight-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График прогресса упражнения">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="axis" />
      <path d={path} className="weight-path" />
      {coords.map((point) => <circle key={point.id} cx={point.x} cy={point.y} r="4" className="weight-point" />)}
      <text x={padding} y={18} className="chart-label">max {round(max, 1)}</text>
      <text x={padding} y={height - 6} className="chart-label">min {round(min, 1)}</text>
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

function MiniWorkoutRow({ entry }) {
  return (
    <div className="mini-summary-row">
      <span>{entry.type === "cardio" ? "🔥" : "💪"}</span>
      <div>
        <strong>{entry.name}</strong>
        <small>{entry.type === "cardio" ? `${entry.duration} мин · ${entry.calories} ккал` : `${entry.sets}×${entry.reps}${entry.weight ? ` · ${entry.weight} кг` : ""}`}</small>
      </div>
    </div>
  );
}

function MiniMealRow({ label, calories, count }) {
  return (
    <div className="mini-summary-row">
      <span>🍽️</span>
      <div>
        <strong>{label}</strong>
        <small>{count ? `${calories} ккал · ${count} записей` : "пока пусто"}</small>
      </div>
    </div>
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
