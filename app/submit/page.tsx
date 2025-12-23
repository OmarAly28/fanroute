"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type City = { id: string; name: string; slug: string };

type EventType = "watch_party" | "meetup";
type VenueType = "cafe" | "public" | "fan_hosted" | "bar";

const TAG_OPTIONS = [
  { value: "alcohol_free", label: "Alcohol-free" },
  { value: "family_friendly", label: "Family-friendly" },
  { value: "halal_friendly", label: "Halal-friendly" },
] as const;

function toLocalDatetimeValue(d: Date) {
  // yyyy-MM-ddTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function SubmitPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const [eventType, setEventType] = useState<EventType>("watch_party");
  const [cityId, setCityId] = useState<string>("");

  const [matchLabel, setMatchLabel] = useState("");
  const [title, setTitle] = useState("");

  const defaultTime = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(19, 0, 0, 0); // tomorrow 7pm
    return toLocalDatetimeValue(d);
  }, []);

  const [startsAtLocal, setStartsAtLocal] = useState(defaultTime);

  const [venueName, setVenueName] = useState("");
  const [venueType, setVenueType] = useState<VenueType>("cafe");
  const [address, setAddress] = useState("");
  const [generalArea, setGeneralArea] = useState("");
  const [externalLink, setExternalLink] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoadingCities(true);
      const { data, error } = await supabase
        .from("cities")
        .select("id,name,slug")
        .eq("is_active", true)
        .order("name");

      if (error) {
        setStatus(`Error loading cities: ${error.message}`);
        setCities([]);
      } else {
        const list = (data ?? []) as City[];
        setCities(list);
        if (!cityId && list.length > 0) setCityId(list[0].id);
      }
      setLoadingCities(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleTag(val: string) {
    setTags((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  }

  function validate() {
    if (!cityId) return "Pick a city.";
    if (!venueName.trim()) return "Venue name is required.";
    if (!startsAtLocal) return "Start date/time is required.";

    // watch party: match label required
    if (eventType === "watch_party" && !matchLabel.trim())
      return "Match label is required for watch parties (e.g., Morocco vs Spain).";

    // location rule: need either address OR general area
    if (!address.trim() && !generalArea.trim())
      return "Provide either an address or a general area.";

    // title:
    // - for meetups: title required
    // - for watch parties: title can be auto-filled
    if (eventType === "meetup" && !title.trim())
      return "Title is required for meetups.";

    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    const err = validate();
    if (err) {
      setStatus(err);
      return;
    }

    setSubmitting(true);
    try {
      // Convert local datetime input -> ISO
      const iso = new Date(startsAtLocal).toISOString();

      const finalTitle =
        eventType === "watch_party"
          ? (title.trim() || `${matchLabel.trim()} Watch Party`)
          : title.trim();

      const payload = {
        city_id: cityId,
        event_type: eventType,
        title: finalTitle,
        match_label: eventType === "watch_party" ? matchLabel.trim() : null,
        starts_at: iso,
        venue_name: venueName.trim(),
        venue_type: venueType,
        address: address.trim() || null,
        general_area: generalArea.trim() || null,
        tags,
        external_link: externalLink.trim() || null,
        is_featured: false,
      };

      const { error } = await supabase.from("events").insert(payload);
      if (error) throw new Error(error.message);

      setStatus("✅ Submitted! Go check the city page.");
      // light reset
      setMatchLabel("");
      setTitle("");
      setVenueName("");
      setAddress("");
      setGeneralArea("");
      setExternalLink("");
      setTags([]);
    } catch (ex: any) {
      setStatus(`❌ Submit failed: ${ex?.message ?? "unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <p style={{ marginBottom: 12 }}>
        <Link href="/">← Back</Link>
      </p>

      <h1 style={{ fontSize: 32, fontWeight: 800 }}>Submit</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Add a watch party or meetup (MVP form).
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          marginTop: 18,
          display: "grid",
          gap: 12,
          border: "1px solid #333",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Type</span>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
          >
            <option value="watch_party">Watch Party</option>
            <option value="meetup">Meetup</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>City</span>
          <select
            disabled={loadingCities}
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {eventType === "watch_party" ? (
          <label style={{ display: "grid", gap: 6 }}>
            <span>Match label (required)</span>
            <input
              value={matchLabel}
              onChange={(e) => setMatchLabel(e.target.value)}
              placeholder="Morocco vs Spain"
            />
          </label>
        ) : (
          <label style={{ display: "grid", gap: 6 }}>
            <span>Meetup title (required)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nigeria Fans Meetup"
            />
          </label>
        )}

        {eventType === "watch_party" && (
          <label style={{ display: "grid", gap: 6 }}>
            <span>Title (optional)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave empty to auto-fill"
            />
          </label>
        )}

        <label style={{ display: "grid", gap: 6 }}>
          <span>Start date/time</span>
          <input
            type="datetime-local"
            value={startsAtLocal}
            onChange={(e) => setStartsAtLocal(e.target.value)}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Venue name</span>
          <input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="Café Atlas"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Venue type</span>
          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value as VenueType)}
          >
            <option value="cafe">Café</option>
            <option value="public">Public</option>
            <option value="fan_hosted">Fan-hosted</option>
            <option value="bar">Bar</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Address (optional if you provide general area)</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, State"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>General area (optional if you provide address)</span>
          <input
            value={generalArea}
            onChange={(e) => setGeneralArea(e.target.value)}
            placeholder="Near downtown / near stadium"
          />
        </label>

        <div style={{ display: "grid", gap: 6 }}>
          <span>Tags</span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {TAG_OPTIONS.map((t) => (
              <label key={t.value} style={{ display: "flex", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={tags.includes(t.value)}
                  onChange={() => toggleTag(t.value)}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span>External link (optional)</span>
          <input
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder="https://instagram.com/... or Eventbrite"
          />
        </label>

        <button disabled={submitting} type="submit">
          {submitting ? "Submitting..." : "Submit"}
        </button>

        {status && (
          <div style={{ marginTop: 6, opacity: 0.9 }}>
            {status}
          </div>
        )}
      </form>

      <p style={{ marginTop: 14, opacity: 0.7 }}>
        After submitting, go back to the city page and refresh.
      </p>
    </main>
  );
}
