"use client";

import { useState } from "react";

export default function CowFormModal({ initialData, onClose, onSubmit, busy }) {
  const [cowNumber, setCowNumber] = useState(initialData?.cowNumber || "");
  const [inseminationDate, setInseminationDate] = useState(
    initialData?.inseminationDate || ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!cowNumber.trim() || !inseminationDate) {
      setError("يرجى إدخال رقم البقرة وتاريخ التلقيح.");
      return;
    }
    try {
      await onSubmit({ cowNumber: cowNumber.trim(), inseminationDate, notes });
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ البيانات، حاول مجدداً.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initialData ? "تعديل بيانات البقرة" : "إضافة بقرة جديدة"}</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>رقم البقرة</label>
            <input
              type="text"
              value={cowNumber}
              onChange={(e) => setCowNumber(e.target.value)}
              placeholder="مثال: 245"
              required
            />
          </div>

          <div className="field">
            <label>تاريخ التلقيح</label>
            <input
              type="date"
              value={inseminationDate}
              onChange={(e) => setInseminationDate(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>ملاحظات (اختياري)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          <div className="actions-row">
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
