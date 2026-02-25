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
