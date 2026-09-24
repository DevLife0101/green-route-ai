import "./globals.css";
import PageTransition from "../components/PageTransition";

export const metadata = {
  title: "Green Route AI",
  description: "High-precision eco-routing and carbon tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-emerald-200">
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}