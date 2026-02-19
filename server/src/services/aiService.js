import axios from "axios";
import { env } from "../config/env.js";

export async function predictHealthRisk(features) {
  const response = await axios.post(`${env.aiServiceUrl}/predict-risk`, features, {
    timeout: 10000,
    headers: {
      "Content-Type": "application/json"
    }
  });

  return response.data;
}
