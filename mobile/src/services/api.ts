import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? "https://api.flocksense.app/api/v1";
const TOKEN_KEY = "flocksense_token";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // defaults to true
}

/**
 * The API contract (docs/api-contract.md) specifies snake_case field names
 * throughout (e.g. `cooperative_id`, `estimated_co2e_kg`), while every local
 * TS type in this app is camelCase. These two converters bridge that gap at
 * the network boundary so the rest of the app can stay in idiomatic camelCase.
 * Both are idempotent — running camelToSnake on an already-snake_case key
 * (or vice versa) leaves it unchanged — so it's safe to apply universally
 * even where a caller already wrote a key in the "wrong" case by hand.
 */
function camelToSnakeKey(key: string): string {
  return key.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function convertKeysDeep(input: unknown, convert: (key: string) => string): unknown {
  if (Array.isArray(input)) return input.map((item) => convertKeysDeep(item, convert));
  if (input !== null && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[convert(k)] = convertKeysDeep(v, convert);
    }
    return out;
  }
  return input;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(convertKeysDeep(body, camelToSnakeKey)) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const rawJson = await res.json().catch(() => ({}));
  const json = convertKeysDeep(rawJson, snakeToCamelKey) as any;

  if (!res.ok) {
    const err = json?.error ?? { code: "UNKNOWN", message: "Request failed" };
    throw new ApiError(err.message, err.code, res.status);
  }

  return json as T;
}
