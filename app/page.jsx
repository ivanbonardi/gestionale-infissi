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
  const [indirizzo, setIndirizzo] = useState("");
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

  const aggiungiMateriale = () => {
    if (!articolo) return;
    setArticoli([...articoli, articolo]);
    setArticolo("");
  };

  const eliminaMateriale = (i) => {
    setArticoli(articoli.filter((_, index) => index !== i));
  };

  // 🔥 FIX DEFINITIVO CRASH


  const salva = async () => {
    let query;
    const caricaIntervento = (r) => {
  setCliente(r.cliente || "");
  setIndirizzo(r.indirizzo || "");
  setLavoro(r.lavoro || "");
  setOre(r.ore || "");
  setOperai(r.operai || "");

  // 🔥 FIX COMPLETO MATERIALI
  if (Array.isArray(r.materiali)) {
    setArticoli(r.materiali);
  } else if (typeof r.materiali === "string") {
    try {
      setArticoli(JSON.parse(r.materiali));
    } catch {
      setArticoli([]);
    }
  } else {
    setArticoli([]);
  }

  setIdModifica(r.id);
  window.scrollTo({ top: 0, behavior: "smooth" });
};
    if (idModifica !== null) {
      query = supabase
        .from("rapportini")
        .update({
          cliente,
          indirizzo,
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
          indirizzo,
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
      alert(idModifica ? "Modificato!" : "Salvato!");

      setCliente("");
      setIndirizzo("");
      setLavoro("");
      setOre("");
      setOperai("");
      setArticoli([]);
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

  const generaPDF = () => {
    const doc = new jsPDF();

    doc.text("Rapportino lavoro", 20, 20);
    doc.text(`Cliente: ${cliente}`, 20, 30);
    doc.text(`Indirizzo: ${indirizzo}`, 20, 40);
    doc.text(`Lavoro: ${lavoro}`, 20, 50);
    doc.text(`Ore uomo: ${oreUomo}`, 20, 60);

    let y = 70;
    (articoli || []).forEach((a) => {
      doc.text(`- ${a}`, 20, y);
      y += 10;
    });

    doc.save("rapportino.pdf");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestione Rapportini</h1>

      {idModifica !== null && (
        <p style={{ color: "orange" }}>✏️ Modalità modifica</p>
      )}

      <div style={styles.card}>
        <input style={styles.input} placeholder="Cliente" value={cliente} onChange={(e)=>setCliente(e.target.value)} />
        <input style={styles.input} placeholder="Indirizzo cliente" value={indirizzo} onChange={(e)=>setIndirizzo(e.target.value)} />
        <input style={styles.input} placeholder="Lavoro" value={lavoro} onChange={(e)=>setLavoro(e.target.value)} />

        <div style={{display:"flex", gap:10}}>
          <input style={styles.input} placeholder="Ore" value={ore} onChange={(e)=>setOre(e.target.value)} />
          <input style={styles.input} placeholder="Operai" value={operai} onChange={(e)=>setOperai(e.target.value)} />
        </div>

        <p style={styles.highlight}>Ore uomo: {oreUomo}</p>

        <input style={styles.input} placeholder="Materiale" value={articolo} onChange={(e)=>setArticolo(e.target.value)} />

        <button style={styles.smallBtn} onClick={aggiungiMateriale}>
          + Aggiungi materiale
        </button>

        {(articoli || []).map((a,i)=>(
          <div key={i} style={styles.item}>
            {a}
            <button onClick={()=>eliminaMateriale(i)}>❌</button>
          </div>
        ))}

        <div style={styles.actions}>
          <button style={styles.save} onClick={salva}>💾 Salva</button>
          <button style={styles.pdf} onClick={generaPDF}>📄 PDF</button>
        </div>
      </div>

      <button style={styles.toggle} onClick={() => setMostraArchivio(!mostraArchivio)}>
        {mostraArchivio ? "Mostra attivi" : "Mostra archivio"}
      </button>

      {storico
        .filter((r) => mostraArchivio ? r.archiviato : !r.archiviato)
        .map((r)=>(
          <div key={r.id} style={styles.card}>
            <b>{r.cliente}</b>
            <p>{r.indirizzo}</p>
            <p>{r.lavoro}</p>
            <p>Ore uomo: {r.ore_uomo}</p>

            <div style={styles.actions}>
              <button style={styles.edit} onClick={()=>caricaIntervento(r)}>✏️</button>

              {!r.archiviato && (
                <button style={styles.archive} onClick={()=>archivia(r.id)}>📦</button>
              )}
            </div>
          </div>
      ))}
    </div>
  );
}

const styles = {
  container: { background:"#f5f7fa", minHeight:"100vh", padding:20 },
  title: { fontSize:28, marginBottom:20 },
  card: { background:"white", padding:15, borderRadius:12, marginBottom:15 },
  input: { width:"100%", padding:10, marginBottom:10 },
  highlight: { fontWeight:"bold" },
  smallBtn: { marginBottom:10 },
  item: { display:"flex", justifyContent:"space-between" },
  actions: { display:"flex", gap:10 },
  save: { flex:1, background:"#0070f3", color:"white" },
  pdf: { flex:1, background:"green", color:"white" },
  toggle: { marginBottom:10 },
  edit: { flex:1, background:"orange" },
  archive: { flex:1, background:"gray" },
};
