"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sdlytrkrhgltitcjctsm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

export default function Home() {
  const [articoli, setArticoli] = useState([]);
  const [rapportini, setRapportini] = useState([]);

  const [articolo, setArticolo] = useState({
    nome: "",
    categoria: "",
    colore: "",
    quantita: 0,
  });

  const [rapporto, setRapporto] = useState({
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
    await supabase.from("articoli").insert([articolo]);
    setArticolo({ nome: "", categoria: "", colore: "", quantita: 0 });
    caricaArticoli();
  };

  const salvaRapportino = async () => {
    await supabase.from("rapportini").insert([rapporto]);
    setRapporto({ cliente: "", indirizzo: "", tecnico: "", descrizione: "" });
    caricaRapportini();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Gestionale Infissi</h1>

      <h2>Magazzino</h2>
      <input placeholder="Nome" onChange={e => setArticolo({ ...articolo, nome: e.target.value })} />
      <input placeholder="Categoria" onChange={e => setArticolo({ ...articolo, categoria: e.target.value })} />
      <input placeholder="Colore" onChange={e => setArticolo({ ...articolo, colore: e.target.value })} />
      <input type="number" placeholder="Quantità" onChange={e => setArticolo({ ...articolo, quantita: Number(e.target.value) })} />
      <button onClick={aggiungiArticolo}>Salva Articolo</button>

      <h2>Rapportino</h2>
      <input placeholder="Cliente" onChange={e => setRapporto({ ...rapporto, cliente: e.target.value })} />
      <input placeholder="Indirizzo" onChange={e => setRapporto({ ...rapporto, indirizzo: e.target.value })} />
      <input placeholder="Tecnico" onChange={e => setRapporto({ ...rapporto, tecnico: e.target.value })} />
      <textarea placeholder="Descrizione" onChange={e => setRapporto({ ...rapporto, descrizione: e.target.value })} />
      <button onClick={salvaRapportino}>Salva Rapportino</button>

      <h3>Articoli</h3>
      {articoli.map((a, i) => (
        <p key={i}>{a.nome} - {a.colore} ({a.quantita})</p>
      ))}

      <h3>Rapportini</h3>
      {rapportini.map((r, i) => (
        <p key={i}>{r.cliente}</p>
      ))}
    </div>
  );
}
