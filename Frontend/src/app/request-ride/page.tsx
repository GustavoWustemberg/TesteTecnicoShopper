"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Form from "@/Components/form";

export default function RequestRide() {
  const [customerId, setCustomerId] = useState<string>("");  // Estado para o customerId
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const router = useRouter();

  // Usar useEffect para pegar o customerId do localStorage ao carregar o componente
  useEffect(() => {
    const storedCustomerId = sessionStorage.getItem("customerId");
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);  // Definir o estado customerId com o valor do localStorage
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestData = {
      customer_id: customerId,
      origin: origin,
      destination: destination,
    };

    const response = await fetch("http://localhost:8080/ride/estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    // Armazenar dados no sessionStorage
    sessionStorage.setItem("rideData", JSON.stringify(data));


    alert("Endreço de origem e destino confirmados.");

    // Redirecionar para a próxima página
    router.push("/ride-options");
  };

  return (
    <div className="request-container">
      <main>
        <h2>Solicite a sua viagem</h2>
        <br />
        <Form
          onSubmit={handleSubmit}
          customerId={customerId}
          origin={origin}
          destination={destination}
          onCustomerIdChange={(e) => setCustomerId(e.target.value)}
          onOriginChange={(e) => setOrigin(e.target.value)}
          onDestinationChange={(e) => setDestination(e.target.value)}
        />
      </main>
    </div>
  );
}
