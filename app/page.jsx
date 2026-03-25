"use client";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fenymltejrxvbtfmahsb.supabase.co",
  "sb_publishable_HGSNVbXgM0fZ-jJUYHLfig_Z_9MyeKh"
);

export default function Home() {

  // 🔐 LOGIN
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 📋 DATI
  const [cliente, setCliente] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [lavoro, setLavoro] = useState("");
  const [ore, setOre] = useState("");
  const [operai, setOperai] = useState("");
  const [articolo, setArticolo] = useState("");
  const [articoli, setArticoli] = useState([]);
  const [storico, setStorico] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [editId, setEditId] = useState(null);
  const [mostraArchivio, setMostraArchivio] = useState(false);

  const oreUomo = (Number(ore) || 0) * (Number(operai) || 0);

  // 🔐 SESSIONE
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        carica(data.session.user.id, data.session.user.email);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        carica(session.user.id, session.user.email);
      }
    });
  }, [mostraArchivio]);

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // 📥 CARICA DATI
  const carica = async (userId, email) => {
    let query = supabase
      .from("rapportini")
      .select("*")
      .order("created_at", { ascending: false });

    if (email !== "admin@carlini.it") {
      query = query.eq("user_id", userId);
    }

    query = query.eq("archiviato", mostraArchivio);

    const { data } = await query;
    setStorico(data || []);
  };

  // ➕ MATERIALI
  const aggiungi = () => {
    if (!articolo) return;
    setArticoli([...articoli, articolo]);
    setArticolo("");
  };

  const elimina = (i) => {
    setArticoli(articoli.filter((_, index) => index !== i));
  };

  // 💾 SALVA / MODIFICA
  const salva = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    const dati = {
      cliente,
      indirizzo,
      lavoro,
      ore,
      operai,
      ore_uomo: oreUomo,
      materiali: articoli || [],
      user_id: user.id,
    };

    if (editId) {
      await supabase.from("rapportini").update(dati).eq("id", editId);
      alert("Modificato!");
    } else {
      await supabase.from("rapportini").insert([dati]);
      alert("Salvato!");
    }

    reset();
    carica(user.id, user.email);
  };

  const modifica = (r) => {
    setCliente(r.cliente);
    setIndirizzo(r.indirizzo);
    setLavoro(r.lavoro);
    setOre(r.ore);
    setOperai(r.operai);
    setArticoli(r.materiali || []);
    setEditId(r.id);
  };

  const archivia = async (id) => {
    await supabase.from("rapportini").update({ archiviato: true }).eq("id", id);
    const user = (await supabase.auth.getUser()).data.user;
    carica(user.id, user.email);
  };

  const eliminaDefinitivo = async (id) => {
    await supabase.from("rapportini").delete().eq("id", id);
    const user = (await supabase.auth.getUser()).data.user;
    carica(user.id, user.email);
  };

  const reset = () => {
    setCliente("");
    setIndirizzo("");
    setLavoro("");
    setOre("");
    setOperai("");
    setArticoli([]);
    setEditId(null);
  };

  // 📄 PDF
  const generaPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Rapportino intervento", 105, 20, null, null, "center");

    doc.setFontSize(11);
    doc.text(`Cliente: ${cliente}`, 10, 40);
    doc.text(`Indirizzo: ${indirizzo}`, 10, 50);
    doc.text(`Lavoro: ${lavoro}`, 10, 60);
    doc.text(`Ore uomo: ${oreUomo}`, 10, 70);

    let y = 80;
    articoli.forEach((a) => {
      doc.text(`- ${a}`, 10, y);
      y += 10;
    });

    doc.save("rapportino.pdf");
  };

  const filtrati = storico.filter((r) =>
    r.cliente?.toLowerCase().includes(filtro.toLowerCase())
  );

  // 🔐 LOGIN UI
  if (!session) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>🔐 Login Operai</h2>

        <input style={styles.input} placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />

        <button style={styles.btn} onClick={login}>Accedi</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📱 Rapportini Carlini</h1>

      <button style={styles.logout} onClick={logout}>Logout</button>

      <button style={styles.btn} onClick={() => setMostraArchivio(!mostraArchivio)}>
        {mostraArchivio ? "📂 Vedi attivi" : "📦 Vedi archivio"}
      </button>

      <input style={styles.input} placeholder="Cliente" value={cliente} onChange={(e)=>setCliente(e.target.value)} />
      <input style={styles.input} placeholder="Indirizzo" value={indirizzo} onChange={(e)=>setIndirizzo(e.target.value)} />
      <input style={styles.input} placeholder="Lavoro" value={lavoro} onChange={(e)=>setLavoro(e.target.value)} />

      <div style={styles.row}>
        <input style={styles.input} placeholder="Ore" value={ore} onChange={(e)=>setOre(e.target.value)} />
        <input style={styles.input} placeholder="Operai" value={operai} onChange={(e)=>setOperai(e.target.value)} />
      </div>

      <p><b>Ore uomo: {oreUomo}</b></p>

      <input style={styles.input} placeholder="Materiale" value={articolo} onChange={(e)=>setArticolo(e.target.value)} />
      <button style={styles.btn} onClick={aggiungi}>+ Materiale</button>

      {articoli.map((a,i)=>(
        <div key={i}>{a} <button onClick={()=>elimina(i)}>❌</button></div>
      ))}

      <button style={styles.save} onClick={salva}>💾 Salva</button>
      <button style={styles.pdf} onClick={generaPDF}>📄 PDF</button>

      <hr/>

      <input style={styles.input} placeholder="Filtro cliente" value={filtro} onChange={(e)=>setFiltro(e.target.value)} />

      {filtrati.map((r)=>(
        <div key={r.id} style={styles.card}>
          <b>{r.cliente}</b><br/>
          {r.indirizzo}<br/>
          Ore uomo: {r.ore_uomo}

          <div style={{marginTop:10}}>
            {!mostraArchivio && (
              <>
                <button onClick={()=>modifica(r)}>✏️</button>
                <button onClick={()=>archivia(r.id)}>📦</button>
              </>
            )}

            {mostraArchivio && (
              <button onClick={()=>eliminaDefinitivo(r.id)}>🗑 Elimina</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// 🎨 STILE APPLE
const styles = {
  container: { padding:16, maxWidth:420, margin:"auto", background:"#f2f2f7", minHeight:"100vh" },
  title: { fontSize:24, fontWeight:"600", marginBottom:15 },
  input: { width:"100%", padding:14, marginBottom:10, borderRadius:12, border:"none", background:"white" },
  btn: { width:"100%", padding:14, borderRadius:12, background:"#007AFF", color:"white", border:"none", marginBottom:10 },
  save: { width:"100%", padding:16, borderRadius:14, background:"#34C759", color:"white", border:"none", fontWeight:"600" },
  pdf: { width:"100%", padding:14, borderRadius:12, background:"#5856D6", color:"white", border:"none", marginTop:10 },
  logout: { marginBottom:10, background:"red", color:"white", border:"none", padding:10, borderRadius:8 },
  row: { display:"flex", gap:10 },
  card: { background:"white", padding:14, borderRadius:14, marginTop:10 }
};
