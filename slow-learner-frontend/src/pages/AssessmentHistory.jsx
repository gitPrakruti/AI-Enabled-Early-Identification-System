import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAssessmentHistory,
  deleteAssessment,
} from "../services/assessmentService";

function AssessmentHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deleteLoading, setDeleteLoading] = useState("");

  const fetchHistory = async () => {
    try {
      const response = await getAssessmentHistory();

      setHistory(response.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this assessment?"
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);

      await deleteAssessment(id);

      setHistory((prev) => prev.filter((item) => item.id !== id));

      alert("Assessment deleted successfully.");
    } catch (err) {
      console.error(err);

      alert("Unable to delete assessment.");
    } finally {
      setDeleteLoading("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] px-8 py-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">

          Assessment History

        </h1>

        <button
          onClick={() => navigate("/home")}
          className="bg-violet-600 text-white px-5 py-2 rounded-lg"
        >
          Back
        </button>

      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">

          No assessments available.

        </div>
      ) : (
        history.map((assessment, index) => (
          <div
            key={assessment.id}
            className="bg-white rounded-xl shadow p-6 mb-5"
          >
            <div className="flex justify-between">

              <div>

                <h2 className="font-bold text-xl">

                  Assessment #{history.length - index}

                </h2>

                <p className="mt-2">

                  Prediction :

                  <span className="font-semibold ml-2">

                    {assessment.prediction}

                  </span>

                </p>

                <p>

                  Confidence :

                  <span className="ml-2">

                    {assessment.confidence.toFixed(2)}%

                  </span>

                </p>

                <p>

                  Risk Score :

                  <span className="ml-2">

                    {assessment.risk_score.toFixed(2)}

                  </span>

                </p>

                <p>

                  Date :

                  <span className="ml-2">

                    {new Date(
                      assessment.created_at
                    ).toLocaleString()}

                  </span>

                </p>

              </div>

              <div className="flex flex-col justify-center gap-3">

                <button
                  className="bg-blue-600 text-white px-5 py-2 rounded"
                  onClick={() =>
                    navigate("/result", {
                      state: assessment,
                    })
                  }
                >
                  View Report
                </button>

                <button
                  disabled={deleteLoading === assessment.id}
                  onClick={() =>
                    handleDelete(assessment.id)
                  }
                  className="bg-red-600 text-white px-5 py-2 rounded disabled:bg-red-300"
                >
                  {deleteLoading === assessment.id
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default AssessmentHistory;