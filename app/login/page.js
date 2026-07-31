"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const recaptchaContainerRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        { size: "invisible" }
      );
    }
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // يجب أن يكون الرقم بصيغة دولية كاملة، مثال: +212612345678
    if (!/^\+\d{8,15}$/.test(phone.trim())) {
      setError("أدخل رقم الهاتف بصيغة دولية صحيحة، مثال: ‎+212612345678‎");
      return;
    }

    setBusy(true);
    try {
      const result = await signInWithPhoneNumber(
        auth,
        phone.trim(),
        recaptchaVerifierRef.current
      );
      setConfirmationResult(result);
      setStep("otp");
      setInfo("تم إرسال رمز التحقق إلى هاتفك.");
    } catch (err) {
      console.error(err);
      setError("تعذر إرسال رمز التحقق. تأكد من الرقم وحاول مجدداً.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!confirmationResult) return;

    setBusy(true);
    try {
      await confirmationResult.confirm(otp.trim());
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("رمز التحقق غير صحيح، حاول مجدداً.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("تعذر تسجيل الدخول باستخدام Google.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">جاري التحميل...</div>;
  }

  return (
    <div className="center-screen">
      <div className="card login-card">
        <div className="login-logo">🐄</div>
        <div className="login-title">متابعة ولادة الأبقار</div>
        <div className="login-subtitle">سجّل الدخول لمتابعة قطيعك</div>

        {error && <div className="error-msg">{error}</div>}
        {info && <div className="success-msg">{info}</div>}

        {step === "phone" && (
          <form onSubmit={handleSendOtp}>
            <div className="field">
              <label>رقم الهاتف</label>
              <input
                type="tel"
                placeholder="+212612345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "جاري الإرسال..." : "إرسال رمز التحقق"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <div className="field">
              <label>رمز التحقق (OTP)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                dir="ltr"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "جاري التحقق..." : "تأكيد الدخول"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: 10 }}
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
                setInfo("");
              }}
            >
              تغيير رقم الهاتف
            </button>
          </form>
        )}

        <div className="divider">أو</div>

        <button
          type="button"
          className="btn btn-google btn-block"
          onClick={handleGoogleLogin}
          disabled={busy}
        >
          <span>🔵</span> تسجيل الدخول باستخدام Google
        </button>

        <div ref={recaptchaContainerRef} id="recaptcha-container" />
      </div>
    </div>
  );
}
