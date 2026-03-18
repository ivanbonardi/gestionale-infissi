"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";

const supabase = createClient(
  "https://sdlytrkrhgltitcjctsm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbHl0cmtyaGdsdGl0Y2pjdHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTgxOTUsImV4cCI6MjA4OTM5NDE5NX0.kv6ddw0Jxpvx9v3TxdMb4vEd2pdcPbq-D3nnbntvN4E"
);

export default function Home() {
  const [articoli, setArticoli] = useState([]);
  const [rapportini, setRapportini] = useState([]);

  const [nuovoArticolo, setNuovoArticolo] = useState({
    nome: "",
    categoria: "",
    colore: "",
    marca: "",
    quantita: 0,
  });

  const [nuovoRapportino, setNuovoRapportino] = useState({
    cliente: "",
    indirizzo: "",
    tecnico: "",
    descrizione: "",
  });

  useEffect(() => {
    caricaArticoli();
    caricaRapportini();
  }, []);

  const caricaArticoli = async () => {
    const { data } = await supabase.from("articoli").select("*");
    setArticoli(data || []);
  };

  const caricaRapportini = async () => {
    const { data } = await supabase.from("rapportini").select("*");
    setRapportini(data || []);
  };

  const aggiungiArticolo = async () => {
    await supabase.from("articoli").insert([nuovoArticolo]);
    setNuovoArticolo({ nome: "", categoria: "", colore: "", marca: "", quantita: 0 });
    caricaArticoli();
  };

  const salvaRapportino = async () => {
    await supabase.from("rapportini").insert([nuovoRapportino]);
    setNuovoRapportino({ cliente: "", indirizzo: "", tecnico: "", descrizione: "" });
    caricaRapportini();
  };

  const generaPDF = (r) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("CLAUDIO CARLINI", 70, 20);

    doc.setFontSize(12);
    doc.text(`Cliente: ${r.cliente}`, 20, 50);
    doc.text(`Indirizzo: ${r.indirizzo}`, 20, 60);
    doc.text(`Tecnico: ${r.tecnico}`, 20, 70);
    doc.text(`Descrizione: ${r.descrizione}`, 20, 80);

    doc.save(`rapportino_${r.cliente}.pdf`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Gestionale Infissi</h1>

      <h2>Nuovo Articolo</h2>
      <input placeholder="Nome" onChange={(e) => setNuovoArticolo({ ...nuovoArticolo, nome: e.target.value })} />
      <input placeholder="Categoria" onChange={(e) => setNuovoArticolo({ ...nuovoArticolo, categoria: e.target.value })} />
      <input placeholder="Colore" onChange={(e) => setNuovoArticolo({ ...nuovoArticolo, colore: e.target.value })} />
      <input placeholder="Marca" onChange={(e) => setNuovoArticolo({ ...nuovoArticolo, marca: e.target.value })} />
      <input type="number" placeholder="Quantità" onChange={(e) => setNuovoArticolo({ ...nuovoArticolo, quantita: Number(e.target.value) })} />
      <button onClick={aggiungiArticolo}>Salva</button>

      <h2>Nuovo Rapportino</h2>
      <input placeholder="Cliente" onChange={(e) => setNuovoRapportino({ ...nuovoRapportino, cliente: e.target.value })} />
      <input placeholder="Indirizzo" onChange={(e) => setNuovoRapportino({ ...nuovoRapportino, indirizzo: e.target.value })} />
      <input placeholder="Tecnico" onChange={(e) => setNuovoRapportino({ ...nuovoRapportino, tecnico: e.target.value })} />
      <textarea placeholder="Descrizione lavoro" onChange={(e) => setNuovoRapportino({ ...nuovoRapportino, descrizione: e.target.value })} />
      <button onClick={salvaRapportino}>Salva Rapportino</button>

      <h2>Rapportini</h2>
      {rapportini.map((r, i) => (
        <div key={i}>
          <p>{r.cliente}</p>
          <button onClick={() => generaPDF(r)}>PDF</button>
        </div>
      ))}
    </div>
  );
}
