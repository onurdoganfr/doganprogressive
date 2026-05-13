export function encodeProgram(prog) {
  try {
    const payload = { name: prog.name, tagClass: prog.tagClass || 'custom', exercises: prog.exercises || [] };
    return btoa(JSON.stringify(payload));
  } catch {
    return null;
  }
}

export function decodeProgram(str) {
  try {
    const parsed = JSON.parse(atob(str));
    if (!parsed.name || !Array.isArray(parsed.exercises)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getShareUrl(prog) {
  const encoded = encodeProgram(prog);
  if (!encoded) return null;
  const url = new URL(window.location.origin);
  url.searchParams.set('share', encoded);
  return url.toString();
}
