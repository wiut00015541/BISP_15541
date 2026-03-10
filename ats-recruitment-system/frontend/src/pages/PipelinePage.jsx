import { useEffect, useMemo, useState } from "react";
import PipelineBoard from "../components/PipelineBoard";
import { fetchApplications } from "../services/applicationsService";

const stages = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

const PipelinePage = () => {
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
    <section>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Application Pipeline</h1>
      <PipelineBoard items={boardData} />
    </section>
  );
};

export default PipelinePage;
