import axios from "axios";
import { resolveApiBase } from "../utils/apiBase";

const scholarshipApi = axios.create({
  baseURL: resolveApiBase(),
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginScholarshipSubscriber = async ({ msisdn, pin }) => {
  const { data } = await scholarshipApi.post("/login", {
    msisdn,
    pin
  });
  return data;
};

export const getScholarshipDashboard = async (token) => {
  const { data } = await scholarshipApi.get("/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const sendStopAndDeactivate = async ({ msisdn }) => {
  const { data } = await scholarshipApi.post("/sms", {
    msisdn,
    message: "STOP"
  });
  return data;
};
