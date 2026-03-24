import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PipelineBoard from "../components/PipelineBoard";
import { useLanguage } from "../i18n.jsx";
import { useNotifications } from "../notifications.jsx";
import { fetchApplications, updateApplicationStage } from "../services/applicationsService";
import { fetchJobById } from "../services/jobsService";

const stages = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

const JobPipelinePage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const notifications = useNotifications();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [movingApplicationId, setMovingApplicationId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [jobData, applicationData] = await Promise.all([
        fetchJobById(id),
        fetchApplications({ jobId: id, page: 1, limit: 200 }),
      ]);
      setJob(jobData);
      setApplications(applicationData.data || []);
    };

    load();
  }, [id]);

  const boardData = useMemo(() => {
    return stages.map((stageName) => ({
      stage: stageName,
      applications: applications.filter((item) => item.currentStage?.name === stageName),
    }));
  }, [applications]);

  const handleMove = async (applicationId, nextStage) => {
    const previousApplications = applications;
    const targetApplication = applications.find((item) => item.id === applicationId);
    if (!targetApplication) {
      return;
    }

    setMovingApplicationId(applicationId);
    setApplications((current) =>
      current.map((item) =>
        item.id === applicationId
          ? {
              ...item,
              currentStage: {
                ...item.currentStage,
                name: nextStage,
              },
            }
          : item
      )
    );

    try {
      await updateApplicationStage(applicationId, nextStage, `Moved to ${nextStage} from pipeline board`);
      notifications.success(t("common.successStageUpdated"));
    } catch (_error) {
      setApplications(previousApplications);
      notifications.error(t("common.genericError"));
    } finally {
      setMovingApplicationId(null);
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{job?.title || t("jobs.pipelineTitle")}</h1>
        <p className="mt-2 text-slate-500">{t("jobs.pipelineSubtitle")}</p>
        <p className="mt-2 text-sm text-cyan-700">{t("pipeline.dragHint")}</p>
      </div>
      <PipelineBoard
        items={boardData}
        candidateLinkBase="/candidates"
        onMove={handleMove}
        movingApplicationId={movingApplicationId}
      />
    </section>
  );
};

export default JobPipelinePage;
