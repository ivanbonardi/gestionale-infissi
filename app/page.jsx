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
  const [search, setSearch] = useState("");

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

  const caricaIntervento = (r) => {
    setCliente(r.cliente || "");
    setIndirizzo(r.indirizzo || "");
    setLavoro(r.lavoro || "");
    setOre(r.ore || "");
    setOperai(r.operai || "");

    if (Array.isArray(r.materiali)) {
      setArticoli(r.materiali);
    } else {
      setArticoli([]);
    }

    setIdModifica(r.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const salva = async () => {
    if (!cliente || !lavoro) {
      alert("Compila almeno cliente e lavoro");
      return;
    }

    const materialiPuliti = articoli.length ? articoli : [];

    let query;

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
          materiali: materialiPuliti,
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
          materiali: materialiPuliti,
          archiviato: false,
          data: new Date().toISOString(),
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

  const ripristina = async (id) => {
    await supabase
      .from("rapportini")
      .update({ archiviato: false })
      .eq("id", id);

    caricaStorico();
  };

  const generaPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("RAPPORTINO DI LAVORO", 20, 20);

    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente}`, 20, 40);
    doc.text(`Indirizzo: ${indirizzo}`, 20, 50);
    doc.text(`Lavoro: ${lavoro}`, 20, 60);

    doc.setFontSize(14);
    doc.text(`Ore uomo: ${oreUomo}`, 20, 75);

    let y = 90;
    articoli.forEach((a) => {
      doc.text(`- ${a}`, 20, y);
      y += 10;
    });

    doc.save("rapportino.pdf");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestione Rapportini</h1>

      <input
        style={styles.input}
        placeholder="Cerca cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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

        {articoli.map((a,i)=>(
          <div key={i} style={styles.item}>
            {a}
            <button onClick={()=>eliminaMateriale(i)}>❌</button>
          </div>
        ))}

        <div style={styles.actions}>
         <button style={styles.save} onClick={salva}>
  💾 Salva intervento
</button>

<button style={styles.pdf} onClick={generaPDF}>
  📄 Genera PDF
</button>
        </div>
      </div>

      <button style={styles.toggle} onClick={() => setMostraArchivio(!mostraArchivio)}>
        {mostraArchivio ? "Mostra attivi" : "Mostra archivio"}
      </button>

      {storico
        .filter((r) => (mostraArchivio ? r.archiviato : !r.archiviato))
        .filter((r) => r.cliente.toLowerCase().includes(search.toLowerCase()))
        .map((r)=>(
          <div key={r.id} style={styles.card}>
            <b>{r.cliente}</b>
            <p>{r.indirizzo}</p>
            <p>{r.lavoro}</p>
            <p>{new Date(r.created_at).toLocaleDateString()}</p>
            <p>Ore uomo: {r.ore_uomo}</p>

            <div style={styles.actions}>
              <button style={styles.edit} onClick={()=>caricaIntervento(r)}>✏️</button>

              {!r.archiviato ? (
                <button style={styles.archive} onClick={()=>archivia(r.id)}>📦</button>
              ) : (
                <button style={styles.save} onClick={()=>ripristina(r.id)}>♻️</button>
              )}
            </div>
          </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: 16,
    maxWidth: 420,
    margin: "auto",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: "#f2f2f7",
    minHeight: "100vh"
  },

  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 20
  },

  input: {
    width: "100%",
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    border: "none",
    backgroundColor: "white",
    fontSize: 16
  },

  btn: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    color: "white",
    border: "none",
    fontSize: 16,
    marginBottom: 10
  },

  save: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#34C759",
    color: "white",
    border: "none",
    fontSize: 18,
    fontWeight: "600"
  },

  pdf: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#5856D6",
    color: "white",
    border: "none",
    fontSize: 16,
    marginTop: 10
  },

  row: {
    display: "flex",
    gap: 10
  },

  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  }
};
