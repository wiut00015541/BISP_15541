import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import { fetchLookups } from "../services/lookupService";
import { createUser, deleteUser, fetchUsers, toggleUserStatus, updateUser } from "../services/usersService";

const fallbackRoles = [
  { id: "recruiter", name: "recruiter" },
  { id: "hiring_manager", name: "hiring_manager" },
];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  roleName: "recruiter",
};

const inputClass = (error) =>
  `rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white ${
    error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
  }`;

const UsersPage = ({ currentUser }) => {
  const { t } = useLanguage();
  const notifications = useNotifications();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);
  const [busyUserId, setBusyUserId] = useState(null);

  const canManageUsers =
    currentUser?.role === "admin" || (currentUser?.permissions || []).includes("users.write");

  const filteredRoles = useMemo(() => {
    const allowedRoles = ["recruiter", "hiring_manager"];
    const lookupRoles = roles.filter((role) => allowedRoles.includes(role.name));
    return lookupRoles.length > 0 ? lookupRoles : fallbackRoles;
  }, [roles]);

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setEditingUserId(null);
  };

  const loadData = async () => {
    const [lookupData, userData] = await Promise.all([fetchLookups(), fetchUsers()]);
    setRoles(lookupData.roles || []);
    setUsers(userData.data || []);
  };

  useEffect(() => {
    if (canManageUsers) {
      loadData();
    }
  }, [canManageUsers]);

  const validate = () => {
    const nextErrors = {};

    if (!form.firstName.trim()) nextErrors.firstName = t("users.validationFirstName");
    if (!form.lastName.trim()) nextErrors.lastName = t("users.validationLastName");
    if (!form.email.trim()) {
      nextErrors.email = t("users.validationEmail");
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = t("common.invalidEmail");
    }

    if (!editingUserId && !form.password.trim()) {
      nextErrors.password = t("users.validationPassword");
    } else if (form.password.trim() && form.password.trim().length < 8) {
      nextErrors.password = t("users.validationPasswordLength");
    }

    if (!form.roleName) nextErrors.roleName = t("users.validationRole");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      notifications.error(t("common.validationFix"));
      return;
    }

    try {
      if (editingUserId) {
        await updateUser(editingUserId, form);
        notifications.success(t("common.successUserUpdated"));
      } else {
        await createUser(form);
        notifications.success(t("common.successUserCreated"));
      }

      resetForm();
      await loadData();
    } catch (error) {
      setErrors(error?.response?.data?.details || {});
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      roleName: user.role?.name || "recruiter",
    });
    setErrors({});
  };

  const handleToggleStatus = async (user) => {
    setBusyUserId(user.id);
    try {
      await toggleUserStatus(user.id);
      notifications.success(user.isActive ? t("common.successUserDeactivated") : t("common.successUserActivated"));
      await loadData();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(t("users.deleteConfirm"));
    if (!confirmed) {
      return;
    }

    setBusyUserId(user.id);
    try {
      await deleteUser(user.id);
      notifications.success(t("common.successUserDeleted"));
      if (editingUserId === user.id) {
        resetForm();
      }
      await loadData();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    } finally {
      setBusyUserId(null);
    }
  };

  if (!canManageUsers) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("users.title")}</h1>
        <p className="mt-2 text-slate-500">{t("users.subtitle")}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">{t("users.listTitle")}</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              {users.length} {t("users.accounts")}
            </span>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-100">
            <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-slate-950 text-left text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("users.name")}</th>
                  <th className="px-4 py-3 font-medium">{t("users.email")}</th>
                  <th className="px-4 py-3 font-medium">{t("users.role")}</th>
                  <th className="px-4 py-3 font-medium">{t("users.department")}</th>
                  <th className="px-4 py-3 font-medium">{t("users.status")}</th>
                  <th className="px-4 py-3 font-medium">{t("users.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 text-slate-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">{user.role?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.department?.name || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.isActive ? t("users.active") : t("users.inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[220px] flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                          onClick={() => handleEdit(user)}
                          disabled={busyUserId === user.id}
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                          onClick={() => handleToggleStatus(user)}
                          disabled={busyUserId === user.id || currentUser?.id === user.id}
                        >
                          {user.isActive ? t("users.deactivate") : t("users.activate")}
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700"
                          onClick={() => handleDelete(user)}
                          disabled={busyUserId === user.id || currentUser?.id === user.id}
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
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {editingUserId ? t("users.editTitle") : t("users.createTitle")}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {editingUserId ? t("users.editSubtitle") : t("users.createSubtitle")}
              </p>
            </div>
            {editingUserId ? (
            <button
              type="button"
              className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              onClick={resetForm}
            >
              {t("common.cancel")}
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            <input
              className={inputClass(errors.firstName)}
              placeholder={t("users.firstName")}
              value={form.firstName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
            />
            {errors.firstName ? <p className="text-sm text-rose-600">{errors.firstName}</p> : null}
          </div>

          <div className="space-y-2">
            <input
              className={inputClass(errors.lastName)}
              placeholder={t("users.lastName")}
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
            />
            {errors.lastName ? <p className="text-sm text-rose-600">{errors.lastName}</p> : null}
          </div>

          <div className="space-y-2">
            <input
              className={inputClass(errors.email)}
              placeholder={t("users.email")}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            {errors.email ? <p className="text-sm text-rose-600">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <input
              className={inputClass(errors.password)}
              placeholder={editingUserId ? t("users.passwordOptional") : t("users.password")}
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            {errors.password ? <p className="text-sm text-rose-600">{errors.password}</p> : null}
          </div>

          <div className="space-y-2">
            <select
              className={inputClass(errors.roleName)}
              value={form.roleName}
              onChange={(event) => setForm((prev) => ({ ...prev, roleName: event.target.value }))}
            >
              {filteredRoles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name === "recruiter" ? t("users.recruiterRole") : t("users.hiringManagerRole")}
                </option>
              ))}
            </select>
            {errors.roleName ? <p className="text-sm text-rose-600">{errors.roleName}</p> : null}
          </div>

          <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white sm:w-auto" type="submit">
            {editingUserId ? t("users.saveChanges") : t("users.createButton")}
          </button>
        </form>
      </div>
    </section>
  );
};

export default UsersPage;
