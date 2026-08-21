import { apiRequest, setToken, clearToken } from "./api";
import { resetLocalDb } from "@/storage/db";
import type { Farmer } from "@/types";

interface RegisterPayload {
  phone: string;
  name: string;
  cooperativeId: string;
  location?: { lat: number; lng: number; label: string };
}

interface AuthResult {
  farmerId: string;
  token: string;
  expiresAt: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const result = await apiRequest<AuthResult>("/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
  await setToken(result.token);
  return result;
}

export async function requestOtp(phone: string): Promise<{ otpSent: boolean; expiresInSeconds: number }> {
  return apiRequest("/auth/login", { method: "POST", body: { phone }, auth: false });
}

export async function verifyOtp(phone: string, otp: string): Promise<AuthResult> {
  const result = await apiRequest<AuthResult>("/auth/login", {
    method: "POST",
    body: { phone, otp },
    auth: false,
  });
  await setToken(result.token);
  return result;
}

export async function fetchCurrentFarmer(): Promise<Farmer> {
  return apiRequest<Farmer>("/farmers/me");
}

export async function logout(): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST" }).catch(() => {
    // Logout locally even if the network call fails
  });
  await clearToken();
  await resetLocalDb();
}
