import { apiRequest } from "./api";
import type { Holding, LivestockType } from "@/types";

export async function getHoldings(): Promise<Holding[]> {
  const res = await apiRequest<{ data: Holding[] }>("/holdings");
  return res.data;
}

export async function createHolding(type: LivestockType, count: number): Promise<Holding> {
  return apiRequest<Holding>("/holdings", { method: "POST", body: { type, count } });
}

export async function updateHolding(holdingId: string, count: number): Promise<Holding> {
  return apiRequest<Holding>(`/holdings/${holdingId}`, { method: "PATCH", body: { count } });
}

export async function deleteHolding(holdingId: string): Promise<void> {
  await apiRequest<void>(`/holdings/${holdingId}`, { method: "DELETE" });
}
