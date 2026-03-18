"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";

const supabase = createClient(
  "https://sdlytrkrhgltitcjctsm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

export default function Home() {
  const [articoli, setArticoli] = useState([]);
  const [nome, setNome] = useState("");

  const [rapporto, setRapporto] = useState({
    cliente: "",
    indirizzo: "",
    tecnico: "",
    descrizione: "",
  });

  useEffect(() => {
    caricaArticoli();
  }, []);

  const caricaArticoli = async () => {
    const { data } = await supabase.from("articoli").select("*");
    setArticoli(data || []);
  };

  const aggiungiArticolo = async () => {
    await supabase.from("articoli").insert([{ nome }]);
    setNome("");
    caricaArticoli();
  };

  const salvaRapportino = async () => {
    await supabase.from("rapportini").insert([rapporto]);
    alert("Salvato!");
  };

const generaPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("CLAUDIO CARLINI", 20, 20);

  doc.setFontSize(12);

  doc.text("Cliente: " + (rapporto.cliente || ""), 20, 40);
  doc.text("Indirizzo: " + (rapporto.indirizzo || ""), 20, 50);
  doc.text("Tecnico: " + (rapporto.tecnico || ""), 20, 60);

  doc.text("Descrizione:", 20, 80);
  doc.text(rapporto.descrizione || "-", 20, 90);

  doc.save("rapportino.pdf");
};
  
  return (
    <div style={{ padding: 20 }}>
      <h1>Gestionale Infissi</h1>

      <h2>Magazzino</h2>
      <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome articolo" />
      <button onClick={aggiungiArticolo}>Aggiungi</button>

      <h2>Rapportino</h2>
      <input placeholder="Cliente" onChange={e => setRapporto({ ...rapporto, cliente: e.target.value })} />
      <input placeholder="Indirizzo" onChange={e => setRapporto({ ...rapporto, indirizzo: e.target.value })} />
      <input placeholder="Tecnico" onChange={e => setRapporto({ ...rapporto, tecnico: e.target.value })} />
      <textarea placeholder="Descrizione" onChange={e => setRapporto({ ...rapporto, descrizione: e.target.value })} />

      <br /><br />
      <button onClick={salvaRapportino}>Salva</button>
      <button onClick={generaPDF}>PDF</button>
    </div>
  );
}
