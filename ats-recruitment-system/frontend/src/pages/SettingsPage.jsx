const SettingsPage = () => {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Settings</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <p className="text-slate-700">
          Configure environment variables in backend `.env` for JWT, database access, and OpenAI integration.
        </p>
        <ul className="mt-3 list-disc pl-5 text-slate-600">
          <li>JWT_SECRET and JWT_EXPIRES_IN</li>
          <li>DATABASE_URL for Supabase PostgreSQL</li>
          <li>OPENAI_API_KEY for resume analysis</li>
          <li>FRONTEND_URL for CORS</li>
        </ul>
      </div>
    </section>
  );
};

export default SettingsPage;
