"use client";
import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface JwtPayload {
  customerId: string;
}

export default function Home() {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();  // Hook de navegação para redirecionamento

  const handleLogin = async () => {
    if (!userName) {
      setError("Insira um nome de usuário.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName }),
      });

      if (!response.ok) {
        throw new Error("Falha no login. Verifique suas credenciais.");
      }

      const data = await response.json();

      // Decodificar o token JWT
      const decodedToken = jwtDecode<JwtPayload>(data.token);

      // Salvar o customerId no localStorage
      sessionStorage.setItem("customerId", decodedToken.customerId);
      router.push("/request-ride");

      alert("Login realizado com sucesso!");
    } catch (err) {
      console.error("Erro ao realizar login:", err);
      setError("Erro ao realizar login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <main>
        <h1>Login</h1>
        <br />
        <div className="login-form">
          <label htmlFor="username">Nome de Usuário:</label>
          <input
            id="username"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Digite seu nome de usuário"
            disabled={loading}
          />
          
          <Link className="link" href="/register">Não possui conta? Criar conta</Link>
        </div>
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </main>
    </div>
  );
}
