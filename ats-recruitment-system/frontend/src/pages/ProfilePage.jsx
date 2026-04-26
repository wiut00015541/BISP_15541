// Profile screen for the frontend app.
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import { fetchCurrentUser, updateCurrentUser } from "../services/usersService";

// Keep input class focused and easier to understand from the code nearby.
const inputClass = (error) =>
  `w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white ${
    error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
  }`;

// Render the profile page and keep its local UI behavior together.
const ProfilePage = ({ currentUser, onUserUpdate }) => {
  const { t } = useLanguage();
  const notifications = useNotifications();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Keep load profile focused and easier to understand from the code nearby.
    const loadProfile = async () => {
      const data = await fetchCurrentUser();
      setProfile(data);
      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        password: "",
      });
    };

    loadProfile();
  }, []);

  const permissionsLabel = useMemo(() => {
    if (!profile?.permissions?.length) {
      return t("profile.noPermissions");
    }

    return profile.permissions.join(", ");
  }, [profile, t]);

  // Validate the current input before continuing to the next step.
  const validate = () => {
    const nextErrors = {};

    if (!form.firstName.trim()) nextErrors.firstName = t("users.validationFirstName");
    if (!form.lastName.trim()) nextErrors.lastName = t("users.validationLastName");
    if (!form.email.trim()) nextErrors.email = t("users.validationEmail");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = t("common.invalidEmail");
    }
    if (form.password && form.password.trim().length < 8) {
      nextErrors.password = t("users.validationPasswordLength");
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

    setSaving(true);
    try {
      const updatedProfile = await updateCurrentUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      });

      setProfile(updatedProfile);
      setForm((prev) => ({ ...prev, password: "" }));

      onUserUpdate?.({
        ...currentUser,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
      });

      notifications.success(t("common.successProfileUpdated"));
    } catch (error) {
      setErrors(error?.response?.data?.details || {});
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("profile.title")}</h1>
        <p className="mt-2 text-slate-500">{t("profile.subtitle")}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <form
          className="grid gap-4 rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{t("profile.formTitle")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("profile.formSubtitle")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
              placeholder={t("profile.passwordPlaceholder")}
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            {errors.password ? <p className="text-sm text-rose-600">{errors.password}</p> : null}
            <p className="text-xs text-slate-500">{t("profile.passwordHint")}</p>
          </div>

          <button
            className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white sm:w-auto"
            type="submit"
            disabled={saving}
          >
            {saving ? t("profile.saving") : t("profile.saveButton")}
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t("profile.accountCard")}</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              {profile ? `${profile.firstName} ${profile.lastName}` : currentUser?.firstName}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{profile?.email || currentUser?.email}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("profile.roleLabel")}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{profile?.role || currentUser?.role}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("profile.departmentLabel")}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{profile?.department?.name || t("jobs.notSpecified")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t("profile.accessCard")}</p>
            <p className="mt-3 text-sm text-slate-600">{permissionsLabel}</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("profile.lastLoginLabel")}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : t("profile.noLogins")}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("profile.memberSinceLabel")}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
