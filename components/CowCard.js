"use client";

import { useRouter } from "next/navigation";
import { calculateBirthInfo } from "@/lib/cows";

function getBadge(daysRemaining) {
  if (daysRemaining < 0) return { label: "تجاوزت الموعد", cls: "badge-overdue" };
  if (daysRemaining <= 7) return { label: "قريبة جداً", cls: "badge-soon" };
  if (daysRemaining <= 30) return { label: "تقترب", cls: "badge-upcoming" };
  return { label: "طبيعي", cls: "badge-normal" };
}

export default function CowCard({ cow }) {
  const router = useRouter();
  const { expectedBirthDate, daysRemaining } = calculateBirthInfo(cow.inseminationDate);
  const badge = getBadge(daysRemaining);

  return (
    <div className="cow-card" onClick={() => router.push(`/dashboard/${cow.id}`)}>
      <div className="cow-card-top">
        <div className="cow-number">بقرة رقم {cow.cowNumber}</div>
        <span className={`badge ${badge.cls}`}>{badge.label}</span>
      </div>

      <div className="days-remaining">
        {daysRemaining < 0 ? `تجاوزت بـ ${Math.abs(daysRemaining)} يوم` : `${daysRemaining} يوم`}
      </div>

      <div className="cow-card-row">
        <span>تاريخ الولادة المتوقع</span>
        <strong>{expectedBirthDate}</strong>
      </div>
    </div>
  );
}
