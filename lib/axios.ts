import axios from "axios";
import { getAccessTokenClient } from "@/utils/supabase/token";

export const API = axios.create({
  baseURL: "https://law-captain-backend.onrender.com/api/v1/",
});

API.interceptors.request.use(
  async (config) => {
    const token = await getAccessTokenClient();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
