import "./globals.css";

export const metadata = {
  title: "SURGE+ Hydration",
  description: "Fizzing electrolyte tabs with 3 g of protein. Zero sugar, 15 calories.",
};

export const viewport = { themeColor: "#ffb02e", viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=JetBrains+Mono:wght@500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
