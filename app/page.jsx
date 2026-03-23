"use client";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";

export default function Home() {
  const [nome, setNome] = useState("");
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestionale Infissi</h1>

      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Nome articolo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <button style={styles.button} onClick={aggiungi}>
          Aggiungi
        </button>
      </div>

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

const styles = {
  container: { ... },
  title: { ... },
  card: { ... },
  input: { ... },
  button: { ... },
  lista: { ... },
  item: { ... },
  delete: { ... },

  // 👇 AGGIUNGI QUESTO
  pdfButton: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
  },

  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    display: "flex",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
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
    marginTop: "30px",
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
  const generaPDF = () => {
  const doc = new jsPDF();

  // Logo (se lo aggiungiamo dopo)
  // doc.addImage(...)

  // Titolo
  doc.setFontSize(20);
  doc.text("PREVENTIVO INFISSI", 105, 20, null, null, "center");

  // Data
  const oggi = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.text(`Data: ${oggi}`, 150, 30);

  // Linea
  doc.line(10, 35, 200, 35);

  // Lista articoli
  doc.setFontSize(12);
  let y = 45;

  articoli.forEach((item, index) => {
    doc.text(`${index + 1}. ${item}`, 10, y);
    y += 10;
  });

  // Totale (placeholder)
  doc.setFontSize(14);
  doc.text(`Totale articoli: ${articoli.length}`, 10, y + 10);

  doc.save("preventivo.pdf");
};
};
