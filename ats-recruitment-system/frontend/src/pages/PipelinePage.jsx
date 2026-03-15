import { useEffect, useMemo, useState } from "react";
import PipelineBoard from "../components/PipelineBoard";
import { useLanguage } from "../i18n";
import { fetchApplications } from "../services/applicationsService";

const stages = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

const PipelinePage = () => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetchApplications({ page: 1, limit: 200 });
      setApplications(response.data);
    };

    load();
  }, []);

  const boardData = useMemo(() => {
    return stages.map((stageName) => ({
      stage: stageName,
      applications: applications.filter((item) => item.currentStage?.name === stageName),
    }));
  }, [applications]);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("pipeline.title")}</h1>
        <p className="mt-2 text-slate-500">{t("pipeline.subtitle")}</p>
      </div>
      <PipelineBoard items={boardData} />
    </section>
  );
};

export default PipelinePage;
