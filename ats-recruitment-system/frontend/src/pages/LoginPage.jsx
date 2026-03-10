import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../services/authService";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const authPayload = await loginRequest(form);
      onLogin(authPayload);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-2xl font-semibold text-slate-900">ATS Login</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage recruitment operations.</p>

        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-brand-500 px-3 py-2 font-medium text-white disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
