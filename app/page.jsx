"use client";
import { useState } from "react";

export default function Home() {
  const [nome, setNome] = useState("");

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

        <button style={styles.button}>
          Aggiungi
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#1a1a1a",
  },
  card: {
    backgroundColor: "white",
    padding: "30px",
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
    fontWeight: "bold",
  },
};
