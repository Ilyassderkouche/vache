"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopBar from "@/components/TopBar";
import CowCard from "@/components/CowCard";
import CowFormModal from "@/components/CowFormModal";
import { useAuth } from "@/context/AuthContext";
import { addCow, subscribeToCows } from "@/lib/cows";

function DashboardContent() {
  const { user } = useAuth();
  const [cows, setCows] = useState([]);
  const [loadingCows, setLoadingCows] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToCows(user.uid, (data) => {
      setCows(data);
      setLoadingCows(false);
    });
    return () => unsubscribe();
  }, [user]);

  const filteredCows = useMemo(() => {
    if (!search.trim()) return cows;
    return cows.filter((c) =>
      c.cowNumber.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [cows, search]);

  const handleAddCow = async (data) => {
    setBusy(true);
    try {
      await addCow(user.uid, data);
      setShowAddModal(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TopBar />
      <div className="container" style={{ paddingBottom: 100 }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 ابحث برقم البقرة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--color-border)",
              fontSize: 15,
              outline: "none",
            }}
          />
        </div>

        {loadingCows ? (
          <div className="empty-state">جاري تحميل بيانات الأبقار...</div>
        ) : filteredCows.length === 0 ? (
          <div className="empty-state">
            {search
              ? "لا توجد نتائج مطابقة لبحثك."
              : "لا توجد أبقار مسجلة بعد. اضغط على + لإضافة بقرة جديدة."}
          </div>
        ) : (
          <div className="cow-grid">
            {filteredCows.map((cow) => (
              <CowCard key={cow.id} cow={cow} />
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={() => setShowAddModal(true)} aria-label="إضافة بقرة">
        +
      </button>

      {showAddModal && (
        <CowFormModal
          busy={busy}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCow}
        />
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
