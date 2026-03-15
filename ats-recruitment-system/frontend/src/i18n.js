import { createContext, useContext, useEffect, useState } from "react";

const dictionaries = {
  en: {
    common: {
      appName: "SmartHire ATS",
      language: "Language",
      english: "English",
      russian: "Russian",
      logout: "Logout",
      loading: "Loading...",
      search: "Search",
      newest: "Newest",
      oldest: "Oldest",
      page: "Page",
      of: "of",
      prev: "Prev",
      next: "Next",
      noData: "No data yet",
      activeRoles: "Active roles",
      acrossTeam: "Across the hiring team",
      thisWeek: "This week",
      livePipeline: "Live pipeline",
    },
    nav: {
      dashboard: "Dashboard",
      jobs: "Jobs",
      candidates: "Candidates",
      pipeline: "Pipeline",
      reports: "Reports",
      settings: "Settings",
    },
    login: {
      title: "Recruit faster with a unified ATS",
      subtitle: "Collaborate on jobs, candidates, interviews, and hiring analytics in one workspace.",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      signingIn: "Signing in...",
      failed: "Login failed",
      panelTitle: "Welcome back",
      panelSubtitle: "Use your work account to continue hiring operations.",
      featureOne: "Centralized hiring pipeline and stage tracking",
      featureTwo: "Live analytics for jobs, candidates, and conversion",
      featureThree: "Built-in AI resume review with OpenAI",
    },
    dashboard: {
      title: "Hiring command center",
      subtitle: "Track hiring health, pipeline volume, and funnel performance from one overview.",
      totalJobs: "Total jobs",
      totalCandidates: "Total candidates",
      applicationsPerStage: "Applications per stage",
      hiringFunnel: "Hiring funnel analytics",
      hiringFunnelSubtitle: "Real-time conversion across the full recruiting process.",
    },
    jobs: {
      title: "Jobs",
      subtitle: "Manage open requisitions with fast filtering and hiring status visibility.",
      department: "Department",
      location: "Location",
      titleColumn: "Title",
      departmentColumn: "Department",
      locationColumn: "Location",
      statusColumn: "Status",
      empty: "No jobs matched the current filters.",
    },
    candidates: {
      title: "Candidates",
      subtitle: "Review the talent pool, search by skill, and monitor ownership.",
      skillPlaceholder: "Filter by skill, for example React",
      empty: "No candidates matched the current filters.",
    },
    pipeline: {
      title: "Application pipeline",
      subtitle: "Move quickly across every stage from applied to hired.",
      candidateCount: "candidates",
      empty: "No applications in this stage",
    },
    reports: {
      title: "Reports",
      subtitle: "Keep the team aligned with hiring velocity and funnel metrics.",
      funnel: "Hiring funnel analytics",
      funnelSubtitle: "Stage-by-stage visibility into pipeline progression.",
    },
    settings: {
      title: "Settings",
      subtitle: "Environment configuration required for authentication, analytics, and AI services.",
      intro: "Configure backend environment variables for secure production deployment.",
      jwt: "JWT secret and token expiration",
      database: "Supabase PostgreSQL connection string",
      openai: "OpenAI API key for resume analysis",
      cors: "Frontend URL for CORS and deployment",
      localization: "Language switching is enabled globally for English and Russian.",
    },
    meta: {
      workspace: "Hiring workspace",
      smartWorkflows: "Smart workflows for recruiting teams",
      teamPulse: "Team pulse",
      systemHealth: "System health",
    },
    stages: {
      Applied: "Applied",
      Screening: "Screening",
      Interview: "Interview",
      Offer: "Offer",
      Hired: "Hired",
      Rejected: "Rejected",
    },
  },
  ru: {
    common: {
      appName: "SmartHire ATS",
      language: "Язык",
      english: "Английский",
      russian: "Русский",
      logout: "Выйти",
      loading: "Загрузка...",
      search: "Поиск",
      newest: "Сначала новые",
      oldest: "Сначала старые",
      page: "Страница",
      of: "из",
      prev: "Назад",
      next: "Далее",
      noData: "Пока нет данных",
      activeRoles: "Активные вакансии",
      acrossTeam: "По всей команде найма",
      thisWeek: "За неделю",
      livePipeline: "Живая воронка",
    },
    nav: {
      dashboard: "Дашборд",
      jobs: "Вакансии",
      candidates: "Кандидаты",
      pipeline: "Воронка",
      reports: "Отчеты",
      settings: "Настройки",
    },
    login: {
      title: "Нанимайте быстрее в единой ATS",
      subtitle: "Работайте с вакансиями, кандидатами, интервью и аналитикой найма в одном пространстве.",
      email: "Электронная почта",
      password: "Пароль",
      signIn: "Войти",
      signingIn: "Вход...",
      failed: "Не удалось выполнить вход",
      panelTitle: "С возвращением",
      panelSubtitle: "Используйте рабочую учетную запись, чтобы продолжить работу с наймом.",
      featureOne: "Единая воронка найма и контроль стадий",
      featureTwo: "Живая аналитика по вакансиям, кандидатам и конверсии",
      featureThree: "Встроенный AI-анализ резюме через OpenAI",
    },
    dashboard: {
      title: "Центр управления наймом",
      subtitle: "Отслеживайте состояние найма, объем воронки и конверсию по этапам в одном обзоре.",
      totalJobs: "Всего вакансий",
      totalCandidates: "Всего кандидатов",
      applicationsPerStage: "Заявки по этапам",
      hiringFunnel: "Аналитика воронки найма",
      hiringFunnelSubtitle: "Конверсия по всему процессу подбора в реальном времени.",
    },
    jobs: {
      title: "Вакансии",
      subtitle: "Управляйте открытыми позициями с быстрыми фильтрами и статусами найма.",
      department: "Отдел",
      location: "Локация",
      titleColumn: "Название",
      departmentColumn: "Отдел",
      locationColumn: "Локация",
      statusColumn: "Статус",
      empty: "По текущим фильтрам вакансии не найдены.",
    },
    candidates: {
      title: "Кандидаты",
      subtitle: "Просматривайте пул талантов, ищите по навыкам и отслеживайте ответственных.",
      skillPlaceholder: "Фильтр по навыку, например React",
      empty: "По текущим фильтрам кандидаты не найдены.",
    },
    pipeline: {
      title: "Воронка кандидатов",
      subtitle: "Быстро отслеживайте путь кандидата от отклика до найма.",
      candidateCount: "кандидатов",
      empty: "На этом этапе нет заявок",
    },
    reports: {
      title: "Отчеты",
      subtitle: "Синхронизируйте команду по скорости найма и ключевым метрикам воронки.",
      funnel: "Аналитика воронки найма",
      funnelSubtitle: "Пошаговая прозрачность движения кандидатов по воронке.",
    },
    settings: {
      title: "Настройки",
      subtitle: "Конфигурация окружения для аутентификации, аналитики и AI-сервисов.",
      intro: "Настройте переменные окружения backend для безопасного продакшн-развертывания.",
      jwt: "JWT-секрет и срок действия токена",
      database: "Строка подключения Supabase PostgreSQL",
      openai: "Ключ OpenAI API для анализа резюме",
      cors: "URL frontend для CORS и деплоя",
      localization: "Переключение языка глобально поддерживает английский и русский.",
    },
    meta: {
      workspace: "Пространство найма",
      smartWorkflows: "Умные процессы для recruiting-команд",
      teamPulse: "Пульс команды",
      systemHealth: "Состояние системы",
    },
    stages: {
      Applied: "Отклик",
      Screening: "Скрининг",
      Interview: "Интервью",
      Offer: "Оффер",
      Hired: "Нанят",
      Rejected: "Отклонен",
    },
  },
};

const LanguageContext = createContext(null);

const getValueByPath = (dictionary, path) => {
  return path.split(".").reduce((current, part) => current?.[part], dictionary);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem("ats_language") || "en");

  useEffect(() => {
    localStorage.setItem("ats_language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => getValueByPath(dictionaries[language], key) || key;
  const getStageLabel = (stage) => t(`stages.${stage}`);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getStageLabel }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
};
