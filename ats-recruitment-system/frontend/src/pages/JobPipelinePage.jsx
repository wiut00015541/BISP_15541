import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PipelineBoard from "../components/PipelineBoard";
import { useLanguage } from "../i18n.jsx";
import { fetchApplications } from "../services/applicationsService";
import { fetchJobById } from "../services/jobsService";

const stages = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

const JobPipelinePage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);

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

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{job?.title || t("jobs.pipelineTitle")}</h1>
        <p className="mt-2 text-slate-500">{t("jobs.pipelineSubtitle")}</p>
      </div>
      <PipelineBoard items={boardData} candidateLinkBase="/candidates" />
    </section>
  );
};

export default JobPipelinePage;
