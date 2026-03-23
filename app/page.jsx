"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fenymltejrxvbtfmahsb.supabase.co",
  "sb_publishable_HGSNVbXgM0fZ-jJUYHLfig_Z_9MyeKh"
);

export default function Home() {
  const [cliente, setCliente] = useState("");
  const [lavoro, setLavoro] = useState("");
  const [ore, setOre] = useState("");
  const [operai, setOperai] = useState("");
  const [storico, setStorico] = useState([]);
  const [idModifica, setIdModifica] = useState(null);
  const [mostraArchivio, setMostraArchivio] = useState(false);

  const oreUomo = (Number(ore) || 0) * (Number(operai) || 0);

  useEffect(() => {
    caricaStorico();
  }, []);

  const caricaStorico = async () => {
    const { data } = await supabase
      .from("rapportini")
      .select("*")
      .order("created_at", { ascending: false });

    setStorico(data || []);
  };

  const salva = async () => {
    let query;

    if (idModifica) {
      query = supabase
        .from("rapportini")
        .update({
          cliente,
          lavoro,
          ore,
          operai,
          ore_uomo: oreUomo,
        })
        .eq("id", idModifica);
    } else {
      query = supabase.from("rapportini").insert([
        {
          cliente,
          lavoro,
          ore,
          operai,
          ore_uomo: oreUomo,
          archiviato: false,
        },
      ]);
    }

    const { error } = await query;

    if (error) {
      alert(error.message);
    } else {
      alert("Salvato!");
      setCliente("");
      setLavoro("");
      setOre("");
      setOperai("");
      setIdModifica(null);
      caricaStorico();
    }
  };

  const archivia = async (id) => {
    await supabase
      .from("rapportini")
      .update({ archiviato: true })
      .eq("id", id);

    caricaStorico();
  };

  const caricaIntervento = (r) => {
    setCliente(r.cliente || "");
    setLavoro(r.lavoro || "");
    setOre(r.ore || "");
    setOperai(r.operai || "");
    setIdModifica(r.id);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Gestione Rapportini</h2>

      <input placeholder="Cliente" value={cliente} onChange={(e)=>setCliente(e.target.value)} />
      <input placeholder="Lavoro" value={lavoro} onChange={(e)=>setLavoro(e.target.value)} />
      <input placeholder="Ore" value={ore} onChange={(e)=>setOre(e.target.value)} />
      <input placeholder="Operai" value={operai} onChange={(e)=>setOperai(e.target.value)} />

      <p>Ore uomo: {oreUomo}</p>

      <button onClick={salva}>Salva</button>

      <hr/>

      <button onClick={() => setMostraArchivio(!mostraArchivio)}>
        {mostraArchivio ? "Attivi" : "Archivio"}
      </button>

      {storico
        .filter((r) => mostraArchivio ? r.archiviato : !r.archiviato)
        .map((r,i)=>(
          <div key={i} style={{border:"1px solid black", margin:10, padding:10}}>
            <b>{r.cliente}</b><br/>
            {r.lavoro}<br/>
            Ore uomo: {r.ore_uomo}

            <br/>

            <button onClick={()=>caricaIntervento(r)}>Apri</button>

            {!r.archiviato && (
              <button onClick={()=>archivia(r.id)}>Archivia</button>
            )}
          </div>
      ))}
    </div>
  );
}
