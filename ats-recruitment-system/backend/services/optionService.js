// optionService contains backend business logic for this area.
const { randomUUID } = require("crypto");
const prisma = require("../config/prisma");

const OPTION_CONFIG = {
  departments: {
    storage: "model",
    model: prisma.department,
    name: "Department",
    orderBy: { name: "asc" },
    mapCreate: (payload) => ({
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    }),
  },
  locations: {
    storage: "model",
    model: prisma.location,
    name: "Location",
    orderBy: { name: "asc" },
    mapCreate: (payload) => ({
      name: payload.name.trim(),
      country: payload.country?.trim() || "Uzbekistan",
      isRemote: payload.isRemote === true || payload.isRemote === "true",
    }),
  },
  skills: {
    storage: "model",
    model: prisma.skill,
    name: "Skill",
    orderBy: { name: "asc" },
    mapCreate: (payload) => ({
      name: payload.name.trim(),
      category: payload.category?.trim() || null,
    }),
  },
  stages: {
    storage: "model",
    model: prisma.stage,
    name: "Stage",
    orderBy: { order: "asc" },
    mapCreate: (payload) => ({
      name: payload.name.trim(),
      order: Number(payload.order),
      isTerminal: payload.isTerminal === true || payload.isTerminal === "true",
    }),
    validate: (payload, errors) => {
      if (payload.order === undefined || payload.order === null || payload.order === "") {
        errors.order = "Stage order is required";
      } else if (!Number.isInteger(Number(payload.order))) {
        errors.order = "Stage order must be an integer";
      }
    },
  },
  candidateSources: {
    storage: "setting",
    settingKey: "candidate_sources",
    name: "Candidate source",
    mapCreate: (payload, id = randomUUID()) => ({
      id,
      code: payload.code.trim(),
      name: payload.name.trim(),
    }),
    validate: (payload, errors) => {
      if (!payload.code?.trim()) {
        errors.code = "Code is required";
      }
    },
  },
  jobTypes: {
    storage: "setting",
    settingKey: "job_types",
    name: "Job type",
    mapCreate: (payload, id = randomUUID()) => ({
      id,
      code: payload.code.trim(),
      name: payload.name.trim(),
    }),
    validate: (payload, errors) => {
      if (!payload.code?.trim()) {
        errors.code = "Code is required";
      }
    },
  },
  jobStatuses: {
    storage: "setting",
    settingKey: "job_statuses",
    name: "Job status",
    mapCreate: (payload, id = randomUUID()) => ({
      id,
      code: payload.code.trim(),
      name: payload.name.trim(),
    }),
    validate: (payload, errors) => {
      if (!payload.code?.trim()) {
        errors.code = "Code is required";
      }
    },
  },
  interviewStatuses: {
    storage: "setting",
    settingKey: "interview_statuses",
    name: "Interview status",
    mapCreate: (payload, id = randomUUID()) => ({
      id,
      code: payload.code.trim(),
      name: payload.name.trim(),
    }),
    validate: (payload, errors) => {
      if (!payload.code?.trim()) {
        errors.code = "Code is required";
      }
    },
  },
  emailTemplates: {
    storage: "setting",
    settingKey: "email_templates",
    name: "Email template",
    mapCreate: (payload, id = randomUUID()) => ({
      id,
      code: payload.code.trim(),
      name: payload.name.trim(),
      subject: payload.subject.trim(),
      heading: payload.heading?.trim() || payload.subject.trim(),
      intro: payload.intro.trim(),
      closing: payload.closing?.trim() || "ATS Recruitment Team",
    }),
    validate: (payload, errors) => {
      if (!payload.code?.trim()) {
        errors.code = "Template code is required";
      }
      if (!payload.subject?.trim()) {
        errors.subject = "Email subject is required";
      }
      if (!payload.intro?.trim()) {
        errors.intro = "Email intro is required";
      }
    },
  },
};

// Load configuration with the business rules for this area.
const getConfig = (type) => {
  const config = OPTION_CONFIG[type];
  if (!config) {
    const error = new Error("Unsupported option type");
    error.status = 400;
    throw error;
  }
  return config;
};

// Validate payload before the database work starts.
const validatePayload = (type, payload) => {
  const config = getConfig(type);
  const errors = {};

  if (!payload.name?.trim()) {
    errors.name = `${config.name} name is required`;
  }

  if (config.validate) {
    config.validate(payload, errors);
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }

  return config;
};

// Parse setting items into a safer internal format.
const parseSettingItems = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

// Load setting items with the business rules for this area.
const getSettingItems = async (config) => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: config.settingKey },
  });

  return parseSettingItems(setting?.value);
};

// Keep save setting items inside the service layer instead of the controller.
const saveSettingItems = async (config, items) => {
  await prisma.systemSetting.upsert({
    where: { key: config.settingKey },
    update: {
      value: JSON.stringify(items),
    },
    create: {
      key: config.settingKey,
      value: JSON.stringify(items),
    },
  });
};

// Load options with the business rules for this area.
const getOptions = async (type) => {
  const config = getConfig(type);
  if (config.storage === "setting") {
    return getSettingItems(config);
  }

  return config.model.findMany({ orderBy: config.orderBy });
};

// Create option and apply the related business rules.
const createOption = async (type, payload) => {
  const config = validatePayload(type, payload);

  if (config.storage === "setting") {
    const items = await getSettingItems(config);
    const nextItem = config.mapCreate(payload);

    const duplicateName = items.some(
      (item) => item.name?.toLowerCase() === nextItem.name.toLowerCase()
    );
    if (duplicateName) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.details = { name: `${config.name} name must be unique` };
      throw error;
    }

    if (nextItem.code) {
      const duplicateCode = items.some(
        (item) => item.code?.toLowerCase() === nextItem.code.toLowerCase()
      );
      if (duplicateCode) {
        const error = new Error("Validation failed");
        error.status = 400;
        error.details = { code: "Template code must be unique" };
        throw error;
      }
    }

    const nextItems = [...items, nextItem];
    await saveSettingItems(config, nextItems);
    return nextItem;
  }

  return config.model.create({ data: config.mapCreate(payload) });
};

// Update option while keeping the workflow rules consistent.
const updateOption = async (type, id, payload) => {
  const config = validatePayload(type, payload);

  if (config.storage === "setting") {
    const items = await getSettingItems(config);
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      const error = new Error(`${config.name} not found`);
      error.status = 404;
      throw error;
    }

    const nextItem = config.mapCreate(payload, id);

    const duplicateName = items.some(
      (item) => item.id !== id && item.name?.toLowerCase() === nextItem.name.toLowerCase()
    );
    if (duplicateName) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.details = { name: `${config.name} name must be unique` };
      throw error;
    }

    if (nextItem.code) {
      const duplicateCode = items.some(
        (item) => item.id !== id && item.code?.toLowerCase() === nextItem.code.toLowerCase()
      );
      if (duplicateCode) {
        const error = new Error("Validation failed");
        error.status = 400;
        error.details = { code: "Template code must be unique" };
        throw error;
      }
    }

    const nextItems = [...items];
    nextItems[index] = nextItem;
    await saveSettingItems(config, nextItems);
    return nextItem;
  }

  return config.model.update({
    where: { id },
    data: config.mapCreate(payload),
  });
};

// Delete option after the access checks pass.
const deleteOption = async (type, id) => {
  const config = getConfig(type);

  if (config.storage === "setting") {
    const items = await getSettingItems(config);
    const nextItems = items.filter((item) => item.id !== id);

    if (nextItems.length === items.length) {
      const error = new Error(`${config.name} not found`);
      error.status = 404;
      throw error;
    }

    await saveSettingItems(config, nextItems);
    return;
  }

  try {
    return await config.model.delete({ where: { id } });
  } catch (error) {
    if (error.code === "P2003") {
      const conflict = new Error(`${config.name} is in use and cannot be deleted`);
      conflict.status = 409;
      throw conflict;
    }
    throw error;
  }
};

module.exports = {
  getOptions,
  createOption,
  updateOption,
  deleteOption,
};
