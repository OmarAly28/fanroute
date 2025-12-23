import Link from "next/link";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";


type City = {
  id: string;
  name: string;
  slug: string;
};

export default async function HomePage() {
  const { data: cities, error } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Find watch parties near you</h1>
        <p>Error loading cities: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>
        Find watch parties near you
      </h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Choose a host city
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginTop: 20,
        }}
      >
        {cities?.map((city) => (
          <Link
            key={city.id}
            href={`/city/${city.slug}`}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {city.name}
            </div>
            <div style={{ opacity: 0.6, marginTop: 4 }}>
              View watch parties →
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
