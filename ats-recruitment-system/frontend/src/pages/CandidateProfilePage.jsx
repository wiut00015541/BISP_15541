import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import {
  addCandidateReview,
  fetchCandidateById,
  sendCandidateCommunication,
} from "../services/candidatesService";
import { addInterviewFeedback, scheduleInterview } from "../services/interviewsService";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const emptyReviewForm = {
  content: "",
};

const emptyCommunicationForm = {
  subject: "",
  body: "",
};

const emptyInterviewForm = {
  applicationId: "",
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

const inputClass = (error) =>
  `w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white ${
    error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-cyan-400"
  }`;

const CandidateProfilePage = () => {
  const { id } = useParams();
  const { t, getStageLabel } = useLanguage();
  const notifications = useNotifications();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [communicationForm, setCommunicationForm] = useState(emptyCommunicationForm);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [feedbackForms, setFeedbackForms] = useState({});
  const [errors, setErrors] = useState({});

  const loadCandidate = async () => {
    setLoading(true);
    try {
      const data = await fetchCandidateById(id);
      setCandidate(data);
      setInterviewForm((prev) => ({
        ...prev,
        applicationId: prev.applicationId || data?.applications?.[0]?.id || "",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidate();
  }, [id]);

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
        interviewerId: interviewForm.interviewerId,
        scheduledAt: interviewForm.scheduledAt,
        durationMinutes: Number(interviewForm.durationMinutes || 60),
        meetingLink: interviewForm.meetingLink,
      });
      setInterviewForm({
        ...emptyInterviewForm,
        applicationId: interviewForm.applicationId,
      });
      notifications.success(t("candidates.interviewSuccess"));
      await loadCandidate();
    } catch (error) {
      notifications.error(error?.response?.data?.message || t("common.genericError"));
    }
  };

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

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {candidate ? `${candidate.firstName} ${candidate.lastName}` : t("candidates.profileTitle")}
        </h1>
        <p className="mt-2 text-slate-500">{t("candidates.profileSubtitle")}</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-5">
          <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="space-y-2 text-sm text-slate-600">
              <p>{candidate?.email || "-"}</p>
              <p>{candidate?.phone || "-"}</p>
              <p>{candidate?.source || "-"}</p>
              <p>{candidate?.yearsExperience || 0} years</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
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

          <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-950">{t("candidates.resumeSection")}</h2>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {(candidate?.resumes || []).length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {(candidate?.resumes || []).length === 0 ? (
                <p className="text-sm text-slate-500">{t("candidates.noResumes")}</p>
              ) : null}

              {(candidate?.resumes || []).map((resume) => (
                <div key={resume.id} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
                  <a
                    className="text-sm font-medium text-cyan-700 underline"
                    href={`${apiBaseUrl}${resume.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("candidates.viewResume")}
                  </a>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(resume.createdAt).toLocaleString()}
                    {resume.uploadedBy ? ` | ${resume.uploadedBy.firstName} ${resume.uploadedBy.lastName}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <h2 className="text-xl font-semibold text-slate-950">{t("pipeline.title")}</h2>
            <div className="mt-4 space-y-3">
              {(candidate?.applications || []).map((application) => (
                <Link
                  key={application.id}
                  className="block rounded-[22px] border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-cyan-50/60"
                  to={`/jobs/${application.jobId}`}
                >
                  <p className="font-semibold text-slate-900">{application.job.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{getStageLabel(application.currentStage?.name)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
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
                <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white" type="submit">
                  {t("candidates.addReviewButton")}
                </button>
              </form>

              <div className="mt-5 space-y-3">
                {(candidate?.notes || []).length === 0 ? (
                  <p className="text-sm text-slate-500">{t("candidates.noReviews")}</p>
                ) : null}

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

            <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <h2 className="text-xl font-semibold text-slate-950">{t("candidates.communicationSection")}</h2>
              <form className="mt-4 space-y-3" onSubmit={handleSendCommunication}>
                <input
                  className={inputClass(errors.communicationSubject)}
                  placeholder={t("candidates.communicationSubject")}
                  value={communicationForm.subject}
                  onChange={(event) =>
                    setCommunicationForm((prev) => ({ ...prev, subject: event.target.value }))
                  }
                />
                {errors.communicationSubject ? (
                  <p className="text-sm text-rose-600">{errors.communicationSubject}</p>
                ) : null}
                <textarea
                  className={`${inputClass(errors.communicationBody)} min-h-28`}
                  placeholder={t("candidates.communicationBody")}
                  value={communicationForm.body}
                  onChange={(event) => setCommunicationForm((prev) => ({ ...prev, body: event.target.value }))}
                />
                {errors.communicationBody ? (
                  <p className="text-sm text-rose-600">{errors.communicationBody}</p>
                ) : null}
                <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white" type="submit">
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
                      {communication.sender?.firstName} {communication.sender?.lastName} |{" "}
                      {new Date(communication.sentAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <h2 className="text-xl font-semibold text-slate-950">{t("candidates.interviewsSection")}</h2>
            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleScheduleInterview}>
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
                {errors.interviewApplicationId ? (
                  <p className="text-sm text-rose-600">{errors.interviewApplicationId}</p>
                ) : null}
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
                {errors.interviewInterviewerId ? (
                  <p className="text-sm text-rose-600">{errors.interviewInterviewerId}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <input
                  className={inputClass(errors.interviewScheduledAt)}
                  type="datetime-local"
                  value={interviewForm.scheduledAt}
                  onChange={(event) => setInterviewForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                />
                {errors.interviewScheduledAt ? (
                  <p className="text-sm text-rose-600">{errors.interviewScheduledAt}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <input
                  className={inputClass()}
                  type="number"
                  min="15"
                  step="15"
                  placeholder={t("candidates.interviewDuration")}
                  value={interviewForm.durationMinutes}
                  onChange={(event) =>
                    setInterviewForm((prev) => ({ ...prev, durationMinutes: event.target.value }))
                  }
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
                <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white" type="submit">
                  {t("candidates.scheduleInterviewButton")}
                </button>
              </div>
            </form>

            <div className="mt-5 space-y-3">
              {loading ? <p className="text-sm text-slate-500">{t("common.loading")}</p> : null}
              {!loading && allInterviews.length === 0 ? (
                <p className="text-sm text-slate-500">{t("candidates.noInterviews")}</p>
              ) : null}

              {allInterviews.map((interview) => (
                <div key={interview.id} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
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
                          {feedback.recommendation ? (
                            <p className="mt-1 text-sm text-slate-500">{feedback.recommendation}</p>
                          ) : null}
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
                    {errors[`feedback-${interview.id}`] ? (
                      <p className="text-sm text-rose-600 md:col-span-2">{errors[`feedback-${interview.id}`]}</p>
                    ) : null}
                    <div className="md:col-span-2">
                      <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" type="submit">
                        {t("candidates.addFeedbackButton")}
                      </button>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateProfilePage;
