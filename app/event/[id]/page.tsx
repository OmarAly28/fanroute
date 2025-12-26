import Link from "next/link";
import CopyLink from "./CopyLink";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EventActions from "./EventActions";
export const dynamic = "force-dynamic";

type EventRow = {
  id: string;
  event_type: "watch_party" | "meetup";
  title: string;
  match_label: string | null;
  starts_at: string;
  venue_name: string;
  address: string | null;
  general_area: string | null;
  venue_type: "cafe" | "public" | "fan_hosted" | "bar";
  tags: string[];
  external_link: string | null;
  is_featured: boolean;
  city_id: string;
};

type City = { id: string; name: string; slug: string };

function prettyWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function VenueTypeLabel(v: EventRow["venue_type"]) {
  if (v === "fan_hosted") return "Fan-hosted";
  if (v === "cafe") return "Café";
  if (v === "public") return "Public";
  return "Bar";
}

function mapsUrl(addressOrArea: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    addressOrArea
  )}`;
}

function googleCalendarUrl(params: {
  title: string;
  startIso: string;
  durationMinutes?: number;
  details?: string;
  location?: string;
}) {
  const start = new Date(params.startIso);
  const end = new Date(start.getTime() + (params.durationMinutes ?? 120) * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dates = `${fmt(start)}/${fmt(end)}`;

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", dates);
  if (params.details) url.searchParams.set("details", params.details);
  if (params.location) url.searchParams.set("location", params.location);
  return url.toString();
}


export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: event, error: eErr } = await supabase
    .from("events")
    .select(
      "id,event_type,title,match_label,starts_at,venue_name,address,general_area,venue_type,tags,external_link,is_featured,city_id"
    )
    .eq("id", id)
    .single();

  if (eErr || !event) return notFound();

  const ev = event as EventRow;

  const { data: city } = await supabase
    .from("cities")
    .select("id,name,slug")
    .eq("id", ev.city_id)
    .single();

  const c = city as City | null;

  const mainTitle = ev.match_label?.trim() ? ev.match_label : ev.title;
  const where = ev.address?.trim() || ev.general_area?.trim() || "";
  const calLink = googleCalendarUrl({
  title: mainTitle,
  startIso: ev.starts_at,
  durationMinutes: 150,
  details: "Fan listing on Fanbase 2026.",
  location: where || undefined,
});

  const mapLink = where ? mapsUrl(where) : null;

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <p style={{ marginBottom: 12 }}>
        {c ? <Link href={`/city/${c.slug}`}>← Back to {c.name}</Link> : <Link href="/">← Back</Link>}
      </p>

      <h1 style={{ fontSize: 32, fontWeight: 900 }}>{mainTitle}</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>🕒 {prettyWhen(ev.starts_at)}</p>

      <div
        style={{
          border: "1px solid #333",
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
        }}
      >
        <div style={{ marginTop: 10, fontWeight: 900, color: "red" }}>
          CALENDAR TEST
        </div>

        <div style={{ fontSize: 18, fontWeight: 800 }}>
          📍 {ev.venue_name} · {VenueTypeLabel(ev.venue_type)}
        </div>

        {where && (
          <div style={{ marginTop: 8, opacity: 0.9 }}>
            {ev.address ? ev.address : ev.general_area}
          </div>
        )}

        {ev.tags?.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ev.tags.map((t) => (
              <span
                key={t}
                style={{
                  border: "1px solid #444",
                  padding: "4px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                  opacity: 0.9,
                }}
              >
                {t.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        )}

        <EventActions
            mapLink={mapLink}
            calLink={calLink}
            externalLink={ev.external_link}
        />


        <p style={{ marginTop: 14, opacity: 0.7 }}>
          Public listings are community submitted. Use normal travel caution.
        </p>
      </div>
    </main>
  );
}
