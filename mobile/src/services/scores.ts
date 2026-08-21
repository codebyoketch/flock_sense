import { apiRequest } from "./api";
import type { ScoreSummary } from "@/types";

export async function getMyScore(): Promise<ScoreSummary> {
  return apiRequest<ScoreSummary>("/scores/me");
}
