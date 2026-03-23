"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";

const supabase = createClient(
  "https://fenymltejrxvbtfmahsb.supabase.co",
  "sb_publishable_HGSNVbXgM0fZ-jJUYHLfig_Z_9MyeKh"
);

export default function Home() {
  const [cliente, setCliente] = useState("");
  const [lavoro, setLavoro] = useState("");
  const [ore, setOre] = useState("");
  const [operai, setOperai] = useState("");

  const [articolo, setArticolo] = useState("");
  const [articoli, setArticoli] = useState([]);

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

  // 🔹 MATERIALI
  const aggiungiMateriale = () => {
    if (!articolo) return;
    setArticoli([...articoli, articolo]);
    setArticolo("");
  };

  const eliminaMateriale = (i) => {
    setArticoli(articoli.filter((_, index) => index !== i));
  };

  // 🔹 CARICA INTERVENTO
  const caricaIntervento = (r) => {
    setCliente(r.cliente || "");
    setLavoro(r.lavoro || "");
    setOre(r.ore || "");
    setOperai(r.operai || "");
    setArticoli(r.materiali || []);
    setIdModifica(r.id);
  };

  // 🔹 SALVA / MODIFICA
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
          materiali: articoli,
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
          materiali: articoli,
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
      setArticoli([]);
      setIdModifica(null);

      caricaStorico();
    }
  };

  // 🔹 ARCHIVIA
  const archivia = async (id) => {
    await supabase
      .from("rapportini")
      .update({ archiviato: true })
      .eq("id", id);

    caricaStorico();
  };

  // 🔹 PDF
  const generaPDF = () => {
    const doc = new jsPDF();

    doc.text("Rapportino lavoro", 20, 20);
    doc.text(`Cliente: ${cliente}`, 20, 30);
    doc.text(`Lavoro: ${lavoro}`, 20, 40);
    doc.text(`Ore uomo: ${oreUomo}`, 20, 50);

    let y = 60;
    articoli.forEach((a) => {
      doc.text(`- ${a}`, 20, y);
      y += 10;
    });

    doc.save("rapportino.pdf");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Gestione Rapportini</h2>

      <input placeholder="Cliente" value={cliente} onChange={(e)=>setCliente(e.target.value)} />
      <input placeholder="Lavoro" value={lavoro} onChange={(e)=>setLavoro(e.target.value)} />
      <input placeholder="Ore" value={ore} onChange={(e)=>setOre(e.target.value)} />
      <input placeholder="Operai" value={operai} onChange={(e)=>setOperai(e.target.value)} />

      <p><b>Ore uomo: {oreUomo}</b></p>

      {/* 🔹 MATERIALI */}
      <input
        placeholder="Materiale"
        value={articolo}
        onChange={(e)=>setArticolo(e.target.value)}
      />

      <button onClick={aggiungiMateriale}>Aggiungi materiale</button>

      {articoli.map((a,i)=>(
        <div key={i}>
          {a} <button onClick={()=>eliminaMateriale(i)}>❌</button>
        </div>
      ))}

      <br/>

      <button onClick={salva}>💾 Salva</button>
      <button onClick={generaPDF}>📄 PDF</button>

      <hr/>

      <button onClick={() => setMostraArchivio(!mostraArchivio)}>
        {mostraArchivio ? "Mostra attivi" : "Mostra archivio"}
      </button>

      {storico
        .filter((r) => mostraArchivio ? r.archiviato : !r.archiviato)
        .map((r,i)=>(
          <div key={i} style={{border:"1px solid #ccc", margin:10, padding:10}}>
            <b>{r.cliente}</b><br/>
            {r.lavoro}<br/>
            Ore uomo: {r.ore_uomo}

            <br/>

            <button onClick={()=>caricaIntervento(r)}>✏️ Apri</button>

            {!r.archiviato && (
              <button onClick={()=>archivia(r.id)}>📦 Archivia</button>
            )}
          </div>
      ))}
    </div>
  );
}
