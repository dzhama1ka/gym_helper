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
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Route,
  Save,
  Search,
  Star,
  Smartphone,
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
const SCANNED_FOODS_KEY = "mobile-workout-tracker-scanned-foods-v1";
const LAST_AUTH_USER_KEY = "mobile-workout-tracker-last-auth-user-v1";
const CLOUD_TABLE = "app_state";
const APP_STATE_VERSION = 11;
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
  { id: "milk25", name: "Молоко 2.5%", calories: 52, protein: 3, fat: 2.5, carbs: 4.7 },
  { id: "kefir25", name: "Кефир 2.5%", calories: 53, protein: 3, fat: 2.5, carbs: 4 },
  { id: "bread-rye", name: "Хлеб ржаной", calories: 210, protein: 6, fat: 1.2, carbs: 43 },
  { id: "pasta-cooked", name: "Макароны варёные", calories: 150, protein: 5, fat: 1, carbs: 30 },
  { id: "beef-cooked", name: "Говядина готовая", calories: 250, protein: 26, fat: 15, carbs: 0 },
  { id: "turkey", name: "Индейка готовая", calories: 135, protein: 29, fat: 1.5, carbs: 0 },
  { id: "cheese", name: "Сыр полутвёрдый", calories: 350, protein: 24, fat: 28, carbs: 0 },
  { id: "tomato", name: "Помидор", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  { id: "cucumber", name: "Огурец", calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6 },
  { id: "avocado", name: "Авокадо", calories: 160, protein: 2, fat: 15, carbs: 9 },
  { id: "almonds", name: "Миндаль", calories: 579, protein: 21, fat: 50, carbs: 22 },
  { id: "whey", name: "Протеин сывороточный", calories: 390, protein: 78, fat: 6, carbs: 8 },
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
  sex: "",
  age: "",
  heightCm: "",
  weightKg: "",
  targetWeightKg: "",
  activityLevel: "",
  weeklyChangeKg: "",
  customCalories: "",
  customProtein: "",
  customFat: "",
  customCarbs: "",
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
  return formatShortDate(dateString);
}

function formatShortDate(dateString) {
  if (!dateString) return "—";
  const [year, month, day] = String(dateString).split("-");
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${String(year).slice(-2)}`;
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

function csvCell(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n;]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(headers, rows) {
  return [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
}

function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function fileDateStamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

function createAppState({ entries, profile, weightLog, nutritionEntries, favoriteFoods, savedMenus, scannedFoods }) {
  return {
    version: APP_STATE_VERSION,
    savedAt: new Date().toISOString(),
    entries: Array.isArray(entries) ? entries : [],
    profile: { ...defaultProfile, ...(profile || {}) },
    weightLog: Array.isArray(weightLog) ? weightLog : [],
    nutritionEntries: Array.isArray(nutritionEntries) ? nutritionEntries : [],
    favoriteFoods: Array.isArray(favoriteFoods) ? favoriteFoods : [],
    savedMenus: Array.isArray(savedMenus) ? savedMenus : [],
    scannedFoods: Array.isArray(scannedFoods) ? scannedFoods : [],
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
    scannedFoods: mergeFavoriteFoods(cloud.scannedFoods, local.scannedFoods).slice(0, 80),
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
    setMode: "summary",
    setRows: makeDefaultSetRows(3, 10, ""),
    duration: "30",
    intensityId: "",
    distance: "",
    calories: "",
    note: "",
  };
}

function makeDefaultSetRows(sets = 3, reps = 10, weight = "") {
  const count = Math.max(1, Math.min(12, Math.round(numeric(sets, 3)) || 3));
  return Array.from({ length: count }, (_, index) => ({
    id: uid(),
    order: index + 1,
    reps: String(reps ?? ""),
    weight: weight === undefined || weight === null ? "" : String(weight),
  }));
}

function normalizeWorkoutSetRows(rows = []) {
  return rows
    .map((row, index) => ({
      id: row.id || uid(),
      order: index + 1,
      reps: numeric(row.reps),
      weight: row.weight === "" || row.weight === undefined || row.weight === null ? "" : numeric(row.weight),
    }))
    .filter((row) => row.reps > 0);
}

function getStrengthSetRows(entry) {
  if (Array.isArray(entry?.setRows) && entry.setRows.length) return normalizeWorkoutSetRows(entry.setRows);
  const sets = Math.max(0, Math.round(numeric(entry?.sets)));
  if (!sets) return [];
  return Array.from({ length: sets }, (_, index) => ({
    id: `${entry.id || "entry"}-${index}`,
    order: index + 1,
    reps: numeric(entry?.reps),
    weight: entry?.weight === "" || entry?.weight === undefined || entry?.weight === null ? "" : numeric(entry?.weight),
  })).filter((row) => row.reps > 0);
}

function summarizeStrengthEntry(entry) {
  const rows = getStrengthSetRows(entry);
  const sets = rows.length || numeric(entry?.sets);
  const repsValues = rows.map((row) => row.reps).filter(Boolean);
  const weightValues = rows.map((row) => row.weight).filter((value) => value !== "" && value !== undefined && value !== null && numeric(value) > 0);
  const uniqueReps = [...new Set(repsValues.map(String))];
  const uniqueWeights = [...new Set(weightValues.map(String))];
  const repsLabel = uniqueReps.length === 1 ? uniqueReps[0] : repsValues.length ? `${Math.min(...repsValues)}–${Math.max(...repsValues)}` : entry?.reps || "—";
  const weightLabel = uniqueWeights.length === 1 ? `${uniqueWeights[0]} кг` : weightValues.length ? `${Math.min(...weightValues)}–${Math.max(...weightValues)} кг` : "—";
  const totalReps = rows.reduce((sum, row) => sum + numeric(row.reps), 0);
  const maxWeight = weightValues.length ? Math.max(...weightValues.map(numeric)) : 0;
  return { rows, sets, repsLabel, weightLabel, totalReps, maxWeight };
}

function formatStrengthSummary(entry) {
  if (!entry || entry.type === "cardio") return "";
  const summary = summarizeStrengthEntry(entry);
  const maxWeightText = summary.maxWeight ? ` · до ${summary.maxWeight} кг` : "";
  return `${summary.sets || 0} подх. · ${summary.totalReps || summary.repsLabel} повт.${maxWeightText}`;
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
  if (!weight || !height || !age || !profile.sex) return 0;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(profile.sex === "male" ? base + 5 : base - 161);
}

function calculateNutritionPlan(profile) {
  const weight = numeric(profile.weightKg);
  const targetWeight = numeric(profile.targetWeightKg, weight);
  const weeklyChange = Math.abs(numeric(profile.weeklyChangeKg));
  const bmr = calculateBmr(profile);
  const activity = numeric(profile.activityLevel);
  if (!weight || !bmr || !activity) {
    return {
      bmr: 0,
      tdee: 0,
      targetCalories: numeric(profile.customCalories),
      dailyAdjustment: 0,
      protein: numeric(profile.customProtein),
      fat: numeric(profile.customFat),
      carbs: numeric(profile.customCarbs),
      direction: 0,
      isCustom: Boolean(numeric(profile.customCalories) || numeric(profile.customProtein) || numeric(profile.customFat) || numeric(profile.customCarbs)),
    };
  }

  const tdee = Math.round(bmr * activity);
  const direction = targetWeight < weight ? -1 : targetWeight > weight ? 1 : 0;
  const dailyAdjustment = direction && weeklyChange ? direction * Math.round((weeklyChange * 7700) / 7) : 0;
  const targetCalories = Math.max(1200, Math.round(tdee + dailyAdjustment));

  const proteinPerKg = direction < 0 ? 1.6 : direction > 0 ? 1.8 : 1.4;
  const protein = Math.round(weight * proteinPerKg);
  const fatByWeight = Math.round(weight * 0.8);
  const fatByEnergyMin = Math.round((targetCalories * 0.2) / 9);
  const fat = Math.max(fatByWeight, fatByEnergyMin);
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbs = Math.max(0, Math.round((targetCalories - proteinCalories - fatCalories) / 4));

  const customCalories = numeric(profile.customCalories);
  const customProtein = numeric(profile.customProtein);
  const customFat = numeric(profile.customFat);
  const customCarbs = numeric(profile.customCarbs);
  const isCustom = Boolean(customCalories || customProtein || customFat || customCarbs);

  return {
    bmr,
    tdee,
    targetCalories: customCalories || targetCalories,
    dailyAdjustment,
    protein: customProtein || protein,
    fat: customFat || fat,
    carbs: customCarbs || carbs,
    direction,
    isCustom,
    autoTargetCalories: targetCalories,
    autoProtein: protein,
    autoFat: fat,
    autoCarbs: carbs,
  };
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

function makeDateRange(endDate, length = 7) {
  return Array.from({ length }, (_, index) => shiftDateISO(endDate, index - length + 1));
}

function calculateWeekSummary({ selectedDate, entries, nutritionEntries, weightLog, nutritionPlan }) {
  const dates = makeDateRange(selectedDate, 7);
  const dateSet = new Set(dates);
  const weekWorkouts = entries.filter((entry) => dateSet.has(entry.date));
  const weekNutrition = nutritionEntries.filter((item) => dateSet.has(item.date));
  const dailyCalories = dates.map((date) => ({
    date,
    calories: weekNutrition
      .filter((item) => item.date === date)
      .reduce((sum, item) => sum + numeric(item.total?.calories), 0),
  }));
  const dailyProtein = dates.map((date) => weekNutrition
    .filter((item) => item.date === date)
    .reduce((sum, item) => sum + numeric(item.total?.protein), 0));
  const loggedNutritionDays = dailyCalories.filter((item) => item.calories > 0).length;
  const avgCalories = loggedNutritionDays
    ? Math.round(dailyCalories.reduce((sum, item) => sum + item.calories, 0) / loggedNutritionDays)
    : 0;
  const avgProtein = loggedNutritionDays
    ? Math.round(dailyProtein.reduce((sum, value) => sum + value, 0) / loggedNutritionDays)
    : 0;
  const targetCalories = numeric(nutritionPlan?.targetCalories);
  const caloriesTargetHitDays = targetCalories
    ? dailyCalories.filter((item) => item.calories > 0 && Math.abs(item.calories - targetCalories) <= targetCalories * 0.12).length
    : 0;
  const strengthVolume = weekWorkouts.reduce((sum, entry) => sum + volume(entry), 0);
  const cardioCalories = weekWorkouts
    .filter((entry) => entry.type === "cardio")
    .reduce((sum, entry) => sum + numeric(entry.calories), 0);
  const cardioMinutes = weekWorkouts
    .filter((entry) => entry.type === "cardio")
    .reduce((sum, entry) => sum + numeric(entry.duration), 0);
  const workoutDays = new Set(weekWorkouts.map((entry) => entry.date)).size;
  const weekWeights = weightLog
    .filter((item) => dateSet.has(item.date) && numeric(item.weightKg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const weightChange = weekWeights.length >= 2
    ? round(numeric(weekWeights[weekWeights.length - 1].weightKg) - numeric(weekWeights[0].weightKg), 1)
    : null;

  return {
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    dates,
    dailyCalories,
    loggedNutritionDays,
    avgCalories,
    avgProtein,
    caloriesTargetHitDays,
    workoutDays,
    workoutCount: weekWorkouts.length,
    cardioCalories,
    cardioMinutes,
    strengthVolume,
    weightChange,
  };
}

function volume(entry) {
  if (entry.type !== "strength") return 0;
  const rows = getStrengthSetRows(entry);
  if (rows.length) {
    return rows.reduce((sum, row) => sum + numeric(row.reps) * numeric(row.weight), 0);
  }
  return numeric(entry.sets) * numeric(entry.reps) * numeric(entry.weight);
}

function App() {
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [weightLog, setWeightLog] = useState([]);
  const [nutritionEntries, setNutritionEntries] = useState([]);
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [savedMenus, setSavedMenus] = useState([]);
  const [scannedFoods, setScannedFoods] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [workoutForm, setWorkoutForm] = useState(emptyWorkoutForm());
  const [foodForm, setFoodForm] = useState(emptyFoodForm());
  const [editingWorkoutId, setEditingWorkoutId] = useState("");
  const [editingNutritionId, setEditingNutritionId] = useState("");
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
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanFrameRef = useRef(null);
  const zxingControlsRef = useRef(null);
  const hasLocalDataRef = useRef(false);
  const skipCloudSaveRef = useRef(false);
  const remoteApplyTimerRef = useRef(null);
  const lastCloudUpdatedAtRef = useRef("");
  const appStateRef = useRef(null);

  appStateRef.current = createAppState({ entries, profile, weightLog, nutritionEntries, favoriteFoods, savedMenus, scannedFoods });

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(WORKOUT_KEY) || localStorage.getItem(OLD_WORKOUT_KEY);
      const savedOldSettings = localStorage.getItem(OLD_SETTINGS_KEY);
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      const savedWeightLog = localStorage.getItem(WEIGHT_LOG_KEY);
      const savedNutrition = localStorage.getItem(NUTRITION_KEY);
      const savedFavorites = localStorage.getItem(FAVORITE_FOODS_KEY);
      const savedMenusValue = localStorage.getItem(SAVED_MENUS_KEY);
      const savedScannedFoods = localStorage.getItem(SCANNED_FOODS_KEY);
      hasLocalDataRef.current = Boolean(savedEntries || savedProfile || savedOldSettings || savedWeightLog || savedNutrition || savedFavorites || savedMenusValue || savedScannedFoods);

      if (savedEntries) setEntries(JSON.parse(savedEntries));
      if (savedProfile) {
        setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
      } else if (savedOldSettings) {
        const oldSettings = JSON.parse(savedOldSettings);
        setProfile({ ...defaultProfile, weightKg: String(oldSettings.bodyWeightKg || "") });
      }
      if (savedWeightLog) setWeightLog(JSON.parse(savedWeightLog));
      if (savedNutrition) setNutritionEntries(JSON.parse(savedNutrition));
      if (savedFavorites) setFavoriteFoods(JSON.parse(savedFavorites));
      if (savedMenusValue) setSavedMenus(JSON.parse(savedMenusValue));
      if (savedScannedFoods) setScannedFoods(JSON.parse(savedScannedFoods));
    } catch (error) {
      console.error("Не удалось загрузить данные", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem(WORKOUT_KEY, JSON.stringify(entries)); }, [hydrated, entries]);
  useEffect(() => { if (hydrated) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }, [hydrated, profile]);
  useEffect(() => { if (hydrated) localStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(weightLog)); }, [hydrated, weightLog]);
  useEffect(() => { if (hydrated) localStorage.setItem(NUTRITION_KEY, JSON.stringify(nutritionEntries)); }, [hydrated, nutritionEntries]);
  useEffect(() => { if (hydrated) localStorage.setItem(FAVORITE_FOODS_KEY, JSON.stringify(favoriteFoods)); }, [hydrated, favoriteFoods]);
  useEffect(() => { if (hydrated) localStorage.setItem(SAVED_MENUS_KEY, JSON.stringify(savedMenus)); }, [hydrated, savedMenus]);
  useEffect(() => { if (hydrated) localStorage.setItem(SCANNED_FOODS_KEY, JSON.stringify(scannedFoods)); }, [hydrated, scannedFoods]);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return undefined;
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker не зарегистрирован", error);
    });
    return undefined;
  }, []);

  useEffect(() => {
    const detectStandalone = () => {
      const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
      setIsStandalone(Boolean(standalone));
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    detectStandalone();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.matchMedia?.("(display-mode: standalone)")?.addEventListener?.("change", detectStandalone);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.matchMedia?.("(display-mode: standalone)")?.removeEventListener?.("change", detectStandalone);
    };
  }, []);


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

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("newPassword");
        setAuthMessage("Введи новый пароль для аккаунта Gym Helper.");
      }
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
    if (!hydrated) return undefined;

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
        const lastAuthUserId = localStorage.getItem(LAST_AUTH_USER_KEY);
        const shouldMergeLocal = hasLocalDataRef.current && (!lastAuthUserId || lastAuthUserId === session.user.id);
        const nextState = data?.state
          ? shouldMergeLocal ? mergeAppStates(data.state, localState, true) : createAppState(data.state)
          : shouldMergeLocal ? localState : createAppState({});

        if (data?.updated_at) lastCloudUpdatedAtRef.current = data.updated_at;
        skipCloudSaveRef.current = true;
        applyAppState(nextState);
        window.clearTimeout(remoteApplyTimerRef.current);
        remoteApplyTimerRef.current = window.setTimeout(() => { skipCloudSaveRef.current = false; }, 500);
        const savedRow = await saveCloudState(session.user.id, nextState);
        if (savedRow?.updated_at) lastCloudUpdatedAtRef.current = savedRow.updated_at;

        if (!cancelled) {
          localStorage.setItem(LAST_AUTH_USER_KEY, session.user.id);
          hasLocalDataRef.current = true;
          setCloudLoaded(true);
          setCloudStatus(data?.state ? "Облако подключено · данные синхронизированы" : "Облако подключено · данные сохранены");
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
  }, [session?.user?.id, hydrated]);

  useEffect(() => {
    if (!supabase || !session?.user?.id || !cloudLoaded || skipCloudSaveRef.current) return undefined;

    const timeout = window.setTimeout(async () => {
      try {
        setCloudStatus("Сохраняю изменения...");
        const savedRow = await saveCloudState(session.user.id, appStateRef.current);
        if (savedRow?.updated_at) lastCloudUpdatedAtRef.current = savedRow.updated_at;
        setCloudStatus("Сохранено в облаке");
      } catch (error) {
        setCloudStatus(`Ошибка сохранения: ${error.message}`);
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [session?.user?.id, cloudLoaded, entries, profile, weightLog, nutritionEntries, favoriteFoods, savedMenus, scannedFoods]);

  useEffect(() => {
    if (!supabase || !session?.user?.id || !cloudLoaded) return undefined;

    const channel = supabase
      .channel(`app-state-realtime-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: CLOUD_TABLE,
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row?.state) return;

          const remoteUpdatedAt = row.updated_at || "";
          if (remoteUpdatedAt && lastCloudUpdatedAtRef.current) {
            const remoteTime = new Date(remoteUpdatedAt).getTime();
            const knownTime = new Date(lastCloudUpdatedAtRef.current).getTime();
            if (Number.isFinite(remoteTime) && Number.isFinite(knownTime) && remoteTime <= knownTime) return;
          }

          if (remoteUpdatedAt) lastCloudUpdatedAtRef.current = remoteUpdatedAt;
          skipCloudSaveRef.current = true;
          applyAppState(row.state);
          setCloudStatus("Обновлено с другого устройства");
          window.clearTimeout(remoteApplyTimerRef.current);
          remoteApplyTimerRef.current = window.setTimeout(() => {
            skipCloudSaveRef.current = false;
          }, 700);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setCloudStatus("Автообновление включено");
      });

    const refreshOnFocus = async () => {
      if (document.hidden) return;
      try {
        const { data, error } = await supabase
          .from(CLOUD_TABLE)
          .select("state, updated_at")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (error || !data?.state) return;
        if (data.updated_at && lastCloudUpdatedAtRef.current) {
          const remoteTime = new Date(data.updated_at).getTime();
          const knownTime = new Date(lastCloudUpdatedAtRef.current).getTime();
          if (Number.isFinite(remoteTime) && Number.isFinite(knownTime) && remoteTime <= knownTime) return;
        }
        if (data.updated_at) lastCloudUpdatedAtRef.current = data.updated_at;
        skipCloudSaveRef.current = true;
        applyAppState(data.state);
        setCloudStatus("Данные обновлены после возврата в приложение");
        window.clearTimeout(remoteApplyTimerRef.current);
        remoteApplyTimerRef.current = window.setTimeout(() => { skipCloudSaveRef.current = false; }, 700);
      } catch (error) {
        console.warn("Не удалось обновить данные при возврате", error);
      }
    };

    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      document.removeEventListener("visibilitychange", refreshOnFocus);
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, cloudLoaded]);

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
  const previousExerciseEntry = useMemo(() => {
    const name = normalize(workoutForm.name);
    if (workoutForm.type !== "strength" || !name) return null;
    return entries
      .filter((entry) => entry.type !== "cardio" && normalize(entry.name) === name && entry.date !== selectedDate)
      .sort((a, b) => (b.date.localeCompare(a.date) || numeric(b.createdAt) - numeric(a.createdAt)))[0] || null;
  }, [entries, selectedDate, workoutForm.name, workoutForm.type]);
  const estimatedWorkoutCalories = calculateExerciseCalories({
    met: selectedIntensity?.met,
    weightKg: profile.weightKg,
    minutes: workoutForm.duration,
  });

  const suggestions = useMemo(() => {
    const value = normalize(workoutForm.name);
    const source = workoutForm.type === "cardio" ? cardioNames : exerciseNames;
    if (!value) return source;
    return source.filter((name) => normalize(name).includes(value));
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

  const commonFoodDatabase = useMemo(() => {
    const map = new Map();
    [...scannedFoods, ...foodDatabase].forEach((food) => {
      if (!food?.name) return;
      const id = food.id || `food-${normalize(food.name)}`;
      if (!map.has(id)) map.set(id, { ...food, id });
    });
    return Array.from(map.values());
  }, [scannedFoods]);

  const selectedFood = commonFoodDatabase.find((item) => item.id === foodForm.foodId) || commonFoodDatabase[0] || foodDatabase[0];
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

  const weekSummary = useMemo(() => calculateWeekSummary({
    selectedDate,
    entries,
    nutritionEntries,
    weightLog,
    nutritionPlan,
  }), [selectedDate, entries, nutritionEntries, weightLog, nutritionPlan]);



  function applyAppState(state) {
    if (!state) return;
    setEntries(Array.isArray(state.entries) ? state.entries : []);
    setProfile({ ...defaultProfile, ...(state.profile || {}) });
    setWeightLog(Array.isArray(state.weightLog) ? state.weightLog : []);
    setNutritionEntries(Array.isArray(state.nutritionEntries) ? state.nutritionEntries : []);
    setFavoriteFoods(Array.isArray(state.favoriteFoods) ? state.favoriteFoods : []);
    setSavedMenus(Array.isArray(state.savedMenus) ? state.savedMenus : []);
    setScannedFoods(Array.isArray(state.scannedFoods) ? state.scannedFoods : []);
  }

  async function saveCloudState(userId, state) {
    if (!supabase || !userId) return;
    const { data, error } = await supabase.from(CLOUD_TABLE).upsert(
      {
        user_id: userId,
        state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    ).select("updated_at").single();
    if (error) throw error;
    return data;
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    if (!supabase) {
      setAuthMessage("Supabase не подключен: добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.");
      return;
    }

    const email = authEmail.trim();
    const password = authPassword;
    setAuthLoading(true);
    setAuthMessage("");

    try {
      if (authMode === "reset") {
        if (!email) {
          setAuthMessage("Введи email, на который зарегистрирован аккаунт.");
          return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setAuthMessage("Отправили письмо для восстановления пароля. Проверь почту и папку Спам.");
        return;
      }

      if (authMode === "newPassword") {
        if (password.length < 6) {
          setAuthMessage("Новый пароль должен быть минимум 6 символов.");
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setAuthPassword("");
        setAuthMode("signin");
        setAuthMessage("Пароль обновлен. Можно продолжать пользоваться Gym Helper.");
        return;
      }

      if (!email || password.length < 6) {
        setAuthMessage("Введи email и пароль минимум 6 символов.");
        return;
      }

      const result = authMode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      setAuthMessage(authMode === "signup" ? "Аккаунт создан. Проверь письмо от Gym Helper и подтверди email, если подтверждение включено в Supabase." : "Вход выполнен.");
      setAuthPassword("");
    } catch (error) {
      setAuthMessage(error.message || "Не удалось выполнить действие.");
    } finally {
      setAuthLoading(false);
    }
  }

  function clearLocalAppData() {
    [
      WORKOUT_KEY,
      OLD_WORKOUT_KEY,
      OLD_SETTINGS_KEY,
      PROFILE_KEY,
      WEIGHT_LOG_KEY,
      NUTRITION_KEY,
      FAVORITE_FOODS_KEY,
      SAVED_MENUS_KEY,
      SCANNED_FOODS_KEY,
      LAST_AUTH_USER_KEY,
    ].forEach((key) => localStorage.removeItem(key));
    hasLocalDataRef.current = false;
    applyAppState(createAppState({}));
  }

  async function handleSignOut() {
    if (!supabase) return;
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setCloudLoaded(false);
      clearLocalAppData();
      setCloudStatus("Вы вышли. Локальные данные очищены, облачные данные аккаунта сохранены.");
    } catch (error) {
      setAuthMessage(error.message || "Не удалось выйти.");
    } finally {
      setAuthLoading(false);
    }
  }

  function exportBackupJson() {
    const state = createAppState(appStateRef.current || {});
    downloadTextFile(
      `gym-helper-backup-${fileDateStamp()}.json`,
      JSON.stringify(state, null, 2),
      "application/json;charset=utf-8"
    );
  }

  function exportWorkoutsCsv() {
    const rows = entries
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || numeric(b.createdAt) - numeric(a.createdAt))
      .map((entry) => {
        const setRows = getStrengthSetRows(entry);
        return [
          entry.date || "",
          formatShortDate(entry.date),
          entry.type === "cardio" ? "Кардио" : "Силовая",
          entry.name || "",
          entry.type === "cardio" ? "" : formatStrengthSummary(entry),
          entry.type === "cardio" ? numeric(entry.duration) : numeric(entry.sets),
          entry.type === "cardio" ? numeric(entry.distance) : numeric(entry.reps),
          entry.type === "cardio" ? "" : numeric(entry.weight),
          entry.type === "cardio" ? numeric(entry.calories) : volume(entry),
          setRows.length ? setRows.map((row, index) => `${index + 1}) ${row.reps}x${row.weight}`).join(" | ") : "",
          entry.note || "",
        ];
      });
    downloadTextFile(
      `gym-helper-workouts-${fileDateStamp()}.csv`,
      "\ufeff" + toCsv(["Дата ISO", "Дата", "Тип", "Упражнение", "Итог", "Подходы/мин", "Повторы/км", "Вес", "Объем/ккал", "Подходы подробно", "Заметка"], rows),
      "text/csv;charset=utf-8"
    );
  }

  function exportNutritionCsv() {
    const rows = nutritionEntries
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || numeric(b.createdAt) - numeric(a.createdAt))
      .map((item) => {
        const meal = meals.find((mealItem) => mealItem.id === item.meal);
        return [
          item.date || "",
          formatShortDate(item.date),
          meal?.label || item.meal || "",
          item.name || "",
          numeric(item.grams),
          numeric(item.total?.calories),
          numeric(item.total?.protein),
          numeric(item.total?.fat),
          numeric(item.total?.carbs),
          item.source || "",
        ];
      });
    downloadTextFile(
      `gym-helper-nutrition-${fileDateStamp()}.csv`,
      "\ufeff" + toCsv(["Дата ISO", "Дата", "Прием пищи", "Продукт", "Граммы", "Ккал", "Белки", "Жиры", "Углеводы", "Источник"], rows),
      "text/csv;charset=utf-8"
    );
  }

  function exportWeightCsv() {
    const rows = weightLog
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .map((item) => [item.date || "", formatShortDate(item.date), item.weightKg || ""]);
    downloadTextFile(
      `gym-helper-weight-${fileDateStamp()}.csv`,
      "\ufeff" + toCsv(["Дата ISO", "Дата", "Вес, кг"], rows),
      "text/csv;charset=utf-8"
    );
  }

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function saveProfile(nextProfile) {
    setProfile({ ...defaultProfile, ...(nextProfile || {}) });
  }

  function setWorkoutField(field, value) {
    setWorkoutForm((current) => ({ ...current, [field]: value }));
  }

  function setWorkoutSetMode(mode) {
    setWorkoutForm((current) => ({
      ...current,
      setMode: mode,
      setRows: mode === "detailed" && (!Array.isArray(current.setRows) || !current.setRows.length)
        ? makeDefaultSetRows(current.sets, current.reps, current.weight)
        : current.setRows,
    }));
  }

  function fillWorkoutSetsFromSummary() {
    setWorkoutForm((current) => ({
      ...current,
      setMode: "detailed",
      setRows: makeDefaultSetRows(current.sets, current.reps, current.weight),
    }));
  }

  function updateWorkoutSetRow(index, field, value) {
    setWorkoutForm((current) => {
      const rows = Array.isArray(current.setRows) && current.setRows.length
        ? current.setRows
        : makeDefaultSetRows(current.sets, current.reps, current.weight);
      return {
        ...current,
        setRows: rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row),
      };
    });
  }

  function addWorkoutSetRow() {
    setWorkoutForm((current) => {
      const rows = Array.isArray(current.setRows) && current.setRows.length
        ? current.setRows
        : makeDefaultSetRows(current.sets, current.reps, current.weight);
      const last = rows[rows.length - 1] || { reps: current.reps, weight: current.weight };
      return {
        ...current,
        setMode: "detailed",
        setRows: [...rows, { id: uid(), order: rows.length + 1, reps: last.reps || current.reps || "", weight: last.weight ?? current.weight ?? "" }].slice(0, 12),
      };
    });
  }

  function removeWorkoutSetRow(index) {
    setWorkoutForm((current) => {
      const rows = (Array.isArray(current.setRows) ? current.setRows : []).filter((_, rowIndex) => rowIndex !== index);
      return { ...current, setRows: rows.length ? rows : makeDefaultSetRows(1, current.reps, current.weight) };
    });
  }

  function applyPreviousExerciseResult(entry) {
    if (!entry) return;
    const rows = getStrengthSetRows(entry);
    if (rows.length) {
      setWorkoutForm((current) => ({
        ...current,
        name: entry.name,
        sets: String(rows.length),
        reps: rows.length && rows.every((row) => row.reps === rows[0].reps) ? String(rows[0].reps) : current.reps,
        weight: rows.length && rows.every((row) => numeric(row.weight) === numeric(rows[0].weight)) ? String(rows[0].weight || "") : current.weight,
        setMode: "detailed",
        setRows: rows.map((row, index) => ({ id: uid(), order: index + 1, reps: String(row.reps || ""), weight: row.weight === "" ? "" : String(row.weight) })),
      }));
    } else {
      setWorkoutForm((current) => ({
        ...current,
        name: entry.name,
        sets: String(entry.sets || current.sets),
        reps: String(entry.reps || current.reps),
        weight: entry.weight === "" || entry.weight === undefined ? "" : String(entry.weight),
        setMode: "summary",
      }));
    }
  }

  function startEditWorkoutEntry(entry) {
    if (!entry) return;
    setSelectedDate(entry.date || selectedDate);
    setEditingWorkoutId(entry.id);
    setTab("training");
    if (entry.type === "cardio") {
      setWorkoutForm({
        ...emptyWorkoutForm(),
        type: "cardio",
        name: entry.name || "",
        duration: String(entry.duration || ""),
        intensityId: entry.intensityId || "",
        distance: entry.distance === undefined || entry.distance === "" ? "" : String(entry.distance),
        calories: entry.calories === undefined || entry.calories === "" ? "" : String(entry.calories),
        note: entry.note || "",
      });
    } else {
      const rows = getStrengthSetRows(entry);
      setWorkoutForm({
        ...emptyWorkoutForm(),
        type: "strength",
        name: entry.name || "",
        sets: String(entry.sets || rows.length || 3),
        reps: entry.reps === "" || entry.reps === undefined ? "" : String(entry.reps),
        weight: entry.weight === "" || entry.weight === undefined ? "" : String(entry.weight),
        setMode: rows.length ? "detailed" : "summary",
        setRows: rows.length ? rows.map((row, index) => ({ id: uid(), order: index + 1, reps: String(row.reps || ""), weight: row.weight === "" || row.weight === undefined ? "" : String(row.weight) })) : [],
        note: entry.note || "",
      });
    }
    setShowSuggestions(false);
  }

  function cancelWorkoutEdit() {
    setEditingWorkoutId("");
    setWorkoutForm(emptyWorkoutForm());
    setShowSuggestions(false);
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
    const rows = makeDefaultSetRows(item.sets, item.reps, item.weight).map((row) => ({
      ...row,
      reps: numeric(row.reps),
      weight: row.weight === "" ? "" : numeric(row.weight),
    }));
    return {
      id: uid(),
      date: selectedDate,
      type: "strength",
      name: item.name,
      sets: numeric(item.sets),
      reps: numeric(item.reps),
      weight: item.weight === "" ? "" : numeric(item.weight),
      setRows: rows,
      note: "Из шаблона",
      createdAt: Date.now() + index,
    };
  }

  function applyTemplate(template) {
    const generated = template.items.map((item, index) => makeWorkoutEntryFromTemplate(item, index));
    setEntries((current) => [...generated, ...current]);
    setTab("training");
  }

  function buildWorkoutEntryFromForm(existingEntry = null) {
    const name = workoutForm.name.trim();
    if (!name) return null;

    if (workoutForm.type === "cardio") {
      const profileForEntry = getCardioProfile(name) || activeCardioProfile;
      const intensity = getIntensity(profileForEntry, workoutForm.intensityId);
      const minutes = numeric(workoutForm.duration);
      const calories = numeric(workoutForm.calories) || calculateExerciseCalories({ met: intensity?.met, weightKg: profile.weightKg, minutes });
      if (minutes <= 0) return null;

      return {
        ...(existingEntry || {}),
        id: existingEntry?.id || uid(),
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
        createdAt: existingEntry?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
    }

    if (workoutForm.setMode === "detailed") {
      const rows = normalizeWorkoutSetRows(workoutForm.setRows);
      if (!rows.length) return null;
      const sameReps = rows.every((row) => row.reps === rows[0].reps);
      const sameWeight = rows.every((row) => numeric(row.weight) === numeric(rows[0].weight));
      return {
        ...(existingEntry || {}),
        id: existingEntry?.id || uid(),
        date: selectedDate,
        type: "strength",
        name,
        sets: rows.length,
        reps: sameReps ? rows[0].reps : "",
        weight: sameWeight ? rows[0].weight : "",
        setRows: rows,
        note: workoutForm.note.trim(),
        createdAt: existingEntry?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
    }

    const sets = numeric(workoutForm.sets);
    const reps = numeric(workoutForm.reps);
    if (sets <= 0 || reps <= 0) return null;
    const weight = workoutForm.weight === "" ? "" : numeric(workoutForm.weight);
    return {
      ...(existingEntry || {}),
      id: existingEntry?.id || uid(),
      date: selectedDate,
      type: "strength",
      name,
      sets,
      reps,
      weight,
      setRows: makeDefaultSetRows(sets, reps, weight).map((row) => ({ ...row, reps: numeric(row.reps), weight: row.weight === "" ? "" : numeric(row.weight) })),
      note: workoutForm.note.trim(),
      createdAt: existingEntry?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  }

  function addWorkoutEntry(event) {
    event.preventDefault();
    const existingEntry = editingWorkoutId ? entries.find((entry) => entry.id === editingWorkoutId) : null;
    const workoutEntry = buildWorkoutEntryFromForm(existingEntry);
    if (!workoutEntry) return;

    setEntries((current) => {
      if (editingWorkoutId) {
        return current.map((entry) => entry.id === editingWorkoutId ? workoutEntry : entry);
      }
      return [workoutEntry, ...current];
    });

    setEditingWorkoutId("");
    setWorkoutForm({ ...emptyWorkoutForm(), type: workoutForm.type, name: workoutEntry.name });
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
    const food = commonFoodDatabase.find((item) => item.id === foodId) || foodDatabase[0];
    setFoodForm((current) => ({
      ...current,
      foodId,
      name: "",
      calories: String(food.calories),
      protein: String(food.protein),
      fat: String(food.fat),
      carbs: String(food.carbs),
      grams: String(food.defaultGrams || current.grams || 100),
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

  function saveCurrentFoodToGeneralList() {
    const food = foodSource;
    if (!food?.name || !numeric(food.calories)) return;
    const saved = saveFoodToGeneralList(food, foodForm.grams, { source: "manual" });
    if (!saved) return;
    setFoodForm((current) => ({
      ...current,
      foodId: saved.id,
      name: "",
      calories: String(saved.calories),
      protein: String(saved.protein),
      fat: String(saved.fat),
      carbs: String(saved.carbs),
      grams: String(saved.defaultGrams || current.grams || 100),
    }));
  }

  function deleteFavoriteFood(id) {
    setFavoriteFoods((current) => current.filter((item) => item.id !== id));
  }

  function deleteScannedFood(id) {
    setScannedFoods((current) => current.filter((item) => item.id !== id));
    setFoodForm((current) => {
      if (current.foodId !== id) return current;
      const fallback = foodDatabase[0];
      return {
        ...current,
        foodId: fallback.id,
        name: "",
        calories: String(fallback.calories),
        protein: String(fallback.protein),
        fat: String(fallback.fat),
        carbs: String(fallback.carbs),
        grams: String(fallback.defaultGrams || current.grams || 100),
      };
    });
  }

  function updateScannedFood(id, values) {
    const name = String(values?.name || "").trim();
    const calories = numeric(values?.calories);
    if (!id || !name || !calories) return;

    const updatedFood = {
      id,
      source: values.source || "manual",
      code: values.code || "",
      name,
      calories,
      protein: numeric(values.protein),
      fat: numeric(values.fat),
      carbs: numeric(values.carbs),
      defaultGrams: numeric(values.defaultGrams, 100),
      updatedAt: Date.now(),
    };

    setScannedFoods((current) => current.map((item) => (
      item.id === id ? { ...item, ...updatedFood, createdAt: item.createdAt || Date.now() } : item
    )));

    setFoodForm((current) => {
      if (current.foodId !== id) return current;
      return {
        ...current,
        name: "",
        calories: String(updatedFood.calories),
        protein: String(updatedFood.protein),
        fat: String(updatedFood.fat),
        carbs: String(updatedFood.carbs),
        grams: String(updatedFood.defaultGrams || current.grams || 100),
      };
    });
  }

  function isSavedUserFood(id) {
    return scannedFoods.some((item) => item.id === id);
  }

  function saveFoodToGeneralList(food, grams = 100, meta = {}) {
    if (!food?.name || !numeric(food.calories)) return null;
    const manualSlug = normalize(food.name).replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-|-$/g, "");
    const id = meta.id || (meta.code ? `scan-${meta.code}` : `manual-${manualSlug || uid()}`);
    const saved = {
      id,
      code: meta.code || "",
      source: meta.source || "manual",
      name: food.name,
      calories: numeric(food.calories),
      protein: numeric(food.protein),
      fat: numeric(food.fat),
      carbs: numeric(food.carbs),
      defaultGrams: numeric(grams, 100),
      createdAt: Date.now(),
    };
    setScannedFoods((current) => {
      const withoutSame = current.filter((item) => item.id !== id && normalize(item.name) !== normalize(saved.name) && (!saved.code || item.code !== saved.code));
      return [saved, ...withoutSame].slice(0, 100);
    });
    return saved;
  }

  function addNutritionEntry(event) {
    event?.preventDefault?.();
    const food = foodSource;
    const grams = numeric(foodForm.grams);
    if (!food.name || grams <= 0) return;

    const total = calculateFoodAmount(food, grams);
    if (foodForm.name.trim() && !editingNutritionId) {
      saveFoodToGeneralList(food, grams, { source: "manual" });
    }

    const existingEntry = editingNutritionId ? nutritionEntries.find((item) => item.id === editingNutritionId) : null;
    const nextEntry = {
      ...(existingEntry || {}),
      id: existingEntry?.id || uid(),
      date: selectedDate,
      meal: foodForm.meal,
      name: food.name,
      grams,
      per100: { calories: numeric(food.calories), protein: numeric(food.protein), fat: numeric(food.fat), carbs: numeric(food.carbs) },
      total,
      createdAt: existingEntry?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    setNutritionEntries((current) => {
      if (editingNutritionId) {
        return current.map((item) => item.id === editingNutritionId ? nextEntry : item);
      }
      return [nextEntry, ...current];
    });
    setEditingNutritionId("");
    setFoodForm(emptyFoodForm());
    setScanner((current) => current.product?.name ? { ...current, product: null, message: `${editingNutritionId ? "Обновлено" : "Добавлено"}: ${food.name}` } : current);
  }

  function deleteNutritionEntry(id) {
    setNutritionEntries((current) => current.filter((item) => item.id !== id));
    if (editingNutritionId === id) cancelNutritionEdit();
  }

  function startEditNutritionEntry(item) {
    if (!item) return;
    setSelectedDate(item.date || selectedDate);
    setEditingNutritionId(item.id);
    setTab("nutrition");
    setFoodForm({
      ...emptyFoodForm(),
      meal: item.meal || "breakfast",
      name: item.name || "",
      foodId: "",
      grams: item.grams === undefined || item.grams === "" ? "100" : String(item.grams),
      calories: String(item.per100?.calories ?? ""),
      protein: String(item.per100?.protein ?? ""),
      fat: String(item.per100?.fat ?? ""),
      carbs: String(item.per100?.carbs ?? ""),
    });
  }

  function cancelNutritionEdit() {
    setEditingNutritionId("");
    setFoodForm(emptyFoodForm());
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

  function createSavedMenu(title, items) {
    if (!Array.isArray(items) || !items.length) return;
    const normalizedItems = items.map((item) => ({
      meal: item.meal,
      name: item.name,
      grams: numeric(item.grams),
      per100: item.per100,
    })).filter((item) => item.name && item.grams > 0 && item.per100);
    if (!normalizedItems.length) return;
    const calories = normalizedItems.reduce((sum, item) => sum + calculateFoodAmount(item.per100, item.grams).calories, 0);
    const saved = {
      id: uid(),
      title: title?.trim() || `Меню ${formatShortDate(selectedDate)}`,
      items: normalizedItems,
      calories: Math.round(calories),
      createdAt: Date.now(),
    };
    setSavedMenus((current) => [saved, ...current.filter((menu) => normalize(menu.title) !== normalize(saved.title))].slice(0, 20));
  }

  function saveDayAsMenu(titleOverride) {
    if (!dayNutrition.daily.length) return;
    createSavedMenu(titleOverride || `Меню ${formatShortDate(selectedDate)}`, dayNutrition.daily);
  }

  function createCustomMenu(title, items) {
    createSavedMenu(title, items);
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
    if (hasMacros) {
      saveFoodToGeneralList(
        { name, calories: per100.calories, protein: per100.protein, fat: per100.fat, carbs: per100.carbs },
        servingGrams || 100,
        { code, source: "scan" }
      );
    }
    setScanner({
      active: false,
      message: hasMacros
        ? `Найдено: ${name}. КБЖУ заполнены на 100 г — проверь граммы и нажми «Добавить».`
        : `Найдено: ${name}, но в базе нет полного КБЖУ. Введи данные с этикетки вручную.`,
      product: { code, name, per100, defaultGrams: servingGrams || 100 },
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

  async function installApp() {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch (error) {
      console.warn("Не удалось открыть установку приложения", error);
    } finally {
      setInstallPrompt(null);
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
              weekSummary={weekSummary}
              setTab={setTab}
              addSampleMenu={addSampleMenu}
              startRestTimer={startRestTimer}
              installPrompt={installPrompt}
              isStandalone={isStandalone}
              installApp={installApp}
            />
          )}

          {tab === "training" && (
            <section className="screen stack">
              <DateCard selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

              <details className="card stack template-details">
                <summary>
                  <span>
                    <strong>Таймер отдыха</strong>
                    <small>Круговой циферблат и быстрые паузы</small>
                  </span>
                  <Timer className="muted-icon" />
                </summary>
                <RestTimerCard restTimer={restTimer} setRestTimer={setRestTimer} startRestTimer={startRestTimer} pauseRestTimer={pauseRestTimer} resetRestTimer={resetRestTimer} />
              </details>

              <details className="card stack template-details">
                <summary>
                  <span>
                    <strong>Шаблоны тренировок</strong>
                    <small>Готовые планы на выбранную дату</small>
                  </span>
                  <ClipboardList className="muted-icon" />
                </summary>
                <div className="template-grid">
                  {workoutTemplates.map((template) => (
                    <button key={template.id} type="button" className="template-card" onClick={() => applyTemplate(template)}>
                      <strong>{template.name}</strong>
                      <span>{template.detail}</span>
                    </button>
                  ))}
                </div>
              </details>

              <details className="card stack template-details" open={editingWorkoutId ? true : undefined}>
                <summary>
                  <span>
                    <strong>{editingWorkoutId ? "Редактировать упражнение" : "Добавить упражнение"}</strong>
                    <small>Силовые и кардио сохраняются в одном дневнике</small>
                  </span>
                  <Dumbbell className="muted-icon" />
                </summary>
                <form onSubmit={addWorkoutEntry} className="stack collapsible-form">
                  <div className="form-topline">
                    <span className="hint">{editingWorkoutId ? "Измени поля и сохрани запись." : "Выбери тип упражнения и заполни параметры."}</span>
                    <button type="button" className="tiny-link" onClick={editingWorkoutId ? cancelWorkoutEdit : () => setWorkoutForm(emptyWorkoutForm())}>{editingWorkoutId ? "Отмена" : "Очистить"}</button>
                  </div>

                  {editingWorkoutId && (
                    <div className="edit-mode-banner">
                      <Pencil size={17} />
                      <span>Режим редактирования: после сохранения старая запись будет обновлена.</span>
                    </div>
                  )}

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
                      <div className="dropdown exercise-dropdown">
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

                      {previousExerciseEntry && (
                        <div className="previous-result-card">
                          <div>
                            <span>Прошлый результат · {formatShortDate(previousExerciseEntry.date)}</span>
                            <strong>{formatStrengthSummary(previousExerciseEntry)}</strong>
                          </div>
                          <button type="button" onClick={() => applyPreviousExerciseResult(previousExerciseEntry)}>Повторить</button>
                        </div>
                      )}

                      <div className="segmented compact-segmented">
                        <button type="button" className={workoutForm.setMode !== "detailed" ? "active" : ""} onClick={() => setWorkoutSetMode("summary")}>Сводно</button>
                        <button type="button" className={workoutForm.setMode === "detailed" ? "active" : ""} onClick={() => setWorkoutSetMode("detailed")}>По подходам</button>
                      </div>

                      {workoutForm.setMode === "detailed" ? (
                        <div className="set-builder">
                          <div className="set-builder-head">
                            <span>Подход</span>
                            <span>Повт.</span>
                            <span>Кг</span>
                            <span />
                          </div>
                          {(workoutForm.setRows || []).map((row, index) => (
                            <div className="set-row" key={row.id || index}>
                              <strong>{index + 1}</strong>
                              <input type="number" inputMode="numeric" min="0" step="1" value={row.reps} onChange={(event) => updateWorkoutSetRow(index, "reps", event.target.value)} aria-label={`Повторы в подходе ${index + 1}`} />
                              <input type="number" inputMode="decimal" min="0" step="any" value={row.weight} onChange={(event) => updateWorkoutSetRow(index, "weight", event.target.value)} aria-label={`Вес в подходе ${index + 1}`} />
                              <button type="button" onClick={() => removeWorkoutSetRow(index)} aria-label="Удалить подход"><Trash2 size={15} /></button>
                            </div>
                          ))}
                          <div className="set-builder-actions">
                            <button type="button" className="secondary-button" onClick={addWorkoutSetRow}><Plus size={17} /> Добавить подход</button>
                            <button type="button" className="tiny-link" onClick={fillWorkoutSetsFromSummary}>Заполнить из сводки</button>
                          </div>
                        </div>
                      ) : (
                        <div className="stack small-gap">
                          <div className="grid-3">
                            <NumberField label="Подходы" value={workoutForm.sets} onChange={(value) => setWorkoutField("sets", value)} />
                            <NumberField label="Повторы" value={workoutForm.reps} onChange={(value) => setWorkoutField("reps", value)} />
                            <NumberField label="Вес, кг" value={workoutForm.weight} onChange={(value) => setWorkoutField("weight", value)} placeholder="0" />
                          </div>
                          <button type="button" className="secondary-button inline-action-button" onClick={fillWorkoutSetsFromSummary}>Разбить на подходы</button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="field">
                    <label>Заметка</label>
                    <textarea value={workoutForm.note} onChange={(event) => setWorkoutField("note", event.target.value)} placeholder="Например: увеличить вес на следующей тренировке" rows={3} />
                  </div>

                  <button className="primary-button" type="submit">{editingWorkoutId ? <Save size={19} /> : <Plus size={19} />} {editingWorkoutId ? "Сохранить изменения" : "Добавить"}</button>
                </form>
              </details>

              <WorkoutList selectedDate={selectedDate} dateEntries={dateEntries} deleteWorkoutEntry={deleteWorkoutEntry} editWorkoutEntry={startEditWorkoutEntry} startRestTimer={startRestTimer} openExerciseInfo={setExerciseInfoName} />
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
              commonFoodDatabase={commonFoodDatabase}
              selectFood={selectFood}
              favoriteFoods={favoriteFoods}
              applyFoodToForm={applyFoodToForm}
              deleteFavoriteFood={deleteFavoriteFood}
              deleteScannedFood={deleteScannedFood}
              updateScannedFood={updateScannedFood}
              isSavedUserFood={isSavedUserFood}
              foodPreview={foodPreview}
              addNutritionEntry={addNutritionEntry}
              editingNutritionId={editingNutritionId}
              cancelNutritionEdit={cancelNutritionEdit}
              saveCurrentFoodAsFavorite={saveCurrentFoodAsFavorite}
              saveCurrentFoodToGeneralList={saveCurrentFoodToGeneralList}
              scanner={scanner}
              videoRef={videoRef}
              startScanner={startScanner}
              stopScanner={stopScanner}
              lookupBarcode={fetchOpenFoodFactsProduct}
              addSampleMenu={addSampleMenu}
              copyYesterdayNutrition={copyYesterdayNutrition}
              saveDayAsMenu={saveDayAsMenu}
              createCustomMenu={createCustomMenu}
              savedMenus={savedMenus}
              applySavedMenu={applySavedMenu}
              deleteSavedMenu={deleteSavedMenu}
              deleteNutritionEntry={deleteNutritionEntry}
              editNutritionEntry={startEditNutritionEntry}
            />
          )}


          {tab === "profile" && (
            <ProfileScreen
              profile={profile}
              updateProfile={updateProfile}
              saveProfile={saveProfile}
              nutritionPlan={nutritionPlan}
              bmi={bmi}
              trend={trend}
              weightForm={weightForm}
              setWeightForm={setWeightForm}
              addWeightRecord={addWeightRecord}
              weightLog={weightLog}
              deleteWeightRecord={deleteWeightRecord}
              dataTools={{
                exportBackupJson,
                exportWorkoutsCsv,
                exportNutritionCsv,
                exportWeightCsv,
              }}
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

function DashboardScreen({ selectedDate, setSelectedDate, profile, nutritionPlan, dayNutrition, dayWorkoutSummary, dateEntries, groupedNutrition, weightLog, weekSummary, setTab, addSampleMenu, startRestTimer, installPrompt, isStandalone, installApp }) {
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

      <WeeklySummaryCard weekSummary={weekSummary} nutritionPlan={nutritionPlan} />

      {!isStandalone && <InstallAppCard installPrompt={installPrompt} installApp={installApp} />}

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

function WeeklySummaryCard({ weekSummary, nutritionPlan }) {
  if (!weekSummary) return null;
  const targetCalories = numeric(nutritionPlan?.targetCalories);
  const maxCalories = Math.max(targetCalories, ...weekSummary.dailyCalories.map((item) => item.calories), 1);
  const weightText = weekSummary.weightChange == null
    ? "нет 2 замеров"
    : `${weekSummary.weightChange > 0 ? "+" : ""}${weekSummary.weightChange} кг`;

  return (
    <div className="card stack week-summary-card">
      <div className="section-head">
        <div>
          <h2>Неделя</h2>
          <p>{formatShortDate(weekSummary.startDate)} — {formatShortDate(weekSummary.endDate)}</p>
        </div>
        <BarChart3 className="muted-icon" />
      </div>

      <div className="week-bars" aria-label="Калории по дням за неделю">
        {weekSummary.dailyCalories.map((item) => (
          <div key={item.date} className="week-bar-item">
            <div className="week-bar-shell">
              <span style={{ height: `${Math.max(4, Math.round((item.calories / maxCalories) * 100))}%` }} />
            </div>
            <em>{formatShortDate(item.date).slice(0, 5)}</em>
          </div>
        ))}
      </div>

      <div className="week-stats-grid">
        <MiniPlainMetric label="Трен. дней" value={weekSummary.workoutDays} />
        <MiniPlainMetric label="Объем" value={`${Math.round(weekSummary.strengthVolume).toLocaleString("ru-RU")} кг`} />
        <MiniPlainMetric label="Сред. ккал" value={weekSummary.avgCalories || "—"} />
        <MiniPlainMetric label="Сред. белок" value={weekSummary.avgProtein ? `${weekSummary.avgProtein} г` : "—"} />
        <MiniPlainMetric label="Кардио" value={`${weekSummary.cardioMinutes} мин`} />
        <MiniPlainMetric label="Вес" value={weightText} />
      </div>

      <p className="hint tight">
        Цель по калориям попала в коридор ±12%: {weekSummary.caloriesTargetHitDays} из {weekSummary.loggedNutritionDays || 0} дней с питанием.
      </p>
    </div>
  );
}

function MiniPlainMetric({ label, value }) {
  return (
    <div className="mini-plain-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InstallAppCard({ installPrompt, installApp }) {
  return (
    <div className="card install-card">
      <div>
        <div className="install-icon"><Smartphone size={20} /></div>
        <h2>Добавить Gym Helper на экран</h2>
        <p>Приложение будет открываться как отдельная иконка, а базовые файлы будут кэшироваться для более быстрого старта.</p>
      </div>
      {installPrompt ? (
        <button type="button" className="primary-button" onClick={installApp}>Установить</button>
      ) : (
        <p className="hint tight">На iPhone: Safari → Поделиться → «На экран Домой». В Chrome/Android кнопка установки появится автоматически, когда браузер разрешит.</p>
      )}
    </div>
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
    <div className="rest-card timer-collapsible-content">
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
          <button key={secondsValue} type="button" className={restTimer.seconds === secondsValue ? "active" : ""} onClick={() => setRestTimer({ seconds: secondsValue, left: secondsValue, running: false })}>{secondsValue}с</button>
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

function WorkoutList({ selectedDate, dateEntries, deleteWorkoutEntry, editWorkoutEntry, startRestTimer, openExerciseInfo }) {
  return (
    <section className="stack">
      <div className="section-head inline">
        <h2>{formatShortDate(selectedDate)}</h2>
        <span className="pill">{dateEntries.length} записей</span>
      </div>
      {dateEntries.length === 0 ? (
        <EmptyState text="За этот день пока нет упражнений." />
      ) : (
        <div className="stack small-gap">
          {dateEntries.map((entry) => <ExerciseCard key={entry.id} entry={entry} onDelete={() => deleteWorkoutEntry(entry.id)} onEdit={() => editWorkoutEntry(entry)} onRest={() => startRestTimer(90)} onInfo={openExerciseInfo} />)}
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
  commonFoodDatabase,
  selectFood,
  favoriteFoods,
  applyFoodToForm,
  deleteFavoriteFood,
  deleteScannedFood,
  updateScannedFood,
  isSavedUserFood,
  foodPreview,
  addNutritionEntry,
  editingNutritionId,
  cancelNutritionEdit,
  saveCurrentFoodAsFavorite,
  saveCurrentFoodToGeneralList,
  scanner,
  videoRef,
  startScanner,
  stopScanner,
  lookupBarcode,
  addSampleMenu,
  copyYesterdayNutrition,
  saveDayAsMenu,
  createCustomMenu,
  savedMenus,
  applySavedMenu,
  deleteSavedMenu,
  deleteNutritionEntry,
  editNutritionEntry,
}) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [quickMenuTitle, setQuickMenuTitle] = useState("");
  const [builderTitle, setBuilderTitle] = useState("");
  const [builderItems, setBuilderItems] = useState([]);
  const [builderForm, setBuilderForm] = useState({ foodId: commonFoodDatabase[0]?.id || "oatmeal", meal: "breakfast", grams: "100" });
  const [foodSearch, setFoodSearch] = useState("");
  const [editingFoodId, setEditingFoodId] = useState("");
  const [editFoodForm, setEditFoodForm] = useState({ name: "", calories: "", protein: "", fat: "", carbs: "", defaultGrams: "100" });

  const builderFood = commonFoodDatabase.find((food) => food.id === builderForm.foodId) || commonFoodDatabase[0] || foodDatabase[0];
  const builderPreview = calculateFoodAmount(builderFood, builderForm.grams);
  const savedUserFoods = commonFoodDatabase.filter((food) => isSavedUserFood(food.id));
  const query = normalize(foodSearch);
  const filteredFoods = useMemo(() => {
    const list = commonFoodDatabase.filter((food) => {
      if (!query) return true;
      return [food.name, food.code, food.source].some((value) => normalize(value).includes(query));
    });
    return list.slice(0, 80);
  }, [commonFoodDatabase, query]);

  function submitManualBarcode() {
    const code = manualBarcode.trim();
    if (!code) return;
    lookupBarcode(code).catch((error) => window.alert(error.message || "Не удалось найти продукт"));
  }

  function setEditField(field, value) {
    setEditFoodForm((current) => ({ ...current, [field]: value }));
  }

  function startEditFood(food) {
    if (!food || !isSavedUserFood(food.id)) return;
    setEditingFoodId(food.id);
    setEditFoodForm({
      name: food.name || "",
      calories: String(food.calories || ""),
      protein: String(food.protein || ""),
      fat: String(food.fat || ""),
      carbs: String(food.carbs || ""),
      defaultGrams: String(food.defaultGrams || 100),
      source: food.source || "manual",
      code: food.code || "",
    });
  }

  function saveEditedFood() {
    updateScannedFood(editingFoodId, editFoodForm);
    setEditingFoodId("");
  }

  function addBuilderItem() {
    const grams = numeric(builderForm.grams);
    if (!builderFood?.name || grams <= 0) return;
    setBuilderItems((current) => [
      ...current,
      {
        id: uid(),
        meal: builderForm.meal,
        name: builderFood.name,
        grams,
        per100: { calories: numeric(builderFood.calories), protein: numeric(builderFood.protein), fat: numeric(builderFood.fat), carbs: numeric(builderFood.carbs) },
      },
    ]);
  }

  function removeBuilderItem(id) {
    setBuilderItems((current) => current.filter((item) => item.id !== id));
  }

  function saveBuilderMenu() {
    if (!builderItems.length) return;
    createCustomMenu(builderTitle || "Мой рацион", builderItems);
    setBuilderTitle("");
    setBuilderItems([]);
  }

  function chooseFood(food) {
    selectFood(food.id);
    setFoodSearch(food.name);
  }

  const selectedFoodSource = selectedFood?.source === "scan" ? "Отсканированный" : selectedFood?.source === "manual" ? "Мой продукт" : "База";
  const selectedIsUserFood = selectedFood && isSavedUserFood(selectedFood.id);

  return (
    <section className="screen stack">
      <DateInline selectedDate={selectedDate} setSelectedDate={setSelectedDate} label="День питания" />

      <div className="card stack">
        <div className="section-head">
          <div>
            <h2>Питание сегодня</h2>
            <p>{dayNutrition.totals.calories} из {nutritionPlan.targetCalories} ккал</p>
          </div>
          <Utensils className="muted-icon" />
        </div>
        <div className="progress-bar"><span style={{ width: `${Math.min(100, (dayNutrition.totals.calories / Math.max(1, nutritionPlan.targetCalories)) * 100)}%` }} /></div>
        <div className="macro-row">
          <MacroChip label="Белки" value={dayNutrition.totals.protein} target={nutritionPlan.protein} />
          <MacroChip label="Жиры" value={dayNutrition.totals.fat} target={nutritionPlan.fat} />
          <MacroChip label="Углеводы" value={dayNutrition.totals.carbs} target={nutritionPlan.carbs} />
        </div>
        <div className="grid-2">
          <button className="secondary-button" type="button" onClick={copyYesterdayNutrition}><Copy size={18} /> Со вчера</button>
          <button className="secondary-button" type="button" onClick={addSampleMenu}><ClipboardList size={18} /> Меню на день</button>
        </div>
      </div>

      <div className="card stack">
        <div className="section-head inline">
          <div>
            <h2>Пресеты меню</h2>
            <p>Сохраняй рационы и применяй их на выбранную дату</p>
          </div>
          <ListPlus className="muted-icon" />
        </div>
        <div className="save-menu-row">
          <input value={quickMenuTitle} onChange={(event) => setQuickMenuTitle(event.target.value)} placeholder={`Например: рацион ${formatShortDate(selectedDate)}`} />
          <button type="button" className="secondary-button" onClick={() => saveDayAsMenu(quickMenuTitle)}><Save size={18} /> Сохранить день</button>
        </div>
        {savedMenus.length === 0 ? <p className="hint">Пока нет сохраненных меню.</p> : (
          <div className="saved-menu-list">
            {savedMenus.map((menu) => (
              <div key={menu.id} className="saved-menu-row">
                <div><strong>{menu.title}</strong><span>{menu.items.length} поз. · {menu.calories} ккал</span></div>
                <button type="button" onClick={() => applySavedMenu(menu)}>Применить</button>
                <button type="button" onClick={() => deleteSavedMenu(menu.id)} aria-label="Удалить меню"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}

        <details className="details-box">
          <summary>Конструктор рациона</summary>
          <div className="stack details-content">
            <div className="field">
              <label>Название пресета</label>
              <input value={builderTitle} onChange={(event) => setBuilderTitle(event.target.value)} placeholder="Например: день на 2200 ккал" />
            </div>
            <div className="grid-3 compact-grid">
              <div className="field">
                <label>Приём пищи</label>
                <select value={builderForm.meal} onChange={(event) => setBuilderForm((current) => ({ ...current, meal: event.target.value }))}>
                  {meals.map((meal) => <option key={meal.id} value={meal.id}>{meal.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Продукт</label>
                <select value={builderForm.foodId} onChange={(event) => setBuilderForm((current) => ({ ...current, foodId: event.target.value }))}>
                  {commonFoodDatabase.map((food) => <option key={food.id} value={food.id}>{food.code ? "📦 " : ""}{food.name}</option>)}
                </select>
              </div>
              <NumberField label="Граммы" value={builderForm.grams} onChange={(value) => setBuilderForm((current) => ({ ...current, grams: value }))} />
            </div>
            <div className="builder-preview-row">
              <span>{builderPreview.calories} ккал · Б {builderPreview.protein} · Ж {builderPreview.fat} · У {builderPreview.carbs}</span>
              <button type="button" className="tiny-link" onClick={addBuilderItem}>Добавить в меню</button>
            </div>
            {builderItems.length > 0 && (
              <div className="builder-items-list">
                {builderItems.map((item) => {
                  const total = calculateFoodAmount(item.per100, item.grams);
                  const mealLabel = meals.find((meal) => meal.id === item.meal)?.label || "Еда";
                  return (
                    <div key={item.id} className="builder-item-row">
                      <div><strong>{item.name}</strong><span>{mealLabel} · {item.grams} г · {total.calories} ккал</span></div>
                      <button type="button" onClick={() => removeBuilderItem(item.id)} aria-label="Удалить из меню"><Trash2 size={15} /></button>
                    </div>
                  );
                })}
              </div>
            )}
            <button type="button" className="primary-button" onClick={saveBuilderMenu} disabled={!builderItems.length}><Save size={18} /> Сохранить пресет</button>
          </div>
        </details>
      </div>

      <details className="card stack template-details" open>
        <summary>
          <span>
            <strong>{editingNutritionId ? "Редактировать продукт в дневнике" : "Добавить продукт"}</strong>
            <small>Поиск, свои продукты, сканер и данные с этикетки</small>
          </span>
          <Apple className="muted-icon" />
        </summary>
        <form onSubmit={addNutritionEntry} className="stack collapsible-form">
          {editingNutritionId && (
            <div className="edit-mode-banner">
              <Pencil size={17} />
              <span>Редактируешь запись питания. Дата, прием пищи и граммы будут обновлены после сохранения.</span>
              <button type="button" className="tiny-link" onClick={cancelNutritionEdit}>Отмена</button>
            </div>
          )}
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

          <div className="food-search-panel">
            <div className="search-box">
              <Search size={18} />
              <input value={foodSearch} onChange={(event) => setFoodSearch(event.target.value)} placeholder="Найти продукт в общем списке" />
            </div>
            <div className="food-results-list">
              {filteredFoods.map((food) => {
                const isActive = selectedFood?.id === food.id;
                const isUserFood = isSavedUserFood(food.id);
                return (
                  <div key={food.id} className={`food-result-row ${isActive ? "active" : ""}`}>
                    <button type="button" onClick={() => chooseFood(food)}>
                      <strong>{food.code ? "📦 " : ""}{food.name}</strong>
                      <span>{food.calories} ккал · Б {food.protein} · Ж {food.fat} · У {food.carbs} на 100 г</span>
                    </button>
                    {isUserFood && (
                      <div className="food-row-actions">
                        <button type="button" onClick={() => startEditFood(food)}>Ред.</button>
                        <button type="button" onClick={() => deleteScannedFood(food.id)} aria-label="Удалить продукт"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {commonFoodDatabase.length > filteredFoods.length && <p className="hint">Показано {filteredFoods.length} из {commonFoodDatabase.length}. Уточни поиск, если продукта не видно.</p>}
          </div>

          {selectedFood && (
            <div className="selected-food-card">
              <div className="selected-food-main">
                <span className="pill">{selectedFoodSource}</span>
                <h3>{selectedFood.name}</h3>
                <p>{selectedFood.calories} ккал · Б {selectedFood.protein} г · Ж {selectedFood.fat} г · У {selectedFood.carbs} г на 100 г</p>
                {selectedFood.defaultGrams && <small>Обычная порция: {selectedFood.defaultGrams} г</small>}
              </div>
              <div className="selected-food-actions">
                {selectedIsUserFood && <button type="button" onClick={() => startEditFood(selectedFood)}>Редактировать</button>}
                {selectedIsUserFood && <button type="button" className="danger-text-button" onClick={() => deleteScannedFood(selectedFood.id)}>Удалить</button>}
              </div>
            </div>
          )}

          {editingFoodId && (
            <div className="edit-food-card stack">
              <div className="section-head inline">
                <div>
                  <h3>Редактировать продукт</h3>
                  <p>Изменения сохранятся в общем списке продуктов</p>
                </div>
                <button type="button" className="tiny-link" onClick={() => setEditingFoodId("")}>Закрыть</button>
              </div>
              <div className="field">
                <label>Название</label>
                <input value={editFoodForm.name} onChange={(event) => setEditField("name", event.target.value)} />
              </div>
              <div className="grid-4 compact-grid">
                <NumberField label="Ккал/100г" value={editFoodForm.calories} onChange={(value) => setEditField("calories", value)} />
                <NumberField label="Б/100г" value={editFoodForm.protein} onChange={(value) => setEditField("protein", value)} />
                <NumberField label="Ж/100г" value={editFoodForm.fat} onChange={(value) => setEditField("fat", value)} />
                <NumberField label="У/100г" value={editFoodForm.carbs} onChange={(value) => setEditField("carbs", value)} />
              </div>
              <NumberField label="Порция по умолчанию, г" value={editFoodForm.defaultGrams} onChange={(value) => setEditField("defaultGrams", value)} />
              <button type="button" className="primary-button" onClick={saveEditedFood}><Save size={18} /> Сохранить продукт</button>
            </div>
          )}

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
              <button className="secondary-button" type="button" onClick={saveCurrentFoodToGeneralList}><Save size={18} /> Сохранить в общий список</button>
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
            <button className="primary-button" type="submit">{editingNutritionId ? <Save size={19} /> : <Plus size={19} />} {editingNutritionId ? "Сохранить" : "Добавить"}</button>
            <button className="secondary-button" type="button" onClick={saveCurrentFoodAsFavorite}><Star size={18} /> В избранное</button>
          </div>
        </form>
      </details>

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
              <small>Проверь граммовку и прием пищи перед добавлением.</small>
            </div>
            <div className="scanner-add-grid">
              <div className="field">
                <label>Приём пищи</label>
                <select value={foodForm.meal} onChange={(event) => setFoodForm((current) => ({ ...current, meal: event.target.value }))}>
                  {meals.map((meal) => <option key={meal.id} value={meal.id}>{meal.label}</option>)}
                </select>
              </div>
              <NumberField label="Граммы" value={foodForm.grams} onChange={(value) => setFoodForm((current) => ({ ...current, grams: value }))} />
            </div>
            <button type="button" className="primary-button" onClick={() => addNutritionEntry()}><Plus size={18} /> Добавить в дневник</button>
          </div>
        )}
        <p className="hint">В Safari используется fallback через ZXing. Камера работает только на HTTPS или localhost. По фото тарелки точность ограничена: без веса порции приложение не знает реальное количество граммов.</p>
      </div>

      {savedUserFoods.length > 0 && (
        <div className="card stack">
          <div className="section-head inline">
            <div>
              <h2>Мои продукты</h2>
              <p>То, что ты ввел вручную или отсканировал</p>
            </div>
            <span className="pill">{savedUserFoods.length}</span>
          </div>
          <div className="user-food-list">
            {savedUserFoods.map((food) => (
              <div key={food.id} className="user-food-row">
                <button type="button" onClick={() => chooseFood(food)}>
                  <strong>{food.name}</strong>
                  <span>{food.calories} ккал · Б {food.protein} · Ж {food.fat} · У {food.carbs}</span>
                </button>
                <button type="button" onClick={() => startEditFood(food)}>Ред.</button>
                <button type="button" onClick={() => deleteScannedFood(food.id)} aria-label="Удалить"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="stack">
        {meals.map((meal) => {
          const items = groupedNutrition[meal.id] || [];
          return (
            <div key={meal.id} className="card stack small-gap">
              <div className="section-head inline">
                <h2>{meal.label}</h2>
                <span className="pill">{items.reduce((sum, item) => sum + item.total.calories, 0)} ккал</span>
              </div>
              {items.length === 0 ? <p className="hint">Пока пусто.</p> : items.map((item) => <FoodCard key={item.id} item={item} onEdit={() => editNutritionEntry(item)} onDelete={() => deleteNutritionEntry(item.id)} />)}
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

  if (auth.authMode === "newPassword") {
    return (
      <form className="card auth-card stack small-gap" onSubmit={auth.handleAuthSubmit}>
        <div className="section-head inline">
          <div>
            <h2>Новый пароль</h2>
            <p>Задай новый пароль для аккаунта Gym Helper</p>
          </div>
          <UserRound className="muted-icon" />
        </div>
        <div className="field">
          <label>Новый пароль</label>
          <input type="password" value={auth.authPassword} onChange={(event) => auth.setAuthPassword(event.target.value)} placeholder="Минимум 6 символов" autoComplete="new-password" />
        </div>
        <button type="submit" className="primary-button" disabled={auth.authLoading}>{auth.authLoading ? "Сохраняю..." : "Сохранить новый пароль"}</button>
        {auth.authMessage && <p className="hint">{auth.authMessage}</p>}
      </form>
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
        <p className="hint">При выходе данные на этом устройстве очищаются, а облачная копия аккаунта остается.</p>
        <div className="auth-action-row single">
          <button
            type="button"
            className="danger-button"
            onClick={() => {
              if (window.confirm("Выйти из аккаунта? Данные на этом устройстве будут очищены, а облачные данные аккаунта останутся.")) {
                auth.handleSignOut();
              }
            }}
            disabled={auth.authLoading}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    );
  }

  const isReset = auth.authMode === "reset";

  return (
    <form className="card auth-card stack small-gap" onSubmit={auth.handleAuthSubmit}>
      <div className="section-head inline">
        <div>
          <h2>{isReset ? "Восстановление пароля" : "Аккаунт и синхронизация"}</h2>
          <p>{isReset ? "Отправим письмо со ссылкой для смены пароля" : "Войди, чтобы данные были доступны с телефона и компьютера"}</p>
        </div>
        <UserRound className="muted-icon" />
      </div>
      {!isReset && (
        <div className="segmented">
          <button type="button" className={auth.authMode === "signin" ? "active" : ""} onClick={() => auth.setAuthMode("signin")}>Вход</button>
          <button type="button" className={auth.authMode === "signup" ? "active" : ""} onClick={() => auth.setAuthMode("signup")}>Регистрация</button>
        </div>
      )}
      <div className="field">
        <label>Email</label>
        <input type="email" value={auth.authEmail} onChange={(event) => auth.setAuthEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
      </div>
      {!isReset && (
        <div className="field">
          <label>Пароль</label>
          <input type="password" value={auth.authPassword} onChange={(event) => auth.setAuthPassword(event.target.value)} placeholder="Минимум 6 символов" autoComplete={auth.authMode === "signup" ? "new-password" : "current-password"} />
        </div>
      )}
      <button type="submit" className="primary-button" disabled={auth.authLoading}>
        {auth.authLoading ? "Подождите..." : isReset ? "Отправить письмо" : auth.authMode === "signup" ? "Создать аккаунт" : "Войти"}
      </button>
      <div className="auth-links-row">
        {isReset ? (
          <button type="button" className="tiny-link" onClick={() => auth.setAuthMode("signin")}>Вернуться ко входу</button>
        ) : auth.authMode === "signin" ? (
          <button type="button" className="tiny-link" onClick={() => auth.setAuthMode("reset")}>Забыли пароль?</button>
        ) : null}
      </div>
      {auth.authMessage && <p className="hint">{auth.authMessage}</p>}
      <p className="hint">После входа локальные данные объединяются с облаком и дальше сохраняются автоматически.</p>
    </form>
  );
}


function buildWeightInsights(data = [], targetWeight = "", range = "90") {
  const allPoints = [...data]
    .filter((item) => numeric(item.weightKg) > 0 && item.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!allPoints.length) {
    return {
      points: [],
      allPoints: [],
      current: 0,
      start: 0,
      delta: 0,
      days: 0,
      average7: 0,
      toGoal: 0,
      rangeLabel: "—",
    };
  }

  const lastDate = new Date(allPoints[allPoints.length - 1].date + "T12:00:00");
  const rangeDays = range === "all" ? null : Number(range);
  const firstAllowed = rangeDays
    ? new Date(lastDate.getTime() - rangeDays * 24 * 60 * 60 * 1000)
    : null;
  const points = firstAllowed
    ? allPoints.filter((item) => new Date(item.date + "T12:00:00") >= firstAllowed)
    : allPoints;
  const visiblePoints = points.length ? points : allPoints.slice(-1);
  const first = visiblePoints[0];
  const last = visiblePoints[visiblePoints.length - 1];
  const firstTime = new Date(first.date + "T12:00:00").getTime();
  const lastTime = new Date(last.date + "T12:00:00").getTime();
  const days = Math.max(1, Math.round((lastTime - firstTime) / (24 * 60 * 60 * 1000)));
  const recent = allPoints.slice(-7);
  const average7 = recent.reduce((sum, item) => sum + numeric(item.weightKg), 0) / Math.max(1, recent.length);
  const current = numeric(last.weightKg);
  const target = numeric(targetWeight);
  const label = range === "30" ? "30 дней" : range === "90" ? "90 дней" : "всё время";

  return {
    points: visiblePoints,
    allPoints,
    current,
    start: numeric(first.weightKg),
    delta: current - numeric(first.weightKg),
    days,
    average7,
    toGoal: target ? target - current : 0,
    rangeLabel: label,
  };
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

function ProfileScreen({ profile, saveProfile, nutritionPlan, bmi, trend, weightForm, setWeightForm, addWeightRecord, weightLog, deleteWeightRecord, auth, dataTools }) {
  const [editing, setEditing] = useState(false);
  const [draftProfile, setDraftProfile] = useState(profile);
  const [weightRange, setWeightRange] = useState("90");

  useEffect(() => {
    if (!editing) setDraftProfile(profile);
  }, [profile, editing]);

  function updateDraftProfile(field, value) {
    setDraftProfile((current) => ({ ...current, [field]: value }));
  }

  function startEditingProfile() {
    setDraftProfile(profile);
    setEditing(true);
  }

  function cancelProfileEditing() {
    setDraftProfile(profile);
    setEditing(false);
  }

  function submitProfileDraft() {
    saveProfile(draftProfile);
    setEditing(false);
  }
  const activity = activityLevels.find((level) => level.value === profile.activityLevel) || { label: "Не указана", detail: "заполни профиль" };
  const currentWeight = numeric(profile.weightKg);
  const targetWeight = numeric(profile.targetWeightKg);
  const goalDelta = targetWeight && currentWeight ? round(targetWeight - currentWeight, 1) : 0;
  const goalLabel = goalDelta === 0 ? "поддержание" : `${goalDelta > 0 ? "+" : ""}${goalDelta} кг до цели`;
  const sexLabel = profile.sex === "male" ? "мужской" : profile.sex === "female" ? "женский" : "пол не указан";
  const weightInsights = useMemo(
    () => buildWeightInsights(weightLog, profile.targetWeightKg, weightRange),
    [weightLog, profile.targetWeightKg, weightRange]
  );

  return (
    <section className="screen stack">
      <AuthCard auth={auth} />
      <div className={`card profile-hero-card ${editing ? "is-editing" : ""}`}>
        <div className="profile-hero-main">
          <div className="profile-avatar"><UserRound size={28} /></div>
          <div className="profile-title-block">
            <p className="eyebrow">Личный профиль</p>
            <h2>{profile.name?.trim() || "Мой профиль"}</h2>
            <p>{sexLabel} · {profile.age || "—"} лет · {activity.label.toLowerCase()}</p>
          </div>
        </div>

        {!editing ? (
          <>
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
            <button type="button" className="edit-profile-button" onClick={startEditingProfile}><UserRound size={17} /> Редактировать профиль</button>
          </>
        ) : (
          <div className="profile-inline-editor">
            <div className="field">
              <label>Имя</label>
              <input value={draftProfile.name} onChange={(event) => updateDraftProfile("name", event.target.value)} placeholder="Например: Мария" />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Пол</label>
                <select value={draftProfile.sex} onChange={(event) => updateDraftProfile("sex", event.target.value)}>
                  <option value="">Выберите</option>
                  <option value="female">Женский</option>
                  <option value="male">Мужской</option>
                </select>
              </div>
              <NumberField label="Возраст" value={draftProfile.age} onChange={(value) => updateDraftProfile("age", value)} />
            </div>

            <div className="grid-3 profile-number-grid">
              <NumberField label="Рост, см" value={draftProfile.heightCm} onChange={(value) => updateDraftProfile("heightCm", value)} />
              <NumberField label="Вес, кг" value={draftProfile.weightKg} onChange={(value) => updateDraftProfile("weightKg", value)} />
              <NumberField label="Цель, кг" value={draftProfile.targetWeightKg} onChange={(value) => updateDraftProfile("targetWeightKg", value)} />
            </div>

            <div className="field">
              <label>Активность</label>
              <select value={draftProfile.activityLevel} onChange={(event) => updateDraftProfile("activityLevel", event.target.value)}>
                <option value="">Выберите активность</option>
                {activityLevels.map((level) => <option key={level.value} value={level.value}>{level.label} · {level.detail}</option>)}
              </select>
            </div>

            <NumberField label="План изменения веса, кг/нед." value={draftProfile.weeklyChangeKg} onChange={(value) => updateDraftProfile("weeklyChangeKg", value)} />

            <div className="custom-goals-editor">
              <div className="section-head inline">
                <div>
                  <h3>Свои цели по питанию</h3>
                  <p>Оставь поля пустыми, чтобы использовать автоматический расчет</p>
                </div>
                <Target className="muted-icon" />
              </div>
              <div className="grid-4 compact-grid custom-goals-grid">
                <NumberField label="Ккал" value={draftProfile.customCalories} onChange={(value) => updateDraftProfile("customCalories", value)} placeholder={nutritionPlan.autoTargetCalories || nutritionPlan.targetCalories || ""} />
                <NumberField label="Белки, г" value={draftProfile.customProtein} onChange={(value) => updateDraftProfile("customProtein", value)} placeholder={nutritionPlan.autoProtein || nutritionPlan.protein || ""} />
                <NumberField label="Жиры, г" value={draftProfile.customFat} onChange={(value) => updateDraftProfile("customFat", value)} placeholder={nutritionPlan.autoFat || nutritionPlan.fat || ""} />
                <NumberField label="Углев., г" value={draftProfile.customCarbs} onChange={(value) => updateDraftProfile("customCarbs", value)} placeholder={nutritionPlan.autoCarbs || nutritionPlan.carbs || ""} />
              </div>
            </div>

            <div className="profile-editor-actions">
              <button type="button" className="secondary-button" onClick={cancelProfileEditing}><X size={18} /> Отмена</button>
              <button type="button" className="primary-button profile-save-button" onClick={submitProfileDraft}><Save size={18} /> Сохранить</button>
            </div>
          </div>
        )}
      </div>

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
            <p>{nutritionPlan.isCustom ? "Ручная цель на день" : "Автоматический ориентир на день"}</p>
          </div>
          <Apple className="muted-icon" />
        </div>
        <div className="macro-row">
          <MacroChip label="Белки" value={nutritionPlan.protein} unit="г" />
          <MacroChip label="Жиры" value={nutritionPlan.fat} unit="г" />
          <MacroChip label="Углеводы" value={nutritionPlan.carbs} unit="г" />
        </div>
        <p className="hint">Цели можно поменять вручную в режиме редактирования профиля. Это ориентир, не медицинское назначение: при заболеваниях, беременности, РПП или приеме препаратов питание лучше согласовывать со специалистом.</p>
      </div>

      <div className="card stack account-tools-card">
        <div className="section-head">
          <div>
            <h2>Данные и экспорт</h2>
            <p>Скачай резервную копию или CSV-таблицы для Excel/Google Sheets</p>
          </div>
          <Save className="muted-icon" />
        </div>
        <div className="data-actions-grid">
          <button type="button" className="secondary-button" onClick={dataTools?.exportBackupJson}><Save size={17} /> Резервная копия JSON</button>
          <button type="button" className="secondary-button" onClick={dataTools?.exportWorkoutsCsv}><ClipboardList size={17} /> Тренировки CSV</button>
          <button type="button" className="secondary-button" onClick={dataTools?.exportNutritionCsv}><Utensils size={17} /> Питание CSV</button>
          <button type="button" className="secondary-button" onClick={dataTools?.exportWeightCsv}><Weight size={17} /> Вес CSV</button>
        </div>
        <p className="hint">JSON подходит для резервной копии всех данных. CSV удобнее для анализа таблицами. Экспорт не удаляет данные из облака.</p>
      </div>

      <div className="card stack">
        <div className="section-head">
          <div>
            <h2>График веса</h2>
            <p>Числовые даты, периоды и сглаженный тренд</p>
          </div>
          <LineChart className="muted-icon" />
        </div>
        <form onSubmit={addWeightRecord} className="grid-3 align-end weight-form-grid">
          <div className="field">
            <label>Дата</label>
            <input type="date" value={weightForm.date} onChange={(event) => setWeightForm((current) => ({ ...current, date: event.target.value }))} />
          </div>
          <NumberField label="Вес, кг" value={weightForm.weightKg} onChange={(value) => setWeightForm((current) => ({ ...current, weightKg: value }))} placeholder={profile.weightKg} />
          <button className="mini-primary" type="submit"><Plus size={18} /></button>
        </form>

        <div className="range-switch" role="group" aria-label="Период графика веса">
          <button type="button" className={weightRange === "30" ? "active" : ""} onClick={() => setWeightRange("30")}>30д</button>
          <button type="button" className={weightRange === "90" ? "active" : ""} onClick={() => setWeightRange("90")}>90д</button>
          <button type="button" className={weightRange === "all" ? "active" : ""} onClick={() => setWeightRange("all")}>Всё</button>
        </div>

        <div className="weight-insight-grid">
          <div className="weight-insight-card"><span>Сейчас</span><strong>{weightInsights.current ? round(weightInsights.current, 1) : "—"} кг</strong></div>
          <div className="weight-insight-card"><span>{weightInsights.rangeLabel}</span><strong>{weightInsights.delta > 0 ? "+" : ""}{round(weightInsights.delta, 1)} кг</strong></div>
          <div className="weight-insight-card"><span>Среднее 7 замеров</span><strong>{weightInsights.average7 ? round(weightInsights.average7, 1) : "—"} кг</strong></div>
          <div className="weight-insight-card"><span>До цели</span><strong>{weightInsights.toGoal ? `${weightInsights.toGoal > 0 ? "+" : ""}${round(weightInsights.toGoal, 1)} кг` : "—"}</strong></div>
        </div>

        <WeightChart data={weightInsights.points} targetWeight={profile.targetWeightKg} />
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
            <div key={item.id} className="mini-row weight-record-row">
              <span>{formatShortDate(item.date)}</span>
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
  return <DateInline selectedDate={selectedDate} setSelectedDate={setSelectedDate} label="Дата" />;
}

function DateInline({ selectedDate, setSelectedDate, label = "Дата" }) {
  return (
    <div className="card compact-card date-card-row">
      <label className="date-label"><CalendarDays size={18} /> {label}</label>
      <label className="date-picker-shell" aria-label="Выбрать дату">
        <span>{formatShortDate(selectedDate)}</span>
        <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
      </label>
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

function ExerciseCard({ entry, onDelete, onEdit, onRest, onInfo, compact = false }) {
  const isCardio = entry.type === "cardio";
  const currentVolume = volume(entry);
  const exerciseInfo = !isCardio ? getExerciseInfo(entry.name) : null;
  const strengthSummary = !isCardio ? summarizeStrengthEntry(entry) : null;
  return (
    <article className="exercise-card">
      <div className="card-top">
        <div>
          <div className="type-line"><span className={`type-dot ${isCardio ? "cardio" : "strength"}`} />{isCardio ? "Кардио" : "Силовое"}</div>
          <h3>{entry.name}</h3>
          {!compact && entry.note && <p className="entry-note">{entry.note}</p>}
        </div>
        <div className="card-action-row">
          {onEdit && <button onClick={onEdit} className="edit-button" aria-label="Редактировать"><Pencil size={16} /></button>}
          <button onClick={onDelete} className="delete-button" aria-label="Удалить"><Trash2 size={17} /></button>
        </div>
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
          <MiniMetric icon={Dumbbell} label="Подходы" value={strengthSummary.sets || "—"} />
          <MiniMetric icon={Activity} label="Повторы" value={strengthSummary.repsLabel || "—"} />
          <MiniMetric icon={Weight} label="Вес" value={strengthSummary.weightLabel || "—"} />
        </div>
      )}

      {isCardio && entry.intensityLabel && <p className="hint tight">{entry.intensityLabel}</p>}
      {!isCardio && !compact && strengthSummary.rows.length > 0 && (
        <div className="set-log-list">
          {strengthSummary.rows.map((row, index) => (
            <div key={row.id || index}>
              <span>{index + 1}</span>
              <strong>{row.reps} повт.</strong>
              <em>{row.weight ? `${row.weight} кг` : "без веса"}</em>
            </div>
          ))}
        </div>
      )}
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
  const points = [...data].filter((item) => numeric(item.weightKg) > 0 && item.date).sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 2) return <div className="chart-empty">Недостаточно данных для графика</div>;

  const width = 430;
  const height = 250;
  const pad = { top: 34, right: 70, bottom: 62, left: 64 };
  const values = points.map((item) => numeric(item.weightKg));
  const target = numeric(targetWeight);
  const min = Math.min(...values, target || Infinity) - 0.8;
  const max = Math.max(...values, target || -Infinity) + 0.8;
  const firstDate = new Date(points[0].date + "T12:00:00").getTime();
  const lastDate = new Date(points[points.length - 1].date + "T12:00:00").getTime();
  const span = Math.max(1, lastDate - firstDate);
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;

  function xFor(dateString) {
    return pad.left + ((new Date(dateString + "T12:00:00").getTime() - firstDate) / span) * plotWidth;
  }

  function yFor(value) {
    return pad.top + (1 - ((numeric(value) - min) / Math.max(0.1, max - min))) * plotHeight;
  }

  const coords = points.map((item) => ({ x: xFor(item.date), y: yFor(item.weightKg), ...item }));
  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const averagePoints = points.map((item, index) => {
    const currentTime = new Date(item.date + "T12:00:00").getTime();
    const weekAgo = currentTime - 6 * 24 * 60 * 60 * 1000;
    const windowItems = points.slice(0, index + 1).filter((candidate) => {
      const candidateTime = new Date(candidate.date + "T12:00:00").getTime();
      return candidateTime >= weekAgo && candidateTime <= currentTime;
    });
    const average = windowItems.reduce((sum, candidate) => sum + numeric(candidate.weightKg), 0) / Math.max(1, windowItems.length);
    return { x: xFor(item.date), y: yFor(average), date: item.date, value: average };
  });
  const averagePath = averagePoints.length > 1
    ? averagePoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
    : "";
  const targetY = target ? yFor(target) : null;
  const firstLabel = formatShortDate(points[0].date);
  const lastLabel = formatShortDate(points[points.length - 1].date);
  const latest = coords[coords.length - 1];
  const mid = round((min + max) / 2, 1);
  const gridY = [max, mid, min].map((value) => ({ value, y: yFor(value) }));

  return (
    <svg className="weight-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График изменения веса">
      {gridY.map((line) => (
        <g key={line.value}>
          <line x1={pad.left} y1={line.y} x2={width - pad.right} y2={line.y} className="chart-grid-line" />
          <text x={pad.left - 12} y={line.y + 4} textAnchor="end" className="chart-label">{round(line.value, 1)}</text>
        </g>
      ))}
      <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} className="axis" />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} className="axis" />
      {targetY && <line x1={pad.left} y1={targetY} x2={width - pad.right} y2={targetY} className="target-line" />}
      {averagePath && <path d={averagePath} className="weight-average-path" />}
      <path d={path} className="weight-path" />
      {coords.map((point) => <circle key={point.id || point.date} cx={point.x} cy={point.y} r="4" className="weight-point" />)}
      <text x={pad.left} y={height - 24} textAnchor="start" className="chart-date-label">{firstLabel}</text>
      <text x={width - pad.right} y={height - 24} textAnchor="end" className="chart-date-label">{lastLabel}</text>
      <text x={pad.left} y={height - 8} textAnchor="start" className="chart-legend-label">линия — вес · пунктир — среднее</text>
      {targetY && <text x={width - 10} y={Math.max(16, targetY - 8)} textAnchor="end" className="target-label">цель {target} кг</text>}
      {latest && (
        <text x={Math.min(width - pad.right - 4, latest.x + 10)} y={Math.max(18, latest.y - 9)} className="chart-value-pill">
          {round(latest.weightKg, 1)} кг
        </text>
      )}
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

function FoodCard({ item, onEdit, onDelete }) {
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
        {onEdit && <button onClick={onEdit} aria-label="Редактировать"><Pencil size={15} /></button>}
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
        <small>{entry.type === "cardio" ? `${entry.duration} мин · ${entry.calories} ккал` : formatStrengthSummary(entry)}</small>
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Неизвестная ошибка" };
  }

  componentDidCatch(error, info) {
    console.error("Gym Helper UI error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="app-shell">
        <div className="mobile-frame error-boundary-screen">
          <div className="card stack">
            <div className="section-head">
              <div>
                <p className="eyebrow">Gym Helper</p>
                <h2>Раздел временно не загрузился</h2>
                <p>Данные не удалены. Обнови страницу или вернись после следующего обновления.</p>
              </div>
              <Info className="muted-icon" />
            </div>
            <p className="hint">Техническая ошибка: {this.state.message}</p>
            <button type="button" className="primary-button" onClick={() => window.location.reload()}>Обновить приложение</button>
          </div>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);
