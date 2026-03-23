"use client";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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
  const [filtroCliente, setFiltroCliente] = useState("");
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

  const aggiungi = () => {
    if (!articolo) return;
    setArticoli([...articoli, articolo]);
    setArticolo("");
  };

  const elimina = (index) => {
    setArticoli(articoli.filter((_, i) => i !== index));
  };

  const caricaIntervento = (r) => {
    setCliente(r.cliente || "");
    setIndirizzo(r.indirizzo || "");
    setLavoro(r.lavoro || "");
    setOre(r.ore || "");
    setOperai(r.operai || "");
    setArticoli(r.materiali || []);
    setIdModifica(r.id);
  };

  const salva = async () => {
    let query;

    if (idModifica) {
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

    doc.setFontSize(18);
    doc.text("GESTIONE RAPPORTINI", 105, 20, null, null, "center");

    const oggi = new Date().toLocaleDateString();

    doc.setFontSize(11);
    doc.text(`Data: ${oggi}`, 10, 30);
    doc.text(`Cliente: ${cliente}`, 10, 40);
    doc.text(`Indirizzo: ${indirizzo}`, 10, 50);

    doc.line(10, 55, 200, 55);

    doc.text("Lavoro:", 10, 65);
    doc.text(lavoro || "-", 10, 75);

    doc.text(`Ore: ${ore}`, 10, 90);
    doc.text(`Operai: ${operai}`, 10, 100);
    doc.text(`Ore uomo: ${oreUomo}`, 10, 110);

    doc.line(10, 115, 200, 115);

    doc.text("Materiali:", 10, 125);

    let y = 135;
    articoli.forEach((item) => {
      doc.text(`- ${item}`, 10, y);
      y += 10;
    });

    doc.save("rapportino.pdf");
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Gestione Rapportini</h2>

      {idModifica && (
        <p style={{ color: "orange" }}>✏️ Stai modificando intervento</p>
      )}

      <input placeholder="Cliente" value={cliente} onChange={(e)=>setCliente(e.target.value)} />
      <input placeholder="Indirizzo" value={indirizzo} onChange={(e)=>setIndirizzo(e.target.value)} />
      <input placeholder="Lavoro" value={lavoro} onChange={(e)=>setLavoro(e.target.value)} />

      <input placeholder="Ore" value={ore} onChange={(e)=>setOre(e.target.value)} />
      <input placeholder="Operai" value={operai} onChange={(e)=>setOperai(e.target.value)} />

      <p><b>Ore uomo: {oreUomo}</b></p>

      <input placeholder="Materiale" value={articolo} onChange={(e)=>setArticolo(e.target.value)} />
      <button onClick={aggiungi}>Aggiungi materiale</button>

      {articoli.map((a,i)=>(
        <div key={i}>
          {a} <button onClick={()=>elimina(i)}>❌</button>
        </div>
      ))}

      <br/>

      <button onClick={salva}>💾 Salva</button>
      <button onClick={generaPDF}>📄 PDF</button>

      <hr/>

      <h3>Storico interventi</h3>

      <input
        placeholder="Filtra per cliente"
        value={filtroCliente}
        onChange={(e) => setFiltroCliente(e.target.value)}
        style={{ marginBottom: 10, padding: 5 }}
      />

      <button onClick={() => setFiltroCliente("")}>
        Reset filtro
      </button>

      <button onClick={() => setMostraArchivio(!mostraArchivio)}>
        {mostraArchivio ? "Mostra attivi" : "Mostra archivio"}
      </button>

      {storico
        .filter((r) =>
          r.cliente?.toLowerCase().includes(filtroCliente.toLowerCase())
        )
        .filter((r) => mostraArchivio ? r.archiviato : !r.archiviato)
        .map((r,i)=>(
          <div
            key={i}
            onClick={() => caricaIntervento(r)}
            style={{
              border:"1px solid #ccc",
              margin:10,
              padding:10,
              cursor:"pointer",
              opacity: r.archiviato ? 0.5 : 1
            }}
          >
            <b>{r.cliente}</b><br/>
            {r.lavoro}<br/>
            Ore uomo: {r.ore_uomo}

            {!r.archiviato && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  archivia(r.id);
                }}
                style={{ marginTop: 5 }}
              >
                📦 Archivia
              </button>
            )}
          </div>
      ))}
    </div>
  );
}
