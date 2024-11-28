"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterUser() {
  const [userName, setUserName] = useState<string>("");  // Estado para armazenar o nome de usuário
  const [loading, setLoading] = useState<boolean>(false); // Estado para controle de carregamento
  const [error, setError] = useState<string | null>(null); // Estado para controle de erro
  const router = useRouter(); // Hook de navegação para redirecionamento

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName) {
      setError("Por favor, insira um nome de usuário.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName }),
      });

      if (!response.ok) {
        throw new Error("Falha ao cadastrar. Tente novamente.");
      }
      
      alert("Cadastro realizado com sucesso!");
      
      // Redireciona o usuário após o cadastro
      router.push("/");
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);
      setError("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <main>
        <h1>Cadastro de Usuário</h1>
        <br />
        <form onSubmit={handleSubmit}>
          <div className="login-form">
            <label htmlFor="userName">Nome de Usuário:</label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome de usuário"
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </main>
    </div>
  );
}
