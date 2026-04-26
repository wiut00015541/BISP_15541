// Departments screen for the frontend app.
import { useEffect, useState } from "react";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from "../services/departmentsService";

const initialForm = {
  name: "",
  description: "",
};

// Render the departments page and keep its local UI behavior together.
const DepartmentsPage = () => {
  const { t } = useLanguage();
  const notifications = useNotifications();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // Keep load departments focused and easier to understand from the code nearby.
  const loadDepartments = async () => {
    const data = await fetchDepartments();
    setDepartments(data);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // Validate the current input before continuing to the next step.
  const validate = () => {
    if (!form.name.trim()) {
      setError(t("common.required"));
      return false;
    }
    setError("");
    return true;
  };

  // Submit the current form state and handle the success or error path.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      notifications.error(t("common.required"));
      return;
    }

    try {
      if (editingId) {
        await updateDepartment(editingId, form);
      } else {
        await createDepartment(form);
      }
      notifications.success(t("common.successDepartmentSaved"));
      setForm(initialForm);
      setEditingId(null);
      await loadDepartments();
    } catch (_error) {
      notifications.error(t("common.genericError"));
    }
  };

  // Handle edit for this screen or component.
  const handleEdit = (department) => {
    setEditingId(department.id);
    setForm({
      name: department.name || "",
      description: department.description || "",
    });
    setError("");
  };

  // Handle delete for this screen or component.
  const handleDelete = async (id) => {
    try {
      await deleteDepartment(id);
      notifications.success(t("common.successDepartmentDeleted"));
      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }
      await loadDepartments();
    } catch (_error) {
      notifications.error(t("common.genericError"));
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("departments.title")}</h1>
        <p className="mt-2 text-slate-500">{t("departments.subtitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-slate-950">{t("departments.createTitle")}</h2>
        </div>
        <input
          className={`rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white ${
            error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
          }`}
          placeholder={t("departments.name")}
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
          placeholder={t("departments.description")}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
        {error ? <p className="md:col-span-2 text-sm text-rose-600">{error}</p> : null}
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white" type="submit">
            {editingId ? t("common.update") : t("common.create")}
          </button>
          {editingId ? (
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
                setError("");
              }}
            >
              {t("common.cancel")}
            </button>
          ) : null}
        </div>
      </form>

      <div className="rounded-[30px] border border-white/80 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-950 text-left text-white">
            <tr>
              <th className="px-5 py-4 font-medium">{t("departments.name")}</th>
              <th className="px-5 py-4 font-medium">{t("departments.description")}</th>
              <th className="px-5 py-4 font-medium">{t("common.edit")}</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-5 py-8 text-center text-slate-500">
                  {t("departments.empty")}
                </td>
              </tr>
            ) : null}
            {departments.map((department) => (
              <tr key={department.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-medium text-slate-900">{department.name}</td>
                <td className="px-5 py-4 text-slate-600">{department.description || "-"}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                      onClick={() => handleEdit(department)}
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"
                      onClick={() => handleDelete(department.id)}
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DepartmentsPage;
