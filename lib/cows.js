"use client";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// مدة الحمل الافتراضية عند الأبقار بالأيام
export const GESTATION_DAYS = 283;

/**
 * حساب تاريخ الولادة المتوقع وعدد الأيام المتبقية انطلاقاً من تاريخ التلقيح
 * @param {string} inseminationDate - تاريخ التلقيح بصيغة YYYY-MM-DD
 */
export function calculateBirthInfo(inseminationDate) {
  const start = new Date(inseminationDate);
  const expectedBirth = new Date(start);
  expectedBirth.setDate(expectedBirth.getDate() + GESTATION_DAYS);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birthDay = new Date(expectedBirth);
  birthDay.setHours(0, 0, 0, 0);

  const diffMs = birthDay.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    expectedBirthDate: expectedBirth.toISOString().split("T")[0],
    daysRemaining,
  };
}

function cowsCollection(uid) {
  return collection(db, "users", uid, "cows");
}

export async function addCow(uid, { cowNumber, inseminationDate, notes }) {
  const { expectedBirthDate, daysRemaining } = calculateBirthInfo(inseminationDate);
  return addDoc(cowsCollection(uid), {
    cowNumber,
    inseminationDate,
    expectedBirthDate,
    notes: notes || "",
    createdAt: serverTimestamp(),
  });
}

export async function updateCow(uid, cowId, { cowNumber, inseminationDate, notes }) {
  const { expectedBirthDate } = calculateBirthInfo(inseminationDate);
  const ref = doc(db, "users", uid, "cows", cowId);
  return updateDoc(ref, {
    cowNumber,
    inseminationDate,
    expectedBirthDate,
    notes: notes || "",
  });
}

export async function deleteCow(uid, cowId) {
  const ref = doc(db, "users", uid, "cows", cowId);
  return deleteDoc(ref);
}

/**
 * اشتراك بالتغييرات الحية على قائمة الأبقار الخاصة بمستخدم معين
 */
export function subscribeToCows(uid, callback) {
  const q = query(cowsCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const cows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(cows);
  });
}

/**
 * اشتراك بالتغييرات الحية على بقرة واحدة عبر معرفها
 */
export function subscribeToCow(uid, cowId, callback) {
  const ref = doc(db, "users", uid, "cows", cowId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  });
}
