import axios from "axios";
import { VEXORA } from "../../constants/vexora";

export const vexoraSandboxClient = axios.create({
  baseURL: VEXORA.SANDBOX_BASE_URL,
  timeout: VEXORA.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    merchantNo: VEXORA.MERCHANT_NO,
  },
});

// Request Interceptor
vexoraSandboxClient.interceptors.request.use(
  (config) => {
    // Safeguard to ensure config.headers exists
    if (!config.headers) config.headers = {} as any;

    // Log request details for Sandbox debugging
    console.log(`[Vexora Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
vexoraSandboxClient.interceptors.response.use(
  (response) => {
    // Log response data for visibility in sandbox environment
    console.log(`[Vexora Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // Centrally log error details
    console.error(`[Vexora Error] ${error.config?.url || "Request"}:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);
