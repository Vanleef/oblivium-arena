const STOP_WORDS = new Set(["a", "as", "o", "os", "de", "da", "das", "do", "dos", "e"]);

function hash(value) {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return result >>> 0;
}

function slugInitials(slug) {
  const words = slug.split(/[^a-z0-9]+/).filter(word => word && !STOP_WORDS.has(word));
  return (words.length ? words : ["pma"]).slice(0, 2).map(word => word[0]).join("").toUpperCase();
}

function artContext(source) {
  let pathname = String(source || "");
  try { pathname = new URL(pathname, "https://pma.invalid").pathname; } catch {}
  const parts = pathname.toLowerCase().split("/").filter(Boolean);
  const characterIndex = parts.indexOf("characters");
  const interfaceIndex = parts.indexOf("interface");
  const identity = characterIndex >= 0 ? parts[characterIndex + 1] : interfaceIndex >= 0 ? "pma-interface" : parts.at(-2) || "pma";
  const filename = parts.at(-1) || "unknown.webp";
  const slot = filename.replace(/\.[^.]+$/, "").replace(/-[a-f0-9]{8,}$/i, "");
  return { identity, slot };
}

function glyphFor(slot) {
  if (slot === "portrait" || slot.startsWith("portrait-")) return "<path d=\"M256 133 326 173 326 253 256 293 186 253 186 173Z\"/><path d=\"M145 400 256 322 367 400M145 400V438H367V400\"/>";
  if (slot === "passive") return "<path d=\"M128 256Q256 106 384 256 256 406 128 256Z\"/><circle cx=\"256\" cy=\"256\" r=\"51\"/><path d=\"M256 108V146M256 366V404M108 256H146M366 256H404\"/>";
  if (slot.includes("impulso")) return "<path d=\"M302 112 188 254H265L216 400 330 246H253Z\"/><path d=\"M142 178 173 209M370 303 402 335\"/>";
  if (slot.includes("tecnica")) return "<circle cx=\"256\" cy=\"256\" r=\"124\"/><circle cx=\"256\" cy=\"256\" r=\"65\"/><path d=\"M256 83V143M256 369V429M83 256H143M369 256H429\"/>";
  if (slot.includes("voto")) return "<path d=\"M256 105 366 153V244Q366 342 256 409 146 342 146 244V153Z\"/><path d=\"M205 255 240 290 309 218\"/>";
  if (slot.includes("despertar")) return "<path d=\"M256 93 288 205 400 256 288 307 256 419 224 307 112 256 224 205Z\"/><circle cx=\"256\" cy=\"256\" r=\"36\"/>";
  return "<path d=\"M256 100 364 164 364 292 256 412 148 292 148 164Z\"/><path d=\"M205 211 256 179 307 211M205 282 256 317 307 282M256 180V317\"/>";
}

/** A self-contained, character-specific visual when a referenced artwork file is absent. */
export function fallbackArtwork(source) {
  if (String(source || "").startsWith("data:image/svg+xml")) return null;
  const { identity, slot } = artContext(source);
  const seed = hash(`${identity}/${slot}`);
  const hue = seed % 360;
  const accentHue = (hue + 34 + (seed >>> 9) % 42) % 360;
  const initials = slugInitials(identity);
  const caption = slot === "portrait" || slot.startsWith("portrait-") ? "FORMA" : slot === "passive" ? "ECO" : slot.replace(/^skill-/, "").replaceAll("-", " ").slice(0, 18).toUpperCase();
  const patternShift = seed % 96;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 42% 18%)"/><stop offset="1" stop-color="hsl(${accentHue} 50% 8%)"/></linearGradient><radialGradient id="glow"><stop stop-color="hsl(${accentHue} 88% 66%)" stop-opacity=".27"/><stop offset="1" stop-color="hsl(${accentHue} 88% 66%)" stop-opacity="0"/></radialGradient></defs><rect width="512" height="512" fill="url(#bg)"/><circle cx="${256 + patternShift}" cy="${180 + patternShift}" r="255" fill="url(#glow)"/><path d="M-30 ${385 - patternShift} 202 94 542 350M-36 468 245 177 560 452" fill="none" stroke="hsl(${accentHue} 70% 75%)" stroke-opacity=".13" stroke-width="2"/><path d="M256 34 478 162V350L256 478 34 350V162Z" fill="none" stroke="hsl(${accentHue} 75% 78%)" stroke-opacity=".28" stroke-width="3"/><g fill="none" stroke="hsl(${accentHue} 84% 78%)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".88">${glyphFor(slot)}</g><circle cx="256" cy="256" r="177" fill="none" stroke="hsl(${accentHue} 75% 82%)" stroke-opacity=".18" stroke-width="2"/><text x="256" y="348" text-anchor="middle" fill="hsl(${accentHue} 94% 91%)" fill-opacity=".9" font-family="Georgia,serif" font-size="50" letter-spacing="7">${initials}</text><path d="M126 447H386" stroke="hsl(${accentHue} 75% 82%)" stroke-opacity=".36"/><text x="256" y="476" text-anchor="middle" fill="hsl(${accentHue} 76% 85%)" fill-opacity=".68" font-family="Arial,sans-serif" font-size="13" letter-spacing="4">${caption}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function handleArtworkError(event) {
  const image = event?.target;
  if (image?.tagName !== "IMG" || image.dataset?.artFallbackApplied === "true") return false;
  const fallback = fallbackArtwork(image.getAttribute?.("src") || image.currentSrc || image.src);
  if (!fallback) return false;
  if (image.dataset) image.dataset.artFallbackApplied = "true";
  image.src = fallback;
  image.classList?.add("art-fallback-image");
  return true;
}
