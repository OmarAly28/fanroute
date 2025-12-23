import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";


type City = {
  id: string;
  name: string;
  slug: string;
  essentials: any | null;
};

export default async function CityEssentialsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: city, error } = await supabase
    .from("cities")
    .select("id,name,slug,is_active,essentials")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !city) return notFound();

  const c = city as City;
  const ess = c.essentials ?? {};

  const stadiums = Array.isArray(ess.stadiums) ? ess.stadiums : [];
  const gettingThere = Array.isArray(ess.getting_there) ? ess.getting_there : [];
  const nearbyBasics = Array.isArray(ess.nearby_basics) ? ess.nearby_basics : [];

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <p style={{ marginBottom: 12 }}>
        <Link href={`/city/${c.slug}`}>← Back to {c.name}</Link>
      </p>

      <h1 style={{ fontSize: 32, fontWeight: 900 }}>{c.name} Essentials</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Quick matchday basics (curated).
      </p>

      {stadiums.length === 0 && gettingThere.length === 0 && nearbyBasics.length === 0 ? (
        <div
          style={{
            border: "1px solid #333",
            borderRadius: 12,
            padding: 16,
            marginTop: 18,
          }}
        >
          <div style={{ fontWeight: 800 }}>No essentials yet for this city.</div>
          <div style={{ marginTop: 6, opacity: 0.8 }}>
            Add JSON in Supabase → cities.essentials.
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
          {stadiums.length > 0 && (
            <section style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900 }}>Stadium</h2>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {stadiums.map((s: any) => (
                  <div key={s.name}>
                    <span style={{ fontWeight: 700 }}>{s.name}</span>
                    {s.maps_url && (
                      <>
                        {" "}
                        ·{" "}
                        <a href={s.maps_url} target="_blank" rel="noreferrer">
                          Open in Maps →
                        </a>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {gettingThere.length > 0 && (
            <section style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900 }}>Getting there</h2>
              <ul style={{ marginTop: 10 }}>
                {gettingThere.map((tip: string, i: number) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </section>
          )}

          {nearbyBasics.length > 0 && (
            <section style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900 }}>Nearby basics</h2>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {nearbyBasics.map((b: any) => (
                  <div key={b.label}>
                    <a href={b.url} target="_blank" rel="noreferrer">
                      {b.label} →
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <p style={{ marginTop: 18 }}>
        <Link href={`/city/${c.slug}`}>Back to watch parties →</Link>
      </p>
    </main>
  );
}
