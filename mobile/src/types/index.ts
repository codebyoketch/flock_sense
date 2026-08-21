export type LivestockType = "poultry" | "dairy" | "goats" | "other";

export type ScoreGrade = "A" | "B" | "C" | "D" | "E";

export type EntryStatus = "queued" | "pending_verification" | "verified" | "flagged";

export interface Farmer {
  farmerId: string;
  name: string;
  phone: string;
  cooperativeId: string;
  cooperativeName: string;
  location?: { lat: number; lng: number; label: string };
  language: "en" | "sw";
}

export interface Holding {
  holdingId: string;
  type: LivestockType;
  count: number;
  score?: ScoreGrade;
  trend?: "improving" | "flat" | "worsening";
  createdAt: string;
}

export interface Entry {
  entryId?: string;
  clientId: string; // client-generated UUID, used for offline idempotency
  holdingId: string;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  feed: { type: string; quantityKg: number };
  energy: { source: "grid" | "solar" | "diesel" | "none"; quantityKwh: number };
  water: { quantityLiters: number };
  wasteHandling: string;
  estimatedCo2eKg?: number;
  status: EntryStatus;
  createdAt: string;
  syncedAt?: string | null;
}

export interface PendingVerification {
  entryId: string;
  farmerName: string;
  holdingType: LivestockType;
  periodEnd: string;
  estimatedCo2eKg: number;
  verificationsSoFar: number;
  verificationsRequired: number;
}

export interface Reciprocity {
  given: number;
  owed: number;
  scoreActive: boolean;
}

export interface HoldingScore {
  holdingId: string;
  type: LivestockType;
  score: ScoreGrade;
  trend: "improving" | "flat" | "worsening";
  co2ePerAnimalKg: number;
  topDriver: string;
  recommendation: {
    title: string;
    body: string;
    category: string;
  };
}

export interface ScoreSummary {
  farmerId: string;
  overallScore: ScoreGrade;
  computedAt: string;
  holdings: HoldingScore[];
}

export interface BadgeData {
  farmerName: string;
  cooperativeName: string;
  overallScore: ScoreGrade;
  verifiedAt: string;
  holdingsBreakdown: { type: LivestockType; score: ScoreGrade }[];
  ledgerTxId: string;
  chain: string;
}

export interface AttestationEntry {
  verifierIdHash: string;
  entryId: string;
  verdict: "confirm" | "flag";
  timestamp: string;
}

export interface LedgerProof {
  txId: string;
  anchoredAt: string;
  scoreHash: string;
  attestationTrail: AttestationEntry[];
}

export interface VerificationHistoryItem {
  verificationId: string;
  direction: "given" | "received";
  entryId: string;
  holdingType: LivestockType;
  counterpartyName: string; // who you verified, or who verified you
  verdict: "confirm" | "flag";
  note?: string;
  createdAt: string;
}
