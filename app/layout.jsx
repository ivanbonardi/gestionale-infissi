export const metadata = {
  title: "Gestione Rapportini",
  description: "App rapportini",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#007aff" />
      </head>
      <body>{children}</body>
    </html>
  );
}
