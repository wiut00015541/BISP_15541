// CandidateProfile screen for the frontend app.
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import { fetchLookups } from "../services/lookupService";
import { revertHiredApplication, updateApplicationStage } from "../services/applicationsService";
import {
  addCandidateReview,
  analyzeCandidateResume,
  fetchCandidateById,
  sendCandidateCommunication,
} from "../services/candidatesService";
import { addInterviewFeedback, scheduleInterview } from "../services/interviewsService";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const emptyReviewForm = {
  content: "",
};

const emptyCommunicationForm = {
  templateId: "",
  subject: "",
  body: "",
};

const emptyInterviewForm = {
  applicationId: "",
  templateCode: "",
  interviewerId: "",
  scheduledAt: "",
  durationMinutes: "60",
  meetingLink: "",
};

const emptyFeedbackForm = {
  rating: "4",
  strengths: "",
  concerns: "",
  recommendation: "",
};

// Keep input class focused and easier to understand from the code nearby.
const inputClass = (error) =>
  `w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white ${
    error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
  }`;

// Keep get stage badge class focused and easier to understand from the code nearby.
const getStageBadgeClass = (stageName) => {
  const normalized = String(stageName || "").toLowerCase();

  if (normalized === "hired") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (normalized === "withdrawn" || normalized === "rejected") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  if (normalized === "offer") {
    return "bg-violet-50 text-violet-700 border-violet-200";
  }

  if (normalized === "interview") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (normalized === "screening") {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
};

// Render the candidate profile page and keep its local UI behavior together.
const CandidateProfilePage = () => {
  const { id } = useParams();
  const { t, getStageLabel } = useLanguage();
  const notifications = useNotifications();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [communicationForm, setCommunicationForm] = useState(emptyCommunicationForm);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [feedbackForms, setFeedbackForms] = useState({});
  const [errors, setErrors] = useState({});
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [analyzingResumeId, setAnalyzingResumeId] = useState("");
  const [stageActionId, setStageActionId] = useState("");

  const tabs = [
    { key: "overview", label: t("candidates.overviewTab") },
    { key: "resume", label: t("candidates.resumeSection") },
    { key: "reviews", label: t("candidates.reviewsSection") },
    { key: "communication", label: t("candidates.communicationSection") },
    { key: "interviews", label: t("candidates.interviewsSection") },
    { key: "applications", label: t("pipeline.title") },
  ];

  // Keep load candidate focused and easier to understand from the code nearby.
  const loadCandidate = async () => {
    setLoading(true);
    try {
      const data = await fetchCandidateById(id);
      setCandidate(data);
      setSelectedResumeId((prev) => prev || data?.resumes?.[0]?.id || null);
      setInterviewForm((prev) => ({
        ...prev,
        applicationId: prev.applicationId || data?.applications?.[0]?.id || "",
        templateCode: prev.templateCode || "interview_invitation",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidate();
  }, [id]);

  useEffect(() => {
    // Keep load lookups focused and easier to understand from the code nearby.
    const loadLookups = async () => {
      const data = await fetchLookups();
      setEmailTemplates(data.emailTemplates || []);
    };

    loadLookups();
  }, []);

  const allInterviews = useMemo(() => {
    if (!candidate?.applications?.length) {
      return [];
    }

    return candidate.applications.flatMap((application) =>
      (application.interviews || []).map((interview) => ({
        ...interview,
        applicationId: application.id,
        jobTitle: application.job?.title,
      }))
    );
  }, [candidate]);

  const interviewerOptions = useMemo(() => {
    const map = new Map();

    for (const application of candidate?.applications || []) {
      const recruiter = application.job?.recruiter;
      const hiringManager = application.job?.hiringManager;

      if (recruiter?.id) {
        map.set(recruiter.id, recruiter);
      }

      if (hiringManager?.id) {
        map.set(hiringManager.id, hiringManager);
      }
    }

    return Array.from(map.values());
  }, [candidate]);

  const getFeedbackForm = (interviewId) => feedbackForms[interviewId] || emptyFeedbackForm;

  // Keep interpolate template focused and easier to understand from the code nearby.
  const interpolateTemplate = (value, template = {}) => {
    const primaryApplication = candidate?.applications?.[0];
    const formattedDate = interviewForm.scheduledAt
      ? new Date(interviewForm.scheduledAt).toLocaleString()
      : "";

    const variables = {
      candidateFirstName: candidate?.firstName || "",
      candidateLastName: candidate?.lastName || "",
      jobTitle: primaryApplication?.job?.title || "",
      formattedDate,
      senderName: "",
    };

    return String(value || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, token) => {
      if (token in variables) {
        return variables[token];
      }
      return template[token] || "";
    });
  };

  const selectedResume = useMemo(
    () => (candidate?.resumes || []).find((resume) => resume.id === selectedResumeId) || candidate?.resumes?.[0] || null,
    [candidate, selectedResumeId]
  );

  // Keep get resume extension focused and easier to understand from the code nearby.
  const getResumeExtension = (resume) => {
    const fileUrl = resume?.fileUrl || "";
    const cleanUrl = fileUrl.split("?")[0];
    const parts = cleanUrl.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  };

  // Keep is inline preview supported focused and easier to understand from the code nearby.
  const isInlinePreviewSupported = (resume) => {
    const extension = getResumeExtension(resume);
    return ["pdf", "png", "jpg", "jpeg"].includes(extension);
  };

  // Handle add review for this screen or component.
  const handleAddReview = async (event) => {
    event.preventDefault();
    if (!reviewForm.content.trim()) {
      setErrors((prev) => ({ ...prev, review: t("candidates.reviewValidation") }));
      notifications.error(t("common.validationFix"));
      return;
    }

    try {
      await addCandidateReview(id, { content: reviewForm.content.trim(), isPrivate: false });
      setReviewForm(emptyReviewForm);
      setErrors((prev) => ({ ...prev, review: "" }));
      notifications.success(t("candidates.reviewSuccess"));
      await loadCandidate();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    }
  };

  // Handle analyze resume for this screen or component.
  const handleAnalyzeResume = async () => {
    if (!selectedResume?.id) {
      return;
    }

    setAnalyzingResumeId(selectedResume.id);
    try {
      const result = await analyzeCandidateResume(id, selectedResume.id);
      if (result?.resume?.id) {
        setCandidate((prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            resumes: (prev.resumes || []).map((resume) => (resume.id === result.resume.id ? result.resume : resume)),
          };
        });
      }
      notifications.success(
        result?.analysis?.configured === false
          ? result.analysis.summary || t("candidates.resumeAiNotConfigured")
          : t("candidates.resumeAnalysisSuccess")
      );
      await loadCandidate();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    } finally {
      setAnalyzingResumeId("");
    }
  };

  // Handle send communication for this screen or component.
  const handleSendCommunication = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!communicationForm.subject.trim()) {
      nextErrors.communicationSubject = t("candidates.communicationSubjectValidation");
    }

    if (!communicationForm.body.trim()) {
      nextErrors.communicationBody = t("candidates.communicationBodyValidation");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      notifications.error(t("common.validationFix"));
      return;
    }

    try {
      await sendCandidateCommunication(id, communicationForm);
      setCommunicationForm(emptyCommunicationForm);
      setErrors((prev) => ({ ...prev, communicationSubject: "", communicationBody: "" }));
      notifications.success(t("candidates.communicationSuccess"));
      await loadCandidate();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    }
  };

  // Handle schedule interview for this screen or component.
  const handleScheduleInterview = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!interviewForm.applicationId) {
      nextErrors.interviewApplicationId = t("candidates.interviewApplicationValidation");
    }
    if (!interviewForm.interviewerId) {
      nextErrors.interviewInterviewerId = t("candidates.interviewInterviewerValidation");
    }
    if (!interviewForm.scheduledAt) {
      nextErrors.interviewScheduledAt = t("candidates.interviewDateValidation");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      notifications.error(t("common.validationFix"));
      return;
    }

    try {
      await scheduleInterview(interviewForm.applicationId, {
        templateCode: interviewForm.templateCode || "interview_invitation",
        interviewerId: interviewForm.interviewerId,
        scheduledAt: interviewForm.scheduledAt,
        durationMinutes: Number(interviewForm.durationMinutes || 60),
        meetingLink: interviewForm.meetingLink,
      });
      setInterviewForm({
        ...emptyInterviewForm,
        applicationId: interviewForm.applicationId,
        templateCode: interviewForm.templateCode || "interview_invitation",
      });
      notifications.success(t("candidates.interviewSuccess"));
      await loadCandidate();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    }
  };

  // Handle interview feedback for this screen or component.
  const handleInterviewFeedback = async (event, interviewId) => {
    event.preventDefault();
    const form = getFeedbackForm(interviewId);
    const nextErrors = {};

    if (!form.rating || Number(form.rating) < 1 || Number(form.rating) > 5) {
      nextErrors[`feedback-${interviewId}`] = t("candidates.feedbackRatingValidation");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      notifications.error(t("common.validationFix"));
      return;
    }

    try {
      await addInterviewFeedback(interviewId, {
        rating: Number(form.rating),
        strengths: form.strengths,
        concerns: form.concerns,
        recommendation: form.recommendation,
      });
      setFeedbackForms((prev) => ({
        ...prev,
        [interviewId]: emptyFeedbackForm,
      }));
      setErrors((prev) => ({ ...prev, [`feedback-${interviewId}`]: "" }));
      notifications.success(t("candidates.feedbackSuccess"));
      await loadCandidate();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    }
  };

  // Handle application stage action for this screen or component.
  const handleApplicationStageAction = async (applicationId, stage, note) => {
    const confirmationMessage =
      stage === "Hired" ? t("candidates.markHiredConfirm") : t("candidates.markWithdrawnConfirm");

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setStageActionId(`${applicationId}:${stage}`);
    try {
      await updateApplicationStage(applicationId, stage, note);
      notifications.success(
        stage === "Hired" ? t("candidates.markHiredSuccess") : t("candidates.markWithdrawnSuccess")
      );
      await loadCandidate();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    } finally {
      setStageActionId("");
    }
  };

  // Handle revert hired for this screen or component.
  const handleRevertHired = async (applicationId) => {
    if (!window.confirm(t("candidates.revertHiredConfirm"))) {
      return;
    }

    setStageActionId(`${applicationId}:RevertHired`);
    try {
      await revertHiredApplication(applicationId);
      notifications.success(t("candidates.revertHiredSuccess"));
      await loadCandidate();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    } finally {
      setStageActionId("");
    }
  };

  const renderOverview = () => (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-5">
        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-semibold text-slate-950">{t("candidates.contactSection")}</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("candidates.email")}</p>
              {candidate?.email ? (
                <a className="mt-1 inline-flex font-medium text-cyan-700 underline" href={`mailto:${candidate.email}`}>
                  {candidate.email}
                </a>
              ) : (
                <p className="mt-1">{t("jobs.notSpecified")}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("candidates.phone")}</p>
              {candidate?.phone ? (
                <a className="mt-1 inline-flex font-medium text-cyan-700 underline" href={`tel:${candidate.phone}`}>
                  {candidate.phone}
                </a>
              ) : (
                <p className="mt-1">{t("jobs.notSpecified")}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("candidates.source")}</p>
              <p className="mt-1">{candidate?.source || t("jobs.notSpecified")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("candidates.yearsExperience")}</p>
              <p className="mt-1">{candidate?.yearsExperience || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-semibold text-slate-950">{t("candidates.skillsSection")}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(candidate?.skills || []).length === 0 ? (
              <p className="text-sm text-slate-500">{t("common.noData")}</p>
            ) : null}
            {(candidate?.skills || []).map((candidateSkill) => (
              <span
                key={candidateSkill.id}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {candidateSkill.skill?.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-semibold text-slate-950">{t("candidates.profileSnapshot")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("candidates.firstName")}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{candidate?.firstName || "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("candidates.lastName")}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{candidate?.lastName || "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("candidates.applicationsCount")}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{candidate?.applications?.length || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("candidates.resumeCount")}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{candidate?.resumes?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResume = () => (
    <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)]">
      <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">{t("candidates.resumeSection")}</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{(candidate?.resumes || []).length}</span>
        </div>

        <div className="mt-4 space-y-3">
          {(candidate?.resumes || []).length === 0 ? <p className="text-sm text-slate-500">{t("candidates.noResumes")}</p> : null}

          {(candidate?.resumes || []).map((resume, index) => {
            const isActive = selectedResume?.id === resume.id;
            return (
              <button
                key={resume.id}
                type="button"
                className={`block w-full rounded-[22px] border p-4 text-left transition ${
                  isActive ? "border-cyan-200 bg-cyan-50/70" : "border-slate-100 bg-slate-50/70 hover:bg-slate-100/80"
                }`}
                onClick={() => setSelectedResumeId(resume.id)}
              >
                <p className="text-sm font-semibold text-slate-900">
                  {t("candidates.resumeFileLabel")} {index + 1}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(resume.createdAt).toLocaleString()}
                  {resume.uploadedBy ? ` | ${resume.uploadedBy.firstName} ${resume.uploadedBy.lastName}` : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{t("candidates.resumePreviewTitle")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("candidates.resumePreviewSubtitle")}</p>
          </div>
          {selectedResume ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700"
                onClick={handleAnalyzeResume}
                disabled={analyzingResumeId === selectedResume.id}
              >
                {analyzingResumeId === selectedResume.id
                  ? t("candidates.analyzingResume")
                  : t("candidates.analyzeResumeButton")}
              </button>
              {selectedResume.fileUrl ? (
                <>
                  <a
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                    href={`${apiBaseUrl}${selectedResume.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("candidates.viewResume")}
                  </a>
                  <a
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                    href={`${apiBaseUrl}${selectedResume.fileUrl}`}
                    download
                  >
                    {t("candidates.downloadResume")}
                  </a>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          {!selectedResume ? (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-sm text-slate-500">
              {t("candidates.noResumes")}
            </div>
          ) : (
            <div className="space-y-5">
              {selectedResume.parsedAt ||
              selectedResume.aiSummary ||
              (selectedResume.aiSkills || []).length ||
              (selectedResume.aiExperience || []).length ? (
                <div className="rounded-[24px] border border-cyan-100 bg-cyan-50/40 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{t("candidates.resumeAiSectionTitle")}</h3>
                      <p className="mt-1 text-sm text-slate-500">{t("candidates.resumeAiSectionSubtitle")}</p>
                    </div>
                    {selectedResume.parsedAt ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {new Date(selectedResume.parsedAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  {selectedResume.aiSummary ? (
                    <div className="mt-4 rounded-[20px] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {t("candidates.resumeAiSummary")}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{selectedResume.aiSummary}</p>
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[20px] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {t("candidates.resumeAiSkills")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(selectedResume.aiSkills || []).length === 0 ? (
                          <p className="text-sm text-slate-500">{t("candidates.resumeAiEmptySkills")}</p>
                        ) : (
                          (selectedResume.aiSkills || []).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                            >
                              {skill}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-[20px] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {t("candidates.resumeAiExperience")}
                      </p>
                      <div className="mt-3 space-y-3">
                        {(selectedResume.aiExperience || []).length === 0 ? (
                          <p className="text-sm text-slate-500">{t("candidates.resumeAiEmptyExperience")}</p>
                        ) : (
                          (selectedResume.aiExperience || []).map((entry, index) => (
                            <div key={`${entry.company}-${entry.role}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                              <p className="text-sm font-semibold text-slate-900">{entry.role || t("jobs.notSpecified")}</p>
                              <p className="mt-1 text-sm text-slate-600">{entry.company || t("jobs.notSpecified")}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                                {entry.duration || t("jobs.notSpecified")}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-cyan-200 bg-cyan-50/40 p-6 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">{t("candidates.resumeAiEmptyTitle")}</p>
                  <p className="mt-2">{t("candidates.resumeAiEmptyDescription")}</p>
                </div>
              )}

              {selectedResume.fileUrl && isInlinePreviewSupported(selectedResume) ? (
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                  <iframe
                    title={t("candidates.resumePreviewTitle")}
                    src={`${apiBaseUrl}${selectedResume.fileUrl}`}
                    className="h-[720px] w-full bg-white"
                  />
                </div>
              ) : selectedResume.fileUrl ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-sm text-slate-500">
                  <p>{t("candidates.resumePreviewUnavailable")}</p>
                  <p className="mt-2">{t("candidates.resumePreviewDownloadHint")}</p>
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-sm text-slate-500">
                  <p>{t("candidates.resumePreviewMissingFile")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <h2 className="text-xl font-semibold text-slate-950">{t("candidates.reviewsSection")}</h2>
      <form className="mt-4 space-y-3" onSubmit={handleAddReview}>
        <textarea
          className={`${inputClass(errors.review)} min-h-28`}
          placeholder={t("candidates.reviewPlaceholder")}
          value={reviewForm.content}
          onChange={(event) => setReviewForm({ content: event.target.value })}
        />
        {errors.review ? <p className="text-sm text-rose-600">{errors.review}</p> : null}
        <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white sm:w-auto" type="submit">
          {t("candidates.addReviewButton")}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {(candidate?.notes || []).length === 0 ? <p className="text-sm text-slate-500">{t("candidates.noReviews")}</p> : null}

        {(candidate?.notes || []).map((note) => (
          <div key={note.id} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-sm text-slate-700">{note.content}</p>
            <p className="mt-2 text-xs text-slate-500">
              {note.author?.firstName} {note.author?.lastName} | {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCommunication = () => (
    <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{t("candidates.communicationSection")}</h2>
          <p className="mt-2 text-sm text-slate-500">{t("candidates.gmailHint")}</p>
        </div>
        {candidate?.email ? (
          <a className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-cyan-700" href={`mailto:${candidate.email}`}>
            {t("candidates.emailCandidateButton")}
          </a>
        ) : null}
      </div>

      <form className="mt-4 space-y-3" onSubmit={handleSendCommunication}>
        <select
          className={inputClass()}
          value={communicationForm.templateId}
          onChange={(event) => {
            const nextTemplateId = event.target.value;
            const selectedTemplate = emailTemplates.find(
              (template) => template.id === nextTemplateId || template.code === nextTemplateId
            );

            if (!selectedTemplate) {
              setCommunicationForm((prev) => ({ ...prev, templateId: "", subject: "", body: "" }));
              return;
            }

            setCommunicationForm((prev) => ({
              ...prev,
              templateId: nextTemplateId,
              subject: interpolateTemplate(selectedTemplate.subject, selectedTemplate),
              body: interpolateTemplate(selectedTemplate.intro, selectedTemplate),
            }));
          }}
        >
          <option value="">{t("candidates.selectEmailTemplate")}</option>
          {emailTemplates.map((template) => (
            <option key={template.id || template.code} value={template.id || template.code}>
              {template.name}
            </option>
          ))}
        </select>
        <input
          className={inputClass(errors.communicationSubject)}
          placeholder={t("candidates.communicationSubject")}
          value={communicationForm.subject}
          onChange={(event) => setCommunicationForm((prev) => ({ ...prev, subject: event.target.value }))}
        />
        {errors.communicationSubject ? <p className="text-sm text-rose-600">{errors.communicationSubject}</p> : null}
        <textarea
          className={`${inputClass(errors.communicationBody)} min-h-28`}
          placeholder={t("candidates.communicationBody")}
          value={communicationForm.body}
          onChange={(event) => setCommunicationForm((prev) => ({ ...prev, body: event.target.value }))}
        />
        {errors.communicationBody ? <p className="text-sm text-rose-600">{errors.communicationBody}</p> : null}
        <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white sm:w-auto" type="submit">
          {t("candidates.sendEmailButton")}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {(candidate?.communications || []).length === 0 ? (
          <p className="text-sm text-slate-500">{t("candidates.noCommunications")}</p>
        ) : null}

        {(candidate?.communications || []).map((communication) => (
          <div key={communication.id} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-900">{communication.subject}</p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {t("candidates.communicationStatusSent")}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{communication.body}</p>
            <p className="mt-2 text-xs text-slate-500">
              {communication.sender?.firstName} {communication.sender?.lastName} | {new Date(communication.sentAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInterviews = () => (
    <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{t("candidates.interviewsSection")}</h2>
        <p className="mt-2 text-sm text-slate-500">{t("candidates.interviewEmailHint")}</p>
      </div>

      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleScheduleInterview}>
        <div className="space-y-2 md:col-span-2">
          <select
            className={inputClass()}
            value={interviewForm.templateCode}
            onChange={(event) => setInterviewForm((prev) => ({ ...prev, templateCode: event.target.value }))}
          >
            <option value="interview_invitation">{t("candidates.defaultInterviewTemplate")}</option>
            {emailTemplates
              .filter((template) => (template.code || template.id) !== "interview_invitation")
              .map((template) => (
              <option key={template.id || template.code} value={template.code || template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <select
            className={inputClass(errors.interviewApplicationId)}
            value={interviewForm.applicationId}
            onChange={(event) => setInterviewForm((prev) => ({ ...prev, applicationId: event.target.value }))}
          >
            <option value="">{t("candidates.interviewApplication")}</option>
            {(candidate?.applications || []).map((application) => (
              <option key={application.id} value={application.id}>
                {application.job?.title}
              </option>
            ))}
          </select>
          {errors.interviewApplicationId ? <p className="text-sm text-rose-600">{errors.interviewApplicationId}</p> : null}
        </div>

        <div className="space-y-2">
          <select
            className={inputClass(errors.interviewInterviewerId)}
            value={interviewForm.interviewerId}
            onChange={(event) => setInterviewForm((prev) => ({ ...prev, interviewerId: event.target.value }))}
          >
            <option value="">{t("candidates.interviewInterviewer")}</option>
            {interviewerOptions.map((interviewer) => (
              <option key={interviewer.id} value={interviewer.id}>
                {interviewer.firstName} {interviewer.lastName}
              </option>
            ))}
          </select>
          {errors.interviewInterviewerId ? <p className="text-sm text-rose-600">{errors.interviewInterviewerId}</p> : null}
        </div>

        <div className="space-y-2">
          <input
            className={inputClass(errors.interviewScheduledAt)}
            type="datetime-local"
            value={interviewForm.scheduledAt}
            onChange={(event) => setInterviewForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
          />
          {errors.interviewScheduledAt ? <p className="text-sm text-rose-600">{errors.interviewScheduledAt}</p> : null}
        </div>

        <div className="space-y-2">
          <input
            className={inputClass()}
            type="number"
            min="15"
            step="15"
            placeholder={t("candidates.interviewDuration")}
            value={interviewForm.durationMinutes}
            onChange={(event) => setInterviewForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <input
            className={inputClass()}
            placeholder={t("candidates.interviewMeetingLink")}
            value={interviewForm.meetingLink}
            onChange={(event) => setInterviewForm((prev) => ({ ...prev, meetingLink: event.target.value }))}
          />
        </div>

        <div className="md:col-span-2">
          <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white sm:w-auto" type="submit">
            {t("candidates.scheduleInterviewButton")}
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {loading ? <p className="text-sm text-slate-500">{t("common.loading")}</p> : null}
        {!loading && allInterviews.length === 0 ? <p className="text-sm text-slate-500">{t("candidates.noInterviews")}</p> : null}

        {allInterviews.map((interview) => (
          <div key={interview.id} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{interview.jobTitle}</p>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                {interview.status || t("candidates.interviewStatusScheduled")}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {new Date(interview.scheduledAt).toLocaleString()} | {interview.durationMinutes} min
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {interview.interviewer?.firstName} {interview.interviewer?.lastName}
            </p>
            {interview.meetingLink ? (
              <a
                className="mt-2 inline-flex text-sm font-medium text-cyan-700 underline"
                href={interview.meetingLink}
                target="_blank"
                rel="noreferrer"
              >
                {t("candidates.interviewMeetingLink")}
              </a>
            ) : null}

            {(interview.feedback || []).length > 0 ? (
              <div className="mt-3 space-y-2">
                {(interview.feedback || []).map((feedback) => (
                  <div key={feedback.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-sm font-medium text-slate-900">
                      {feedback.reviewer?.firstName} {feedback.reviewer?.lastName} | {feedback.rating}/5
                    </p>
                    {feedback.strengths ? <p className="mt-1 text-sm text-slate-700">{feedback.strengths}</p> : null}
                    {feedback.concerns ? <p className="mt-1 text-sm text-slate-500">{feedback.concerns}</p> : null}
                    {feedback.recommendation ? <p className="mt-1 text-sm text-slate-500">{feedback.recommendation}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}

            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => handleInterviewFeedback(event, interview.id)}>
              <div className="space-y-2">
                <input
                  className={inputClass(errors[`feedback-${interview.id}`])}
                  type="number"
                  min="1"
                  max="5"
                  placeholder={t("candidates.feedbackRating")}
                  value={getFeedbackForm(interview.id).rating}
                  onChange={(event) =>
                    setFeedbackForms((prev) => ({
                      ...prev,
                      [interview.id]: {
                        ...getFeedbackForm(interview.id),
                        rating: event.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <textarea
                  className={`${inputClass()} min-h-20`}
                  placeholder={t("candidates.feedbackStrengths")}
                  value={getFeedbackForm(interview.id).strengths}
                  onChange={(event) =>
                    setFeedbackForms((prev) => ({
                      ...prev,
                      [interview.id]: {
                        ...getFeedbackForm(interview.id),
                        strengths: event.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <textarea
                  className={`${inputClass()} min-h-20`}
                  placeholder={t("candidates.feedbackConcerns")}
                  value={getFeedbackForm(interview.id).concerns}
                  onChange={(event) =>
                    setFeedbackForms((prev) => ({
                      ...prev,
                      [interview.id]: {
                        ...getFeedbackForm(interview.id),
                        concerns: event.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <input
                  className={inputClass()}
                  placeholder={t("candidates.feedbackRecommendation")}
                  value={getFeedbackForm(interview.id).recommendation}
                  onChange={(event) =>
                    setFeedbackForms((prev) => ({
                      ...prev,
                      [interview.id]: {
                        ...getFeedbackForm(interview.id),
                        recommendation: event.target.value,
                      },
                    }))
                  }
                />
              </div>
              {errors[`feedback-${interview.id}`] ? <p className="text-sm text-rose-600 md:col-span-2">{errors[`feedback-${interview.id}`]}</p> : null}
              <div className="md:col-span-2">
                <button className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 sm:w-auto" type="submit">
                  {t("candidates.addFeedbackButton")}
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <h2 className="text-xl font-semibold text-slate-950">{t("pipeline.title")}</h2>
      <div className="mt-4 space-y-3">
        {(candidate?.applications || []).length === 0 ? <p className="text-sm text-slate-500">{t("common.noData")}</p> : null}
        {(candidate?.applications || []).map((application) => (
          <div key={application.id} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <Link className="block transition hover:text-cyan-700" to={`/jobs/${application.jobId}`}>
                  <p className="font-semibold text-slate-900">{application.job.title}</p>
                </Link>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStageBadgeClass(
                    application.currentStage?.name
                  )}`}
                >
                  {getStageLabel(application.currentStage?.name)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {application.currentStage?.isTerminal &&
                String(application.currentStage?.name || "").toLowerCase() !== "hired" ? (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500">
                    {t("candidates.terminalStageLocked")}
                  </span>
                ) : null}
                {String(application.currentStage?.name || "").toLowerCase() === "hired" ? (
                  <button
                    type="button"
                    className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 disabled:opacity-60"
                    onClick={() => handleRevertHired(application.id)}
                    disabled={stageActionId === `${application.id}:RevertHired`}
                  >
                    {stageActionId === `${application.id}:RevertHired`
                      ? t("candidates.updatingStatus")
                      : t("candidates.revertHiredButton")}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 disabled:opacity-60"
                  onClick={() =>
                    handleApplicationStageAction(application.id, "Withdrawn", "Candidate marked as withdrawn from profile")
                  }
                  disabled={
                    stageActionId === `${application.id}:Withdrawn` || application.currentStage?.isTerminal
                  }
                >
                  {stageActionId === `${application.id}:Withdrawn`
                    ? t("candidates.updatingStatus")
                    : t("candidates.markWithdrawnButton")}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  onClick={() =>
                    handleApplicationStageAction(application.id, "Hired", "Candidate marked as hired from profile")
                  }
                  disabled={stageActionId === `${application.id}:Hired` || application.currentStage?.isTerminal}
                >
                  {stageActionId === `${application.id}:Hired`
                    ? t("candidates.updatingStatus")
                    : t("candidates.markHiredButton")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Keep render active tab focused and easier to understand from the code nearby.
  const renderActiveTab = () => {
    if (loading && !candidate) {
      return (
        <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 text-sm text-slate-500 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          {t("common.loading")}
        </div>
      );
    }

    switch (activeTab) {
      case "resume":
        return renderResume();
      case "reviews":
        return renderReviews();
      case "communication":
        return renderCommunication();
      case "interviews":
        return renderInterviews();
      case "applications":
        return renderApplications();
      case "overview":
      default:
        return renderOverview();
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {candidate ? `${candidate.firstName} ${candidate.lastName}` : t("candidates.profileTitle")}
        </h1>
        <p className="mt-2 text-slate-500">{t("candidates.profileSubtitle")}</p>
      </div>

      <div className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {renderActiveTab()}
    </section>
  );
};

export default CandidateProfilePage;
