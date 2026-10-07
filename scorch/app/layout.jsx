import "./globals.css";

export const metadata = {
  title: "Scorch Sauce Co.",
  description: "Small-batch hot sauce: charred over mesquite, smoked over applewood, fermented 90 days in oak.",
};

export const viewport = { themeColor: "#0c0806", viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Familjen+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
