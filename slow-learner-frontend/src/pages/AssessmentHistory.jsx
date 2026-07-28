import { useEffect, useState } from "react";

import {
    getAssessmentHistory,
    deleteAssessment
} from "../services/assessmentService";

function AssessmentHistory() {

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {

        fetchHistory();

    }, []);

    const fetchHistory = async () => {

        try {

            const response =
                await getAssessmentHistory();

            setHistory(response.history);

        }

        catch (err) {

            console.error(err);

            setError("Unable to load history.");

        }

        finally {

            setLoading(false);

        }

    };

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Delete this assessment?"
            );

        if (!confirmDelete) return;

        try {

            await deleteAssessment(id);

            fetchHistory();

        }

        catch (err) {

            console.error(err);

            alert("Deletion failed.");

        }

    };

    if (loading)

        return <h2>Loading...</h2>;

    if (error)

        return <h2>{error}</h2>;

    if (history.length === 0)

        return <h2>No assessments found.</h2>;

    return (

        <div className="p-8">

            <h1 className="text-3xl font-bold mb-8">

                Assessment History

            </h1>

            {

                history.map((assessment) => (

                    <div
                        key={assessment.id}
                        className="border rounded-lg p-5 mb-5 shadow"
                    >

                        <h2>

                            Prediction :

                            {" "}

                            {assessment.prediction}

                        </h2>

                        <p>

                            Confidence :

                            {" "}

                            {assessment.confidence}%

                        </p>

                        <p>

                            Risk Score :

                            {" "}

                            {assessment.risk_score}

                        </p>

                        <p>

                            Date :

                            {" "}

                            {

                                new Date(

                                    assessment.created_at

                                ).toLocaleDateString()

                            }

                        </p>

                        <button

                            className="bg-red-600 text-white px-4 py-2 mt-4 rounded"

                            onClick={() =>
                                handleDelete(
                                    assessment.id
                                )
                            }

                        >

                            Delete

                        </button>

                    </div>

                ))

            }

        </div>

    );

}

export default AssessmentHistory;