import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "متابعة ولادة الأبقار",
  description: "تطبيق لمربي الأبقار لمتابعة مواعيد الولادة المتوقعة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
