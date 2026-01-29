import { useEffect, useState } from "react";

const STORAGE_KEY = "employerDashboard.v1";

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied", color: "blue" },
  { value: "interviewed", label: "Interviewed", color: "orange" },
  { value: "exam", label: "Exam", color: "purple" },
  { value: "started", label: "Started Job", color: "teal" },
  { value: "agreed", label: "Agreed", color: "green" },
  { value: "not_agreed", label: "Not agreed", color: "red" },
];

const DEFAULT_DATA = {
  jobs: [
    {
      id: "job-101",
      title: "Customer Support Specialist",
      department: "Customer Success",
      location: "Addis Ababa",
      type: "Full-time",
      salary: "ETB 12,000 - 16,000",
      deadline: "2026-02-15",
      description: "Handle inbound support tickets and support onboarding sessions.",
      postedAt: "2026-01-20T09:30:00.000Z",
    },
    {
      id: "job-102",
      title: "Sales Coordinator",
      department: "Sales",
      location: "Remote",
      type: "Contract",
      salary: "ETB 15,000 - 20,000",
      deadline: "2026-02-05",
      description: "Coordinate lead follow-ups and track pipeline updates.",
      postedAt: "2026-01-22T11:15:00.000Z",
    },
  ],
  applicants: [
    {
      id: "app-201",
      jobId: "job-101",
      name: "Liya Mulu",
      email: "liya.mulu@example.com",
      phone: "+251 911 234 567",
      status: "applied",
      updatedAt: "2026-01-23T13:00:00.000Z",
    },
    {
      id: "app-202",
      jobId: "job-101",
      name: "Dawit Bekele",
      email: "dawit.bekele@example.com",
      phone: "+251 920 882 444",
      status: "interviewed",
      updatedAt: "2026-01-24T16:10:00.000Z",
    },
    {
      id: "app-203",
      jobId: "job-102",
      name: "Selam Alemu",
      email: "selam.alemu@example.com",
      phone: "+251 901 456 789",
      status: "exam",
      updatedAt: "2026-01-25T10:45:00.000Z",
    },
    {
      id: "app-204",
      jobId: "job-102",
      name: "Samuel Tadesse",
      email: "samuel.tadesse@example.com",
      phone: "+251 911 772 334",
      status: "agreed",
      updatedAt: "2026-01-26T09:05:00.000Z",
    },
  ],
};

const getInitialData = () => {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DATA;
    const parsed = JSON.parse(stored);
    return {
      jobs: Array.isArray(parsed.jobs) && parsed.jobs.length ? parsed.jobs : DEFAULT_DATA.jobs,
      applicants:
        Array.isArray(parsed.applicants) && parsed.applicants.length
          ? parsed.applicants
          : DEFAULT_DATA.applicants,
    };
  } catch (error) {
    console.warn("Failed to read employer dashboard data", error);
    return DEFAULT_DATA;
  }
};

const useEmployerData = () => {
  const [jobs, setJobs] = useState(() => getInitialData().jobs);
  const [applicants, setApplicants] = useState(() => getInitialData().applicants);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        jobs,
        applicants,
      })
    );
  }, [jobs, applicants]);

  return { jobs, setJobs, applicants, setApplicants };
};

const getStatusMeta = (status) =>
  STATUS_OPTIONS.find((option) => option.value === status) || {
    label: status,
    color: "gray",
  };

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export { STATUS_OPTIONS, useEmployerData, getStatusMeta, formatDate };
