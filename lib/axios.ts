import axios from "axios";
import { getAccessTokenClient } from "@/utils/supabase/token";

export async function createAPI() {
  // Wait for the token
  const token = await getAccessTokenClient();

  // Return a new Axios instance with the token
  return axios.create({
    baseURL: "https://law-captain-backend.onrender.com/api/v1/",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
