"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sdlytrkrhgltitcjctsm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

export default function Home() {
  const [articoli, setArticoli] = useState([]);
  const [materiali, setMateriali] = useState([]);

  const [rapporto, setRapporto] = useState({
    cliente: "",
    indirizzo: "",
    tecnico: "",
    descrizione: "",
  });

  const [materialeSelezionato, setMaterialeSelezionato] = useState("");
  const [quantita, setQuantita] = useState(1);

  useEffect(() => {
    caricaArticoli();
  }, []);

  const caricaArticoli = async () => {
    const { data } = await supabase.from("articoli").select("*");
    setArticoli(data || []);
  };

  const aggiungiMateriale = () => {
    const articolo = articoli.find(a => a.id === materialeSelezionato);
    if (!articolo) return;

    setMateriali([
      ...materiali,
      { ...articolo, quantitaUsata: quantita }
    ]);
  };

  const salvaRapportino = async () => {
    const { data } = await supabase
      .from("rapportini")
      .insert([rapporto])
      .select();

    const id = data[0].id;

    for (let m of materiali) {
      await supabase.from("materiali_rapportino").insert([{
        rapportino_id: id,
        nome: m.nome,
        colore: m.colore,
        quantita: m.quantitaUsata
      }]);

      await supabase.from("articoli")
        .update({ quantita: m.quantita - m.quantitaUsata })
        .eq("id", m.id);
    }

    alert("Rapportino salvato!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Gestionale Infissi</h1>

      <h2>Rapportino</h2>
      <input placeholder="Cliente" onChange={e => setRapporto({ ...rapporto, cliente: e.target.value })} />
      <input placeholder="Indirizzo" onChange={e => setRapporto({ ...rapporto, indirizzo: e.target.value })} />
      <input placeholder="Tecnico" onChange={e => setRapporto({ ...rapporto, tecnico: e.target.value })} />
      <textarea placeholder="Descrizione" onChange={e => setRapporto({ ...rapporto, descrizione: e.target.value })} />

      <h3>Materiali</h3>
      <select onChange={e => setMaterialeSelezionato(e.target.value)}>
        <option>Seleziona materiale</option>
        {articoli.map(a => (
          <option key={a.id} value={a.id}>
            {a.nome} - {a.colore} ({a.quantita})
          </option>
        ))}
      </select>

      <input type="number" value={quantita} onChange={e => setQuantita(Number(e.target.value))} />

      <button onClick={aggiungiMateriale}>Aggiungi materiale</button>

      <h4>Materiali usati</h4>
      {materiali.map((m, i) => (
        <p key={i}>{m.nome} ({m.colore}) x{m.quantitaUsata}</p>
      ))}

      <button onClick={salvaRapportino}>Salva Rapportino</button>
    </div>
  );
}
