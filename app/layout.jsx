export const metadata = {
  title: "Rapportini Carlini",
  description: "App rapportini",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
 <meta name="apple-mobile-web-app-title" content="Rapportini" /> 
   <meta name="viewport" content="width=device-width, initial-scale=1" />     
      </head>
      <body>{children}</body>
    </html>
  );
}
