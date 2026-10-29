import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import { getSiteSettings } from "@/lib/data/settings";
import { getProfilePhoto } from "@/lib/profile-photo";

export const alt = "Yasir Abdullah, Software & Network Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The photo as a data URL, since the image renderer cannot read files from public/ by path.
async function photoData(src: string): Promise<string | null> {
  try {
    if (src.startsWith("/")) {
      const file = await readFile(path.join(process.cwd(), "public", src));
      const type = src.endsWith(".png") ? "png" : src.endsWith(".webp") ? "webp" : "jpeg";
      return `data:image/${type};base64,${file.toString("base64")}`;
    }
    const response = await fetch(src);
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "image/jpeg";
    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const settings = await getSiteSettings();
  const photo = await getProfilePhoto(settings.photoUrl);
  const image = photo ? await photoData(photo.src) : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 56,
        padding: "0 88px",
        background: "#f5f6f8",
        backgroundImage: "radial-gradient(circle at 85% 0%, #dfe7ff 0%, #f5f6f8 55%)",
        fontFamily: "sans-serif",
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img
        <img
          src={image}
          alt=""
          width={280}
          height={280}
          style={{ borderRadius: 999, objectFit: "cover", border: "10px solid #dbe4ff" }}
        />
      ) : (
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "#e8eeff",
            border: "10px solid #dbe4ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 110,
            fontWeight: 800,
            color: "#2b59ff",
          }}
        >
          YA
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
        <div style={{ fontSize: 76, fontWeight: 800, color: "#0e1220", letterSpacing: -2 }}>
          {settings.name}
        </div>
        <div style={{ fontSize: 34, color: "#2b59ff", fontWeight: 700 }}>
          {settings.roleLine.split(" · ")[0]}
        </div>
        <div style={{ fontSize: 26, color: "#5d6475", lineHeight: 1.4 }}>
          {settings.availability}
        </div>
      </div>
    </div>,
    size,
  );
}
