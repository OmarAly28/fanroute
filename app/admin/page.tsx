import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function approve(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await supabaseAdmin.from("events").update({ status: "approved" }).eq("id", id);
}

async function reject(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await supabaseAdmin.from("events").update({ status: "rejected" }).eq("id", id);
}

async function feature(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await supabaseAdmin
    .from("events")
    .update({ status: "approved", is_featured: true })
    .eq("id", id);
}

async function unfeature(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await supabaseAdmin.from("events").update({ is_featured: false }).eq("id", id);
}

// soft-remove from public
async function remove(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await supabaseAdmin.from("events").update({ status: "rejected" }).eq("id", id);
}

type AdminRow = {
  id: string;
  title: string;
  match_label: string | null;
  starts_at: string;
  venue_name: string;
  status: "pending" | "approved" | "rejected";
  is_featured?: boolean | null;
};

function labelOf(e: { match_label: string | null; title: string }) {
  return e.match_label?.trim() ? e.match_label : e.title;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!key || key !== process.env.ADMIN_KEY) return notFound();

  const { data: pending } = await supabaseAdmin
    .from("events")
    .select("id,title,match_label,starts_at,venue_name,status")
    .eq("status", "pending")
    .order("starts_at", { ascending: true });

  const { data: approved } = await supabaseAdmin
    .from("events")
    .select("id,title,match_label,starts_at,venue_name,status,is_featured")
    .eq("status", "approved")
    .order("starts_at", { ascending: true })
    .limit(50);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Admin</h1>

      {/* Pending */}
      <h2 style={{ fontSize: 20, fontWeight: 900, marginTop: 18 }}>
        Pending events
      </h2>

      {!pending || pending.length === 0 ? (
        <p style={{ marginTop: 10 }}>No pending events.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {(pending as AdminRow[]).map((e) => (
            <div
              key={e.id}
              style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}
            >
              <div style={{ fontWeight: 900 }}>{labelOf(e)}</div>
              <div style={{ opacity: 0.85, marginTop: 6 }}>{e.venue_name}</div>
              <div style={{ opacity: 0.75, marginTop: 6 }}>
                {new Date(e.starts_at).toLocaleString()}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <form action={approve}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit">Approve</button>
                </form>

                <form action={feature}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit">Feature</button>
                </form>

                <form action={reject}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit">Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approved */}
      <h2 style={{ fontSize: 20, fontWeight: 900, marginTop: 28 }}>
        Approved (latest 50)
      </h2>

      {!approved || approved.length === 0 ? (
        <p style={{ marginTop: 10 }}>No approved events.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {(approved as AdminRow[]).map((e) => (
            <div
              key={e.id}
              style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}
            >
              <div style={{ fontWeight: 900 }}>
                {labelOf(e)} {e.is_featured ? "⭐" : ""}
              </div>
              <div style={{ opacity: 0.85, marginTop: 6 }}>{e.venue_name}</div>
              <div style={{ opacity: 0.75, marginTop: 6 }}>
                {new Date(e.starts_at).toLocaleString()}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {e.is_featured ? (
                  <form action={unfeature}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit">Unfeature</button>
                  </form>
                ) : (
                  <form action={feature}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit">Feature</button>
                  </form>
                )}

                <form action={remove}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit">Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
