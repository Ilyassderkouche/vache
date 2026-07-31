"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopBar from "@/components/TopBar";
import CowFormModal from "@/components/CowFormModal";
import { useAuth } from "@/context/AuthContext";
import { subscribeToCow, updateCow, deleteCow, calculateBirthInfo } from "@/lib/cows";

function CowDetailsContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [cow, setCow] = useState(null);
  const [loadingCow, setLoadingCow] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    const unsubscribe = subscribeToCow(user.uid, id, (data) => {
      setCow(data);
      setLoadingCow(false);
    });
    return () => unsubscribe();
  }, [user, id]);

  const handleUpdate = async (data) => {
    setBusy(true);
    try {
      await updateCow(user.uid, id, data);
      setShowEditModal(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteCow(user.uid, id);
      router.replace("/dashboard");
    } finally {
      setBusy(false);
    }
  };

  if (loadingCow) {
    return (
      <>
        <TopBar />
        <div className="container">
          <div className="empty-state">جاري التحميل...</div>
        </div>
      </>
    );
  }

  if (!cow) {
    return (
      <>
        <TopBar />
        <div className="container">
          <div className="empty-state">
            لم يتم العثور على هذه البقرة، ربما تم حذفها.
            <br />
            <br />
            <button className="btn btn-primary" onClick={() => router.push("/dashboard")}>
              العودة إلى القائمة
            </button>
          </div>
        </div>
      </>
    );
  }

  const { expectedBirthDate, daysRemaining } = calculateBirthInfo(cow.inseminationDate);

  return (
    <>
      <TopBar />
      <div className="container" style={{ paddingTop: 20, paddingBottom: 60 }}>
        <button className="btn btn-outline" onClick={() => router.push("/dashboard")}>
          → العودة
        </button>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="detail-header">
            <h2 style={{ margin: 0 }}>بقرة رقم {cow.cowNumber}</h2>
          </div>

          <div className="detail-grid">
            <div className="stat-box">
              <div className="label">تاريخ التلقيح</div>
              <div className="value">{cow.inseminationDate}</div>
            </div>
            <div className="stat-box">
              <div className="label">تاريخ الولادة المتوقع</div>
              <div className="value">{expectedBirthDate}</div>
            </div>
            <div className="stat-box" style={{ gridColumn: "1 / -1" }}>
              <div className="label">الأيام المتبقية</div>
              <div className="value" style={{ fontSize: 28 }}>
                {daysRemaining < 0
                  ? `تجاوزت الموعد بـ ${Math.abs(daysRemaining)} يوم`
                  : `${daysRemaining} يوم`}
              </div>
            </div>
          </div>

          {cow.notes && (
            <div style={{ marginTop: 10 }}>
              <div className="label" style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 4 }}>
                ملاحظات
              </div>
              <div>{cow.notes}</div>
            </div>
          )}

          <div className="actions-row">
            <button className="btn btn-primary btn-block" onClick={() => setShowEditModal(true)}>
              تعديل البيانات
            </button>
            <button className="btn btn-danger btn-block" onClick={() => setShowDeleteConfirm(true)}>
              حذف البقرة
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <CowFormModal
          initialData={cow}
          busy={busy}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
        />
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>تأكيد الحذف</h2>
            <p>هل أنت متأكد من حذف بقرة رقم {cow.cowNumber}؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="actions-row">
              <button className="btn btn-danger btn-block" onClick={handleDelete} disabled={busy}>
                {busy ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button className="btn btn-outline btn-block" onClick={() => setShowDeleteConfirm(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CowDetailsPage() {
  return (
    <ProtectedRoute>
      <CowDetailsContent />
    </ProtectedRoute>
  );
}
