import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";


type City = {
  id: string;
  name: string;
  slug: string;
};

type EventRow = {
  id: string;
  title: string;
  match_label: string | null;
  starts_at: string;
  venue_name: string;
  address: string | null;
  general_area: string | null;
  venue_type: "cafe" | "public" | "fan_hosted" | "bar";
  tags: string[];
  is_featured: boolean;
};

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

function venueTypeLabel(v: EventRow["venue_type"]) {
  if (v === "fan_hosted") return "Fan-hosted";
  if (v === "cafe") return "Café";
  if (v === "public") return "Public";
  return "Bar";
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch city
  const { data: city, error: cityErr } = await supabase
    .from("cities")
    .select("id,name,slug,is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (cityErr || !city) return notFound();
  const c = city as City;

  // Fetch upcoming watch parties
  const nowIso = new Date().toISOString();
  const { data: events, error: evErr } = await supabase
    .from("events")
    .select(
      "id,title,match_label,starts_at,venue_name,address,general_area,venue_type,tags,is_featured"
    )
    .eq("city_id", c.id)
    .eq("event_type", "watch_party")
    .gt("starts_at", nowIso)
    .order("starts_at", { ascending: true });

  if (evErr) {
    return (
      <main style={{ padding: 24 }}>
        <p>Error loading events.</p>
      </main>
    );
  }

  const featured = (events ?? []).filter((e) => e.is_featured).slice(0, 3);
  const regular = (events ?? []).filter((e) => !e.is_featured);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <p>
        <Link href="/">← Back</Link>
      </p>

      <h1 style={{ fontSize: 32, fontWeight: 900 }}>{c.name}</h1>
      <p style={{ opacity: 0.8 }}>
        Watch parties · upcoming only · sorted by time
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        <Link href="/submit">Submit a watch party →</Link>
        <span>|</span>
        <Link href={`/city/${slug}/essentials`}>Essentials →</Link>
      </div>

      {featured.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2>⭐ Featured</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {featured.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Upcoming</h2>

        {regular.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No watch parties listed yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {regular.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function EventCard({ e }: { e: EventRow }) {
  const title = e.match_label || e.title;
  const where = e.address || e.general_area || "Location not specified";

  return (
    <Link
      href={`/event/${e.id}`}
      style={{
        display: "block",
        border: "1px solid #333",
        borderRadius: 12,
        padding: 14,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ opacity: 0.85 }}>🕒 {prettyWhen(e.starts_at)}</div>
      <div style={{ opacity: 0.85 }}>
        📍 {e.venue_name} · {venueTypeLabel(e.venue_type)} · {where}
      </div>

      {e.tags?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {e.tags.map((t) => (
            <span key={t} style={{ marginRight: 8, fontSize: 12 }}>
              {t.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
