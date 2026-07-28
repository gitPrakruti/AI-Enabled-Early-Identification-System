import api from "../api/api";

/*
----------------------------------------
Submit Assessment
----------------------------------------
*/

export const submitAssessment = async (assessmentData) => {

    const response = await api.post(
        "/assessment/submit",
        assessmentData
    );

    return response.data;
};

/*
----------------------------------------
Assessment History
----------------------------------------
*/

export const getAssessmentHistory = async () => {

    const response = await api.get(
        "/assessment/history"
    );

    return response.data;
};

/*
----------------------------------------
Delete Assessment
----------------------------------------
*/

export const deleteAssessment = async (assessmentId) => {

    const response = await api.delete(
        `/assessment/${assessmentId}`
    );

    return response.data;
};