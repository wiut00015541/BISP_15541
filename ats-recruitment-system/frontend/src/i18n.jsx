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
      create: "Create",
      update: "Update",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      save: "Save",
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
      newButton: "Create new job",
      pipelineTitle: "Job pipeline",
      pipelineSubtitle: "Track candidates who applied to this role and move them through the funnel.",
      createTitle: "Create or update job",
      formTitle: "Job title",
      formDescription: "Description",
      formType: "Type",
      formDepartmentId: "Department ID",
      formLocationId: "Location ID",
      formDepartment: "Department",
      formLocation: "Location",
      formSkills: "Required skills",
      formStatus: "Status",
      formMinSalary: "Min salary",
      formMaxSalary: "Max salary",
      formOpenings: "Openings",
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
      newButton: "Add candidate",
      profileTitle: "Candidate profile",
      profileSubtitle: "Review candidate details, resumes, notes, and connected applications.",
      createTitle: "Add or update candidate",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      source: "Source",
      yearsExperience: "Years of experience",
      skillIds: "Skill IDs",
      skillHint: "Comma-separated skill IDs",
      resume: "Resume file",
      uploadResume: "Upload PDF or DOCX",
      existingResume: "Latest resume",
      selectSkills: "Select skills",
      skillPlaceholder: "Filter by skill, for example React",
      empty: "No candidates matched the current filters.",
    },
    pipeline: {
      title: "Application pipeline",
      subtitle: "Move quickly across every stage from applied to hired.",
      candidateCount: "candidates",
      empty: "No applications in this stage",
      dragHint: "Drag candidates between stages",
      moving: "Updating stage...",
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
      database: "Neon PostgreSQL connection string",
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
      language: "\u042f\u0437\u044b\u043a",
      english: "\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439",
      russian: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
      logout: "\u0412\u044b\u0439\u0442\u0438",
      loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...",
      search: "\u041f\u043e\u0438\u0441\u043a",
      newest: "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043d\u043e\u0432\u044b\u0435",
      oldest: "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0441\u0442\u0430\u0440\u044b\u0435",
      page: "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430",
      of: "\u0438\u0437",
      prev: "\u041d\u0430\u0437\u0430\u0434",
      next: "\u0414\u0430\u043b\u0435\u0435",
      noData: "\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445",
      activeRoles: "\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      acrossTeam: "\u041f\u043e \u0432\u0441\u0435\u0439 \u043a\u043e\u043c\u0430\u043d\u0434\u0435 \u043d\u0430\u0439\u043c\u0430",
      thisWeek: "\u0417\u0430 \u043d\u0435\u0434\u0435\u043b\u044e",
      livePipeline: "\u0416\u0438\u0432\u0430\u044f \u0432\u043e\u0440\u043e\u043d\u043a\u0430",
      create: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c",
      update: "\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c",
      edit: "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c",
      delete: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
      cancel: "\u041e\u0442\u043c\u0435\u043d\u0430",
      save: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c",
    },
    nav: {
      dashboard: "\u0414\u0430\u0448\u0431\u043e\u0440\u0434",
      jobs: "\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      candidates: "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u044b",
      pipeline: "\u0412\u043e\u0440\u043e\u043d\u043a\u0430",
      reports: "\u041e\u0442\u0447\u0435\u0442\u044b",
      settings: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
    },
    login: {
      title: "\u041d\u0430\u043d\u0438\u043c\u0430\u0439\u0442\u0435 \u0431\u044b\u0441\u0442\u0440\u0435\u0435 \u0432 \u0435\u0434\u0438\u043d\u043e\u0439 ATS",
      subtitle:
        "\u0420\u0430\u0431\u043e\u0442\u0430\u0439\u0442\u0435 \u0441 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044f\u043c\u0438, \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430\u043c\u0438, \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e \u0438 \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u043e\u0439 \u043d\u0430\u0439\u043c\u0430 \u0432 \u043e\u0434\u043d\u043e\u043c \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435.",
      email: "\u042d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u0430\u044f \u043f\u043e\u0447\u0442\u0430",
      password: "\u041f\u0430\u0440\u043e\u043b\u044c",
      signIn: "\u0412\u043e\u0439\u0442\u0438",
      signingIn: "\u0412\u0445\u043e\u0434...",
      failed: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0432\u044b\u043f\u043e\u043b\u043d\u0438\u0442\u044c \u0432\u0445\u043e\u0434",
      panelTitle: "\u0421 \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0435\u043d\u0438\u0435\u043c",
      panelSubtitle:
        "\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u0440\u0430\u0431\u043e\u0447\u0443\u044e \u0443\u0447\u0435\u0442\u043d\u0443\u044e \u0437\u0430\u043f\u0438\u0441\u044c, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0443 \u0441 \u043d\u0430\u0439\u043c\u043e\u043c.",
      featureOne: "\u0415\u0434\u0438\u043d\u0430\u044f \u0432\u043e\u0440\u043e\u043d\u043a\u0430 \u043d\u0430\u0439\u043c\u0430 \u0438 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c \u0441\u0442\u0430\u0434\u0438\u0439",
      featureTwo:
        "\u0416\u0438\u0432\u0430\u044f \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u043f\u043e \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044f\u043c, \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430\u043c \u0438 \u043a\u043e\u043d\u0432\u0435\u0440\u0441\u0438\u0438",
      featureThree: "\u0412\u0441\u0442\u0440\u043e\u0435\u043d\u043d\u044b\u0439 AI-\u0430\u043d\u0430\u043b\u0438\u0437 \u0440\u0435\u0437\u044e\u043c\u0435 \u0447\u0435\u0440\u0435\u0437 OpenAI",
    },
    dashboard: {
      title: "\u0426\u0435\u043d\u0442\u0440 \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u043d\u0430\u0439\u043c\u043e\u043c",
      subtitle:
        "\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u043d\u0430\u0439\u043c\u0430, \u043e\u0431\u044a\u0435\u043c \u0432\u043e\u0440\u043e\u043d\u043a\u0438 \u0438 \u043a\u043e\u043d\u0432\u0435\u0440\u0441\u0438\u044e \u043f\u043e \u044d\u0442\u0430\u043f\u0430\u043c \u0432 \u043e\u0434\u043d\u043e\u043c \u043e\u0431\u0437\u043e\u0440\u0435.",
      totalJobs: "\u0412\u0441\u0435\u0433\u043e \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439",
      totalCandidates: "\u0412\u0441\u0435\u0433\u043e \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u0432",
      applicationsPerStage: "\u0417\u0430\u044f\u0432\u043a\u0438 \u043f\u043e \u044d\u0442\u0430\u043f\u0430\u043c",
      hiringFunnel: "\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u0432\u043e\u0440\u043e\u043d\u043a\u0438 \u043d\u0430\u0439\u043c\u0430",
      hiringFunnelSubtitle:
        "\u041a\u043e\u043d\u0432\u0435\u0440\u0441\u0438\u044f \u043f\u043e \u0432\u0441\u0435\u043c\u0443 \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u0443 \u043f\u043e\u0434\u0431\u043e\u0440\u0430 \u0432 \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u043c \u0432\u0440\u0435\u043c\u0435\u043d\u0438.",
    },
    jobs: {
      title: "\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      subtitle:
        "\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0439\u0442\u0435 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u043c\u0438 \u043f\u043e\u0437\u0438\u0446\u0438\u044f\u043c\u0438 \u0441 \u0431\u044b\u0441\u0442\u0440\u044b\u043c\u0438 \u0444\u0438\u043b\u044c\u0442\u0440\u0430\u043c\u0438 \u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u0430\u043c\u0438 \u043d\u0430\u0439\u043c\u0430.",
      newButton: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u044e",
      pipelineTitle: "\u0412\u043e\u0440\u043e\u043d\u043a\u0430 \u043f\u043e \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      pipelineSubtitle:
        "\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u0432, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043e\u0442\u043a\u043b\u0438\u043a\u043d\u0443\u043b\u0438\u0441\u044c \u043d\u0430 \u044d\u0442\u0443 \u0440\u043e\u043b\u044c, \u0438 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0430\u0439\u0442\u0435 \u0438\u0445 \u043f\u043e \u044d\u0442\u0430\u043f\u0430\u043c.",
      createTitle: "\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0438\u043b\u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      formTitle: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438",
      formDescription: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
      formType: "\u0422\u0438\u043f",
      formDepartmentId: "ID \u043e\u0442\u0434\u0435\u043b\u0430",
      formLocationId: "ID \u043b\u043e\u043a\u0430\u0446\u0438\u0438",
      formDepartment: "\u041e\u0442\u0434\u0435\u043b",
      formLocation: "\u041b\u043e\u043a\u0430\u0446\u0438\u044f",
      formSkills: "\u041d\u0443\u0436\u043d\u044b\u0435 \u043d\u0430\u0432\u044b\u043a\u0438",
      formStatus: "\u0421\u0442\u0430\u0442\u0443\u0441",
      formMinSalary: "\u041c\u0438\u043d. \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u0430",
      formMaxSalary: "\u041c\u0430\u043a\u0441. \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u0430",
      formOpenings: "\u041a\u043e\u043b-\u0432\u043e \u043c\u0435\u0441\u0442",
      department: "\u041e\u0442\u0434\u0435\u043b",
      location: "\u041b\u043e\u043a\u0430\u0446\u0438\u044f",
      titleColumn: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
      departmentColumn: "\u041e\u0442\u0434\u0435\u043b",
      locationColumn: "\u041b\u043e\u043a\u0430\u0446\u0438\u044f",
      statusColumn: "\u0421\u0442\u0430\u0442\u0443\u0441",
      empty: "\u041f\u043e \u0442\u0435\u043a\u0443\u0449\u0438\u043c \u0444\u0438\u043b\u044c\u0442\u0440\u0430\u043c \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b.",
    },
    candidates: {
      title: "\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u044b",
      subtitle:
        "\u041f\u0440\u043e\u0441\u043c\u0430\u0442\u0440\u0438\u0432\u0430\u0439\u0442\u0435 \u043f\u0443\u043b \u0442\u0430\u043b\u0430\u043d\u0442\u043e\u0432, \u0438\u0449\u0438\u0442\u0435 \u043f\u043e \u043d\u0430\u0432\u044b\u043a\u0430\u043c \u0438 \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0445.",
      newButton: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430",
      profileTitle: "\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430",
      profileSubtitle:
        "\u041f\u0440\u043e\u0441\u043c\u0430\u0442\u0440\u0438\u0432\u0430\u0439\u0442\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430, \u0440\u0435\u0437\u044e\u043c\u0435, \u0437\u0430\u043c\u0435\u0442\u043a\u0438 \u0438 \u0441\u0432\u044f\u0437\u0430\u043d\u043d\u044b\u0435 \u0437\u0430\u044f\u0432\u043a\u0438.",
      createTitle: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0438\u043b\u0438 \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430",
      firstName: "\u0418\u043c\u044f",
      lastName: "\u0424\u0430\u043c\u0438\u043b\u0438\u044f",
      email: "Email",
      phone: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d",
      source: "\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a",
      yearsExperience: "\u041b\u0435\u0442 \u043e\u043f\u044b\u0442\u0430",
      skillIds: "ID \u043d\u0430\u0432\u044b\u043a\u043e\u0432",
      skillHint: "ID \u043d\u0430\u0432\u044b\u043a\u043e\u0432 \u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043f\u044f\u0442\u0443\u044e",
      resume: "\u0424\u0430\u0439\u043b \u0440\u0435\u0437\u044e\u043c\u0435",
      uploadResume: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 PDF \u0438\u043b\u0438 DOCX",
      existingResume: "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0435 \u0440\u0435\u0437\u044e\u043c\u0435",
      selectSkills: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043d\u0430\u0432\u044b\u043a\u0438",
      skillPlaceholder: "\u0424\u0438\u043b\u044c\u0442\u0440 \u043f\u043e \u043d\u0430\u0432\u044b\u043a\u0443, \u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 React",
      empty: "\u041f\u043e \u0442\u0435\u043a\u0443\u0449\u0438\u043c \u0444\u0438\u043b\u044c\u0442\u0440\u0430\u043c \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b.",
    },
    pipeline: {
      title: "\u0412\u043e\u0440\u043e\u043d\u043a\u0430 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u0432",
      subtitle: "\u0411\u044b\u0441\u0442\u0440\u043e \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u043f\u0443\u0442\u044c \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0430 \u043e\u0442 \u043e\u0442\u043a\u043b\u0438\u043a\u0430 \u0434\u043e \u043d\u0430\u0439\u043c\u0430.",
      candidateCount: "\u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u0432",
      empty: "\u041d\u0430 \u044d\u0442\u043e\u043c \u044d\u0442\u0430\u043f\u0435 \u043d\u0435\u0442 \u0437\u0430\u044f\u0432\u043e\u043a",
      dragHint: "\u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u0432 \u043c\u0435\u0436\u0434\u0443 \u044d\u0442\u0430\u043f\u0430\u043c\u0438",
      moving: "\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c \u044d\u0442\u0430\u043f...",
    },
    reports: {
      title: "\u041e\u0442\u0447\u0435\u0442\u044b",
      subtitle:
        "\u0421\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0438\u0440\u0443\u0439\u0442\u0435 \u043a\u043e\u043c\u0430\u043d\u0434\u0443 \u043f\u043e \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u0438 \u043d\u0430\u0439\u043c\u0430 \u0438 \u043a\u043b\u044e\u0447\u0435\u0432\u044b\u043c \u043c\u0435\u0442\u0440\u0438\u043a\u0430\u043c \u0432\u043e\u0440\u043e\u043d\u043a\u0438.",
      funnel: "\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u0432\u043e\u0440\u043e\u043d\u043a\u0438 \u043d\u0430\u0439\u043c\u0430",
      funnelSubtitle: "\u041f\u043e\u0448\u0430\u0433\u043e\u0432\u0430\u044f \u043f\u0440\u043e\u0437\u0440\u0430\u0447\u043d\u043e\u0441\u0442\u044c \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u043e\u0432 \u043f\u043e \u0432\u043e\u0440\u043e\u043d\u043a\u0435.",
    },
    settings: {
      title: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
      subtitle:
        "\u041a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044f \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u044f \u0434\u043b\u044f \u0430\u0443\u0442\u0435\u043d\u0442\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0438, \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0438 \u0438 AI-\u0441\u0435\u0440\u0432\u0438\u0441\u043e\u0432.",
      intro:
        "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u0442\u0435 \u043f\u0435\u0440\u0435\u043c\u0435\u043d\u043d\u044b\u0435 \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u044f backend \u0434\u043b\u044f \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0433\u043e \u043f\u0440\u043e\u0434\u0430\u043a\u0448\u043d-\u0440\u0430\u0437\u0432\u0435\u0440\u0442\u044b\u0432\u0430\u043d\u0438\u044f.",
      jwt: "JWT-\u0441\u0435\u043a\u0440\u0435\u0442 \u0438 \u0441\u0440\u043e\u043a \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f \u0442\u043e\u043a\u0435\u043d\u0430",
      database: "\u0421\u0442\u0440\u043e\u043a\u0430 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f Neon PostgreSQL",
      openai: "\u041a\u043b\u044e\u0447 OpenAI API \u0434\u043b\u044f \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u0440\u0435\u0437\u044e\u043c\u0435",
      cors: "URL frontend \u0434\u043b\u044f CORS \u0438 \u0434\u0435\u043f\u043b\u043e\u044f",
      localization:
        "\u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u044f\u0437\u044b\u043a\u0430 \u0433\u043b\u043e\u0431\u0430\u043b\u044c\u043d\u043e \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u0430\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 \u0438 \u0440\u0443\u0441\u0441\u043a\u0438\u0439.",
    },
    meta: {
      workspace: "\u041f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e \u043d\u0430\u0439\u043c\u0430",
      smartWorkflows: "\u0423\u043c\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u044b \u0434\u043b\u044f recruiting-\u043a\u043e\u043c\u0430\u043d\u0434",
      teamPulse: "\u041f\u0443\u043b\u044c\u0441 \u043a\u043e\u043c\u0430\u043d\u0434\u044b",
      systemHealth: "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0441\u0438\u0441\u0442\u0435\u043c\u044b",
    },
    stages: {
      Applied: "\u041e\u0442\u043a\u043b\u0438\u043a",
      Screening: "\u0421\u043a\u0440\u0438\u043d\u0438\u043d\u0433",
      Interview: "\u0418\u043d\u0442\u0435\u0440\u0432\u044c\u044e",
      Offer: "\u041e\u0444\u0444\u0435\u0440",
      Hired: "\u041d\u0430\u043d\u044f\u0442",
      Rejected: "\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d",
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
