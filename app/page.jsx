"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sdlytrkrhgltitcjctsm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

export default function Home() {
  const [articoli, setArticoli] = useState([]);
  const [nome, setNome] = useState("");

  useEffect(() => {
    carica();
  }, []);

  const carica = async () => {
    const { data } = await supabase.from("articoli").select("*");
    setArticoli(data || []);
  };

  const aggiungi = async () => {
    await supabase.from("articoli").insert([{ nome }]);
    setNome("");
    carica();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Gestionale Infissi</h1>

      <input
        placeholder="Nome articolo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <button onClick={aggiungi}>Aggiungi</button>

      <h2>Magazzino</h2>
      {articoli.map((a, i) => (
        <p key={i}>{a.nome}</p>
      ))}
    </div>
  );
}
