// Options screen for the frontend app.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import { createOption, deleteOption, fetchOptions, updateOption } from "../services/optionsService";

const optionTypes = [
  { key: "departments", fields: ["name", "description"] },
  { key: "locations", fields: ["name", "country", "isRemote"] },
  { key: "skills", fields: ["name", "category"] },
  { key: "stages", fields: ["name", "order", "isTerminal"] },
  { key: "candidateSources", fields: ["code", "name"] },
  { key: "jobTypes", fields: ["code", "name"] },
  { key: "jobStatuses", fields: ["code", "name"] },
  { key: "interviewStatuses", fields: ["code", "name"] },
  { key: "emailTemplates", fields: ["code", "name", "subject", "heading", "intro", "closing"] },
];

// Keep build initial form focused and easier to understand from the code nearby.
const buildInitialForm = (type) => {
  if (type === "locations") {
    return { name: "", country: "Uzbekistan", isRemote: false };
  }
  if (type === "stages") {
    return { name: "", order: "", isTerminal: false };
  }
  if (type === "skills") {
    return { name: "", category: "" };
  }
  if (["candidateSources", "jobTypes", "jobStatuses", "interviewStatuses"].includes(type)) {
    return { code: "", name: "" };
  }
  if (type === "emailTemplates") {
    return { code: "", name: "", subject: "", heading: "", intro: "", closing: "ATS Recruitment Team" };
  }
  return { name: "", description: "" };
};

// Keep input class focused and easier to understand from the code nearby.
const inputClass = (error) =>
  `rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white ${
    error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
  }`;

// Render the options page and keep its local UI behavior together.
const OptionSection = ({ type, items, t, onRefresh }) => {
  const notifications = useNotifications();
  const [form, setForm] = useState(buildInitialForm(type));
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  // Keep reset focused and easier to understand from the code nearby.
  const reset = () => {
    setForm(buildInitialForm(type));
    setEditingId(null);
    setErrors({});
  };

  // Validate the current input before continuing to the next step.
  const validate = () => {
    const nextErrors = {};
    if (!form.name?.toString().trim()) {
      nextErrors.name = t("options.validationName");
    }
    if (type === "emailTemplates" && !form.code?.trim()) {
      nextErrors.code = t("options.validationCode");
    }
    if (type === "emailTemplates" && !form.subject?.trim()) {
      nextErrors.subject = t("options.validationSubject");
    }
    if (type === "emailTemplates" && !form.intro?.trim()) {
      nextErrors.intro = t("options.validationIntro");
    }
    if (type === "stages" && (form.order === "" || Number.isNaN(Number(form.order)))) {
      nextErrors.order = t("options.validationOrder");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Submit the current form state and handle the success or error path.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      notifications.error(t("common.validationFix"));
      return;
    }

    try {
      if (editingId) {
        await updateOption(type, editingId, form);
        notifications.success(t("options.updated"));
      } else {
        await createOption(type, form);
        notifications.success(t("options.created"));
      }
      reset();
      await onRefresh();
    } catch (error) {
      setErrors(error?.response?.data?.details || {});
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    }
  };

  // Handle edit for this screen or component.
  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      code: item.code || "",
      name: item.name || "",
      description: item.description || "",
      country: item.country || "Uzbekistan",
      isRemote: item.isRemote || false,
      category: item.category || "",
      order: item.order ?? "",
      isTerminal: item.isTerminal || false,
      subject: item.subject || "",
      heading: item.heading || "",
      intro: item.intro || "",
      closing: item.closing || "ATS Recruitment Team",
    });
    setErrors({});
  };

  // Handle delete for this screen or component.
  const handleDelete = async (itemId) => {
    const confirmed = window.confirm(t("options.deleteConfirm"));
    if (!confirmed) return;
    try {
      await deleteOption(type, itemId);
      notifications.success(t("options.deleted"));
      if (editingId === itemId) {
        reset();
      }
      await onRefresh();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    }
  };

  return (
    <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="flex h-[560px] flex-col rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">{t(`options.${type}`)}</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            {items.length}
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  {item.description ? <p>{item.description}</p> : null}
                  {item.code ? <p>{t("options.codeLabel")}: {item.code}</p> : null}
                  {item.country ? <p>{item.country}</p> : null}
                  {item.category ? <p>{item.category}</p> : null}
                  {item.subject ? <p>{t("options.subjectLabel")}: {item.subject}</p> : null}
                  {item.heading ? <p>{t("options.headingLabel")}: {item.heading}</p> : null}
                  {item.order !== undefined ? <p>{t("options.orderLabel")}: {item.order}</p> : null}
                  {item.isRemote ? <p>{t("options.remoteLabel")}</p> : null}
                  {item.isTerminal ? <p>{t("options.terminalLabel")}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                    onClick={() => handleEdit(item)}
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700"
                    onClick={() => handleDelete(item.id)}
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="h-[560px] overflow-y-auto rounded-[30px] border border-white/80 bg-white/90 px-6 pt-6 pb-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">
              {editingId ? t("options.editItem") : t("options.addItem")}
            </h3>
            <p className="mt-2 text-sm text-slate-500">{t(`options.${type}Help`)}</p>
          </div>
          {editingId ? (
            <button
              type="button"
              className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              onClick={reset}
            >
              {t("common.cancel")}
            </button>
          ) : null}
        </div>

        <div className="mt-4 space-y-4 pr-2">
          <div className="space-y-2">
            {"code" in form ? (
              <>
                <input
                  className={inputClass(errors.code)}
                  placeholder={t("options.code")}
                  value={form.code}
                  onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                />
                {errors.code ? <p className="text-sm text-rose-600">{errors.code}</p> : null}
              </>
            ) : null}

            <input
              className={inputClass(errors.name)}
              placeholder={t("options.name")}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            {errors.name ? <p className="text-sm text-rose-600">{errors.name}</p> : null}
          </div>

          {"description" in form ? (
            <textarea
              className={`${inputClass()} min-h-24`}
              placeholder={t("options.description")}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          ) : null}

          {"country" in form ? (
            <input
              className={inputClass()}
              placeholder={t("options.country")}
              value={form.country}
              onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
            />
          ) : null}

          {"category" in form ? (
            <input
              className={inputClass()}
              placeholder={t("options.category")}
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            />
          ) : null}

          {"subject" in form ? (
            <div className="space-y-2">
              <input
                className={inputClass(errors.subject)}
                placeholder={t("options.subject")}
                value={form.subject}
                onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              />
              {errors.subject ? <p className="text-sm text-rose-600">{errors.subject}</p> : null}
            </div>
          ) : null}

          {"heading" in form ? (
            <input
              className={inputClass()}
              placeholder={t("options.heading")}
              value={form.heading}
              onChange={(event) => setForm((prev) => ({ ...prev, heading: event.target.value }))}
            />
          ) : null}

          {"intro" in form ? (
            <div className="space-y-2">
              <textarea
                className={`${inputClass(errors.intro)} min-h-24`}
                placeholder={t("options.intro")}
                value={form.intro}
                onChange={(event) => setForm((prev) => ({ ...prev, intro: event.target.value }))}
              />
              {errors.intro ? <p className="text-sm text-rose-600">{errors.intro}</p> : null}
            </div>
          ) : null}

          {"closing" in form ? (
            <input
              className={inputClass()}
              placeholder={t("options.closing")}
              value={form.closing}
              onChange={(event) => setForm((prev) => ({ ...prev, closing: event.target.value }))}
            />
          ) : null}

          {"order" in form ? (
            <div className="space-y-2">
              <input
                className={inputClass(errors.order)}
                type="number"
                placeholder={t("options.order")}
                value={form.order}
                onChange={(event) => setForm((prev) => ({ ...prev, order: event.target.value }))}
              />
              {errors.order ? <p className="text-sm text-rose-600">{errors.order}</p> : null}
            </div>
          ) : null}

          {"isRemote" in form ? (
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isRemote}
                onChange={(event) => setForm((prev) => ({ ...prev, isRemote: event.target.checked }))}
              />
              {t("options.isRemote")}
            </label>
          ) : null}

          {"isTerminal" in form ? (
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isTerminal}
                onChange={(event) => setForm((prev) => ({ ...prev, isTerminal: event.target.checked }))}
              />
              {t("options.isTerminal")}
            </label>
          ) : null}
        </div>

        <button className="mt-4 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white sm:w-auto" type="submit">
          {editingId ? t("common.save") : t("common.create")}
        </button>
      </form>
    </div>
  );
};

// Render the options page and keep its local UI behavior together.
const OptionsPage = ({ currentUser }) => {
  const { t } = useLanguage();
  const [data, setData] = useState({
    departments: [],
    locations: [],
    skills: [],
    stages: [],
    candidateSources: [],
    jobTypes: [],
    jobStatuses: [],
    interviewStatuses: [],
    emailTemplates: [],
  });

  const canManageOptions =
    currentUser?.role === "admin" || (currentUser?.permissions || []).includes("settings.write");

  // Keep load all focused and easier to understand from the code nearby.
  const loadAll = async () => {
    const responses = await Promise.all(optionTypes.map((item) => fetchOptions(item.key)));
    setData(
      optionTypes.reduce((accumulator, item, index) => {
        accumulator[item.key] = responses[index].data || [];
        return accumulator;
      }, {})
    );
  };

  useEffect(() => {
    if (canManageOptions) {
      loadAll();
    }
  }, [canManageOptions]);

  if (!canManageOptions) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("options.title")}</h1>
        <p className="mt-2 text-slate-500">{t("options.subtitle")}</p>
      </div>

      {optionTypes.map((item) => (
        <OptionSection
          key={item.key}
          type={item.key}
          items={data[item.key] || []}
          t={t}
          onRefresh={loadAll}
        />
      ))}
    </section>
  );
};

export default OptionsPage;
