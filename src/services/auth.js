
import api from "./api";

export const registerApi = (payload) => api.post("/auth/register", payload);
export const loginApi = (payload) => api.post("/auth/login", payload);
export const googleApi = (idToken) => api.post("/auth/google", { idToken });
export const meApi = () => api.get("/auth/me");
export const logoutApi = () => api.post("/auth/logout");
