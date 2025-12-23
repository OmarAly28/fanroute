"use client";

export default function CopyLink() {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
      }}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textDecoration: "underline",
      }}
    >
      Copy link
    </button>
  );
}
