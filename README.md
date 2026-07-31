# تطبيق متابعة ولادة الأبقار 🐄

تطبيق ويب مبني بـ Next.js (App Router) وJavaScript فقط، يستخدم Firebase للمصادقة (رقم الهاتف + Google) ولتخزين البيانات (Firestore).

## 1. التثبيت

```bash
npm install
```

انسخ ملف `.env.local.example` إلى `.env.local` (تم تعبئته مسبقاً ببيانات مشروعك):

```bash
cp .env.local.example .env.local
```

ثم شغّل المشروع محلياً:

```bash
npm run dev
```

سيعمل التطبيق على `http://localhost:3000`.

## 2. إعدادات Firebase الضرورية (مهم جداً)

### أ) تفعيل طرق تسجيل الدخول
في [Firebase Console](https://console.firebase.google.com) → مشروعك `arpd-4d038` → Authentication → Sign-in method:
- فعّل **Phone**.
- فعّل **Google**.

### ب) النطاقات المصرح بها (Authorized domains)
في نفس الصفحة (Authentication → Settings → Authorized domains) أضف نطاق النشر (مثلاً `your-app.vercel.app`)، بالإضافة إلى `localhost` (موجود افتراضياً).

### ج) تفعيل Firestore
من القائمة الجانبية → Firestore Database → Create database (اختر وضع production).

### د) قواعد أمان Firestore
اذهب إلى Firestore Database → Rules واستبدل المحتوى بما يلي، بحيث لا يستطيع كل مستخدم الوصول إلا لأبقاره الخاصة:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/cows/{cowId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### هـ) اختبار OTP على الهاتف
- Firebase قد يطلب منك إضافة أرقام اختبار (Phone numbers for testing) في Authentication → Sign-in method → Phone، لتفادي استهلاك رسائل SMS الحقيقية أثناء التطوير.
- تسجيل الدخول برقم الهاتف يتطلب reCAPTCHA (موجود تلقائياً بشكل غير مرئي في صفحة تسجيل الدخول).
- يجب إدخال الرقم بصيغة دولية كاملة، مثال: `+212612345678`.

## 3. هيكلة المشروع

```
app/
  layout.js            تخطيط عام + AuthProvider
  page.js               التوجيه التلقائي (login/dashboard)
  login/page.js          صفحة تسجيل الدخول (هاتف + Google)
  dashboard/page.js       الصفحة الرئيسية (قائمة الأبقار + بحث + إضافة)
  dashboard/[id]/page.js  صفحة تفاصيل بقرة (تعديل/حذف)
  globals.css            التصميم العام
components/
  ProtectedRoute.js      حماية الصفحات الخاصة بالمستخدمين المسجلين
  TopBar.js               شريط علوي
  CowCard.js              بطاقة عرض بقرة
  CowFormModal.js         نافذة إضافة/تعديل بقرة
context/
  AuthContext.js          إدارة حالة تسجيل الدخول عبر التطبيق
lib/
  firebase.js              تهيئة Firebase
  cows.js                   دوال Firestore (إضافة/تعديل/حذف/بحث) وحساب تاريخ الولادة
```

## 4. طريقة حساب الولادة

`تاريخ الولادة المتوقع = تاريخ التلقيح + 283 يوماً`
`الأيام المتبقية = تاريخ الولادة المتوقع - تاريخ اليوم`

يتم الحساب تلقائياً عند كل إضافة أو تعديل، ويُعاد حسابه لحظياً عند عرض القائمة.

## 5. النشر (Deployment)

يمكن نشر المشروع بسهولة على [Vercel](https://vercel.com):

```bash
npm i -g vercel
vercel
```

لا تنسَ إضافة متغيرات البيئة (من `.env.local`) في إعدادات المشروع على Vercel، وإضافة نطاق Vercel إلى Authorized domains في Firebase.
