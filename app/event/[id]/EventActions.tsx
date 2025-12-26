"use client";

import CopyLink from "./CopyLink";

export default function EventActions({
  mapLink,
  calLink,
  externalLink,
}: {
  mapLink: string | null;
  calLink: string;
  externalLink?: string | null;
}) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
      {mapLink && (
        <a href={mapLink} target="_blank" rel="noreferrer">
          Open in Maps →
        </a>
      )}

      <a href={calLink} target="_blank" rel="noreferrer">
        Add to calendar →
      </a>

      <CopyLink />

      {externalLink && (
        <a href={externalLink} target="_blank" rel="noreferrer">
          More info →
        </a>
      )}
    </div>
  );
}
