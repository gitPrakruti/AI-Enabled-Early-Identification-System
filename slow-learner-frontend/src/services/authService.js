import api from "../api/api";

export const signupUser = async (userData) => {
    const response = await api.post("/signup", userData);
    return response.data;
};

export const loginUser = async (loginData) => {
    const response = await api.post("/login", loginData);
    return response.data;
};