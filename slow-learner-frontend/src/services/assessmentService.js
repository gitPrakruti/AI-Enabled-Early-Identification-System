import api from "../api/api";

export const submitAssessment = async (assessmentData) => {

    const response = await api.post(
        "/assessment",
        assessmentData
    );

    return response.data;

};