// Automated backend tests for shared system behavior.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const projectRoot = path.join(__dirname, "..");

const resolveFromBackend = (...parts) => path.join(projectRoot, ...parts);

// Keep fresh require focused and easier to understand from the code nearby.
const freshRequire = (modulePath) => {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
};

// Keep with mocked dependency focused and easier to understand from the code nearby.
const withMockedDependency = (dependencyPath, mockExports, loadModule) => {
  const resolvedDependency = require.resolve(dependencyPath);
  const original = require.cache[resolvedDependency];

  require.cache[resolvedDependency] = {
    id: resolvedDependency,
    filename: resolvedDependency,
    loaded: true,
    exports: mockExports,
  };

  try {
    return loadModule();
  } finally {
    if (original) {
      require.cache[resolvedDependency] = original;
    } else {
      delete require.cache[resolvedDependency];
    }
  }
};

const buildRes = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  send(payload) {
    this.body = payload;
    return this;
  },
});

test("parsePagination returns defaults when query is empty", () => {
  const { parsePagination } = require(resolveFromBackend("utils", "apiFeatures"));
  assert.deepEqual(parsePagination({}), { page: 1, limit: 20, skip: 0 });
});

test("parsePagination respects valid page and limit", () => {
  const { parsePagination } = require(resolveFromBackend("utils", "apiFeatures"));
  assert.deepEqual(parsePagination({ page: "3", limit: "15" }), { page: 3, limit: 15, skip: 30 });
});

test("parsePagination clamps page below 1", () => {
  const { parsePagination } = require(resolveFromBackend("utils", "apiFeatures"));
  assert.deepEqual(parsePagination({ page: "0", limit: "5" }), { page: 1, limit: 5, skip: 0 });
});

test("parsePagination clamps limit above maximum", () => {
  const { parsePagination } = require(resolveFromBackend("utils", "apiFeatures"));
  assert.deepEqual(parsePagination({ page: "1", limit: "999" }), { page: 1, limit: 100, skip: 0 });
});

test("parseSort uses requested allowed field and ascending order", () => {
  const { parseSort } = require(resolveFromBackend("utils", "apiFeatures"));
  assert.deepEqual(parseSort({ sort: "title", order: "asc" }, ["title", "createdAt"], "createdAt"), {
    title: "asc",
  });
});

test("parseSort falls back to default field and descending order", () => {
  const { parseSort } = require(resolveFromBackend("utils", "apiFeatures"));
  assert.deepEqual(parseSort({ sort: "unknown", order: "nope" }, ["title", "createdAt"], "createdAt"), {
    createdAt: "desc",
  });
});

test("isAdmin returns true only for admin role", () => {
  const { isAdmin } = require(resolveFromBackend("utils", "accessScope"));
  assert.equal(isAdmin({ role: "admin" }), true);
  assert.equal(isAdmin({ role: "recruiter" }), false);
});

test("buildAssignedJobScope returns empty scope for admin", () => {
  const { buildAssignedJobScope } = require(resolveFromBackend("utils", "accessScope"));
  assert.deepEqual(buildAssignedJobScope({ id: "u1", role: "admin" }), {});
});

test("buildAssignedJobScope returns recruiter and hiring manager OR scope for non-admin", () => {
  const { buildAssignedJobScope } = require(resolveFromBackend("utils", "accessScope"));
  assert.deepEqual(buildAssignedJobScope({ id: "user-123", role: "recruiter" }), {
    OR: [{ recruiterId: "user-123" }, { hiringManagerId: "user-123" }],
  });
});

test("buildAssignedJobRelationScope mirrors non-admin access scope", () => {
  const { buildAssignedJobRelationScope } = require(resolveFromBackend("utils", "accessScope"));
  assert.deepEqual(buildAssignedJobRelationScope({ id: "user-456", role: "hiring_manager" }), {
    OR: [{ recruiterId: "user-456" }, { hiringManagerId: "user-456" }],
  });
});

test("notFoundHandler returns 404 payload with route", () => {
  const { notFoundHandler } = require(resolveFromBackend("middleware", "errorMiddleware"));
  const req = { originalUrl: "/api/unknown" };
  const res = buildRes();
  notFoundHandler(req, res);
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: "Route not found: /api/unknown" });
});

test("errorHandler returns custom status, message, and details", () => {
  const { errorHandler } = require(resolveFromBackend("middleware", "errorMiddleware"));
  const res = buildRes();
  errorHandler({ status: 422, message: "Validation failed", details: { email: "Invalid" } }, {}, res, () => {});
  assert.equal(res.statusCode, 422);
  assert.deepEqual(res.body, { message: "Validation failed", details: { email: "Invalid" } });
});

test("errorHandler falls back to 500 and default message", () => {
  const { errorHandler } = require(resolveFromBackend("middleware", "errorMiddleware"));
  const res = buildRes();
  errorHandler({}, {}, res, () => {});
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { message: "Internal server error", details: undefined });
});

test("requirePermission allows request when user has one required permission", () => {
  const { requirePermission } = require(resolveFromBackend("middleware", "rbacMiddleware"));
  const middleware = requirePermission("jobs.write", "settings.write");
  let nextCalled = false;
  middleware({ user: { permissions: ["jobs.read", "jobs.write"] } }, buildRes(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
});

test("requirePermission blocks request when user lacks required permission", () => {
  const { requirePermission } = require(resolveFromBackend("middleware", "rbacMiddleware"));
  const middleware = requirePermission("settings.write");
  const res = buildRes();
  middleware({ user: { permissions: ["jobs.read"] } }, res, () => {});
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: "Forbidden" });
});

test("requirePermission blocks request when user permissions are missing", () => {
  const { requirePermission } = require(resolveFromBackend("middleware", "rbacMiddleware"));
  const middleware = requirePermission("candidates.write");
  const res = buildRes();
  middleware({ user: null }, res, () => {});
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: "Forbidden" });
});

test("generateToken and verifyToken round-trip payload", () => {
  const previousSecret = process.env.JWT_SECRET;
  const previousExpires = process.env.JWT_EXPIRES_IN;
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "1h";

  const jwtUtils = freshRequire(resolveFromBackend("utils", "jwt"));
  const token = jwtUtils.generateToken({ userId: "user-1", role: "admin" });
  const decoded = jwtUtils.verifyToken(token);

  assert.equal(decoded.userId, "user-1");
  assert.equal(decoded.role, "admin");

  process.env.JWT_SECRET = previousSecret;
  process.env.JWT_EXPIRES_IN = previousExpires;
});

test("verifyToken throws on invalid token", () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-secret";

  const jwtUtils = freshRequire(resolveFromBackend("utils", "jwt"));
  assert.throws(() => jwtUtils.verifyToken("bad-token"));

  process.env.JWT_SECRET = previousSecret;
});

test("generateToken respects configured expiration by including exp claim", () => {
  const previousSecret = process.env.JWT_SECRET;
  const previousExpires = process.env.JWT_EXPIRES_IN;
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "2h";

  const jwtUtils = freshRequire(resolveFromBackend("utils", "jwt"));
  const token = jwtUtils.generateToken({ userId: "user-2" });
  const decoded = jwtUtils.verifyToken(token);

  assert.ok(decoded.exp > decoded.iat);

  process.env.JWT_SECRET = previousSecret;
  process.env.JWT_EXPIRES_IN = previousExpires;
});

test("authMiddleware returns 401 when Authorization header is missing", async () => {
  const authMiddleware = freshRequire(resolveFromBackend("middleware", "authMiddleware"));
  const res = buildRes();
  await authMiddleware({ headers: {} }, res, () => {});
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Unauthorized" });
});

test("authMiddleware returns 401 when token is invalid", async () => {
  const mockPrisma = { user: { findUnique: async () => null } };
  const mockJwt = { verifyToken: () => { throw new Error("bad token"); } };

  const authMiddleware = withMockedDependency(
    resolveFromBackend("config", "prisma"),
    mockPrisma,
    () =>
      withMockedDependency(resolveFromBackend("utils", "jwt"), mockJwt, () =>
        freshRequire(resolveFromBackend("middleware", "authMiddleware"))
      )
  );

  const res = buildRes();
  await authMiddleware({ headers: { authorization: "Bearer bad-token" } }, res, () => {});
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Invalid token" });
});

test("authMiddleware attaches user payload and calls next for valid token", async () => {
  const mockPrisma = {
    user: {
      findUnique: async () => ({
        id: "user-1",
        firstName: "Alice",
        lastName: "Admin",
        email: "admin@example.com",
        role: {
          name: "admin",
          rolePermissions: [{ permission: { key: "jobs.write" } }, { permission: { key: "settings.write" } }],
        },
      }),
    },
  };
  const mockJwt = { verifyToken: () => ({ userId: "user-1" }) };

  const authMiddleware = withMockedDependency(
    resolveFromBackend("config", "prisma"),
    mockPrisma,
    () =>
      withMockedDependency(resolveFromBackend("utils", "jwt"), mockJwt, () =>
        freshRequire(resolveFromBackend("middleware", "authMiddleware"))
      )
  );

  const req = { headers: { authorization: "Bearer good-token" } };
  let nextCalled = false;
  await authMiddleware(req, buildRes(), () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    id: "user-1",
    firstName: "Alice",
    lastName: "Admin",
    email: "admin@example.com",
    role: "admin",
    permissions: ["jobs.write", "settings.write"],
  });
});

test("analyzeResumeText rejects empty text", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const aiService = freshRequire(resolveFromBackend("services", "aiService"));
  await assert.rejects(() => aiService.analyzeResumeText("   "), {
    message: "resumeText is required",
    status: 400,
  });
  process.env.OPENAI_API_KEY = previousKey;
});

test("analyzeResumeText returns fallback analysis when OpenAI is not configured", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const aiService = freshRequire(resolveFromBackend("services", "aiService"));
  const result = await aiService.analyzeResumeText("Senior recruiter with sourcing experience");
  assert.equal(result.configured, false);
  assert.deepEqual(result.skills, []);
  assert.deepEqual(result.experience, []);
  assert.match(result.summary, /OpenAI API key not configured/i);
  process.env.OPENAI_API_KEY = previousKey;
});

test("analyzeResumeFile rejects when filePath is missing", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const aiService = freshRequire(resolveFromBackend("services", "aiService"));
  await assert.rejects(() => aiService.analyzeResumeFile({ filename: "resume.pdf" }), {
    message: "filePath and filename are required",
    status: 400,
  });
  process.env.OPENAI_API_KEY = previousKey;
});

test("analyzeResumeFile returns fallback analysis when OpenAI is not configured", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ats-ai-"));
  const tempFile = path.join(tempDir, "resume.pdf");
  fs.writeFileSync(tempFile, "sample");

  const aiService = freshRequire(resolveFromBackend("services", "aiService"));
  const result = await aiService.analyzeResumeFile({ filePath: tempFile, filename: "resume.pdf" });

  assert.equal(result.configured, false);
  assert.match(result.summary, /OpenAI API key not configured/i);

  fs.rmSync(tempDir, { recursive: true, force: true });
  process.env.OPENAI_API_KEY = previousKey;
});

test("analyzeResumeFile rejects unsupported file types when OpenAI is configured", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";

  const aiService = withMockedDependency("openai", class OpenAI {}, () =>
    freshRequire(resolveFromBackend("services", "aiService"))
  );

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ats-ai-"));
  const tempFile = path.join(tempDir, "resume.exe");
  fs.writeFileSync(tempFile, "sample");

  await assert.rejects(() => aiService.analyzeResumeFile({ filePath: tempFile, filename: "resume.exe" }), {
    message: "Unsupported resume file type for AI analysis",
    status: 400,
  });

  fs.rmSync(tempDir, { recursive: true, force: true });
  process.env.OPENAI_API_KEY = previousKey;
});

test("analyzeResumeFile rejects missing file when OpenAI is configured", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";

  const aiService = withMockedDependency("openai", class OpenAI {}, () =>
    freshRequire(resolveFromBackend("services", "aiService"))
  );

  await assert.rejects(
    () => aiService.analyzeResumeFile({ filePath: path.join(os.tmpdir(), "missing.pdf"), filename: "missing.pdf" }),
    {
      message: "Resume file not found",
      status: 404,
    }
  );

  process.env.OPENAI_API_KEY = previousKey;
});

test("analyzeResume rejects when neither text nor file is provided", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const aiService = freshRequire(resolveFromBackend("services", "aiService"));
  await assert.rejects(() => aiService.analyzeResume({}), {
    message: "Either resumeText or a resume file is required",
    status: 400,
  });
  process.env.OPENAI_API_KEY = previousKey;
});

test("analyzeResume prefers text analysis when text is provided", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const aiService = freshRequire(resolveFromBackend("services", "aiService"));
  const result = await aiService.analyzeResume({ resumeText: "Candidate with sourcing and ATS operations experience" });
  assert.equal(result.configured, false);
  assert.match(result.summary, /OpenAI API key not configured/i);
  process.env.OPENAI_API_KEY = previousKey;
});
