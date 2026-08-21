import { apiRequest, setToken, clearToken } from "./api";
import { resetLocalDb } from "@/storage/db";
import type { Farmer } from "@/types";

interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  farmName?: string;
  animalType: string;
  herdSize: number;
}

interface LoginPayload {
  phone: string;
  password: string;
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

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const result = await apiRequest<AuthResult>("/auth/login", {
    method: "POST",
    body: payload,
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
