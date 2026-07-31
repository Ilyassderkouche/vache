"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <div className="brand">
          <span className="brand-icon">🐄</span>
          متابعة ولادة الأبقار
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user && (
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              {user.displayName || user.phoneNumber || user.email}
            </span>
          )}
          <button className="btn btn-outline" onClick={handleLogout}>
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}
