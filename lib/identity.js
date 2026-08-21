const KEY = "notely_display_name";

export function getDisplayName() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setDisplayName(name) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, name.trim());
}
