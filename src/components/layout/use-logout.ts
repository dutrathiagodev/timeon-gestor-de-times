"use client";

import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";

export function useLogout() {
  const router = useRouter();
  return async function logout() {
    await apiRequest("/api/auth/logout", "POST").catch(() => {});
    router.replace("/login");
    router.refresh();
  };
}
