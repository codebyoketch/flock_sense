import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiRequestError } from "../services/api";
import { clearToken } from "../services/auth";
import { useToast } from "../components/Toast";
import type { Farmer, UpdateFarmerRequest } from "../types";

const LANGUAGES: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "sw", label: "Kiswahili" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Farmer>("/farmers/me");
      setFarmer(res);
      setName(res.name);
      setLocationLabel(res.location.label);
      setLanguage(res.language);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load your profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!farmer) return;
    setSaveError(null);
    setSaving(true);
    try {
      const payload: UpdateFarmerRequest = {
        name,
        language,
        location: { ...farmer.location, label: locationLabel },
      };
      const updated = await api.patch<Farmer>("/farmers/me", payload);
      setFarmer(updated);
      setEditing(false);
      showToast("Profile updated");
    } catch (err) {
      setSaveError(err instanceof ApiRequestError ? err.message : "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  if (loading) return <p className="loading">Loading your profile…</p>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!farmer) return null;

  return (
    <div className="page">
      <h1>Your profile</h1>

      {!editing ? (
        <div className="card">
          <p className="label">Name</p>
          <p className="value">{farmer.name}</p>

          <p className="label">Phone</p>
          <p className="value">{farmer.phone}</p>

          <p className="label">Cooperative</p>
          <p className="value">{farmer.cooperative_name}</p>

          <p className="label">Location</p>
          <p className="value">{farmer.location.label}</p>

          <p className="label">Language</p>
          <p className="value">{LANGUAGES.find((l) => l.value === farmer.language)?.label ?? farmer.language}</p>

          <div className="button-row">
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit profile
            </button>
            <button className="btn-link btn-danger" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      ) : (
        <form className="card form" onSubmit={handleSave}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="language">Language</label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          {saveError && <p className="error-text">{saveError}</p>}
          <div className="button-row">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" className="btn-link" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
