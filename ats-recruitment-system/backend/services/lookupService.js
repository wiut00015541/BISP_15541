const prisma = require("../config/prisma");

const parseSettingItems = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const getLookups = async () => {
  const [departments, locations, skills, roles, recruiters, hiringManagers, settings] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { name: "recruiter" },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: {
        role: true,
        department: true,
      },
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { name: "hiring_manager" },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: {
        role: true,
        department: true,
      },
    }),
    prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            "candidate_sources",
            "job_types",
            "job_statuses",
            "interview_statuses",
            "email_templates",
          ],
        },
      },
    }),
  ]);

  const settingsMap = settings.reduce((accumulator, setting) => {
    accumulator[setting.key] = parseSettingItems(setting.value);
    return accumulator;
  }, {});

  return {
    departments,
    locations,
    skills,
    roles,
    recruiters,
    hiringManagers,
    candidateSources: settingsMap.candidate_sources || [],
    jobTypes: settingsMap.job_types || [],
    jobStatuses: settingsMap.job_statuses || [],
    interviewStatuses: settingsMap.interview_statuses || [],
    emailTemplates: settingsMap.email_templates || [],
  };
};

module.exports = {
  getLookups,
};
