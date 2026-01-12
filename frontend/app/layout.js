import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "VyaparMind | Intelligent Retail Operating System",
  description: "Advanced POS, Real-time Inventory, and Predictive Analytics for modern business.",
};

import Sidebar from "./components/Sidebar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div style={{ flex: 1, marginLeft: "260px", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
