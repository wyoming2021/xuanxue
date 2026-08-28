"use client";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "xuanyu_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
