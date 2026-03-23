"use client";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";

export default function Home() {
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [lavoro, setLavoro] = useState("");
  const [ore, setOre] = useState("");
  const [operai, setOperai] = useState("");

  const [articoli, setArticoli] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("articoli")) || [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("articoli", JSON.stringify(articoli));
  }, [articoli]);

  const aggiungi = () => {
    if (!nome) return;
    setArticoli([...articoli, nome]);
    setNome("");
  };

  const elimina = (index) => {
    const nuovi = articoli.filter((_, i) => i !== index);
    setArticoli(nuovi);
  };

  const generaPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("RAPPORTINO INTERVENTO", 105, 20, null, null, "center");

    const oggi = new Date().toLocaleDateString();

    doc.setFontSize(11);
    doc.text(`Data: ${oggi}`, 10, 30);
    doc.text(`Cliente: ${cliente}`, 10, 40);
    doc.text(`Indirizzo: ${indirizzo}`, 10, 50);

    doc.line(10, 55, 200, 55);

    doc.text("Lavoro eseguito:", 10, 65);
    doc.text(lavoro || "-", 10, 75);

    doc.text(`Ore lavorate: ${ore}`, 10, 90);
    doc.text(`Operai: ${operai}`, 10, 100);

    doc.line(10, 105, 200, 105);

    doc.text("Materiali utilizzati:", 10, 115);

    let y = 125;
    articoli.forEach((item, index) => {
      doc.text(`- ${item}`, 10, y);
      y += 10;
    });

    doc.save("rapportino.pdf");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestionale Interventi</h1>

      {/* CLIENTE */}
      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Nome cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Indirizzo"
          value={indirizzo}
          onChange={(e) => setIndirizzo(e.target.value)}
        />
      </div>

      {/* LAVORO */}
      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Descrizione lavoro"
          value={lavoro}
          onChange={(e) => setLavoro(e.target.value)}
        />
      </div>

      {/* ORE + OPERAI */}
      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Ore lavorate"
          value={ore}
          onChange={(e) => setOre(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Numero dipendenti"
          value={operai}
          onChange={(e) => setOperai(e.target.value)}
        />
      </div>

      {/* AGGIUNTA ARTICOLI */}
      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Nome materiale"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <button style={styles.button} onClick={aggiungi}>
          Aggiungi
        </button>
      </div>

      {/* LISTA */}
      <div style={styles.lista}>
        <button style={styles.pdfButton} onClick={generaPDF}>
          Scarica PDF
        </button>

        {articoli.map((item, index) => (
          <div key={index} style={styles.item}>
            <span>{item}</span>
            <button
              style={styles.delete}
              onClick={() => elimina(index)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 STILI
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "60px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  lista: {
    marginTop: "20px",
    width: "300px",
  },
  item: {
    backgroundColor: "white",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },
  delete: {
    backgroundColor: "red",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  pdfButton: {
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
  },
};
