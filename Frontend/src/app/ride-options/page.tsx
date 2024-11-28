'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Carregar o mapa dinamicamente, sem renderizar no lado do servidor
const MapWithEffect = dynamic(() => import("../../Components/MapWithEffect"), { ssr: false });

type Driver = {
    id: number;
    name: string;
    description: string;
    vehicle: string;
    review: { rating: number };
    value: number;
};

export default function Page() {
    const [origin, setOrigin] = useState<[number, number] | null>(null);
    const [destination, setDestination] = useState<[number, number] | null>(null);
    const [polyline, setPolyline] = useState<string>(''); // Alterado para string
    const [drivers, setDrivers] = useState<Driver[]>([]); // Para armazenar os motoristas
    const [customerId, setCustomerId] = useState<string>(''); // Para armazenar o customer_id
    const [distance, setDistance] = useState<number>(0); // Para armazenar a distância
    const [duration, setDuration] = useState<string>(''); // Para armazenar a duração
    const router = useRouter();  // Hook de navegação para redirecionamento

    useEffect(() => {
        // Recuperar os dados do sessionStorage
        const data = sessionStorage.getItem('rideData');
        const storedCustomerId = sessionStorage.getItem('customerId'); // Recupera o customerId

        console.log('Dados recuperados:', data);

        if (data) {
            try {
                // Parse os dados e atualize os estados
                const parsedData = JSON.parse(data);

                // Atualizar as coordenadas de origem e destino
                setOrigin([parsedData.origin.latitude, parsedData.origin.longitude]);
                setDestination([parsedData.destination.latitude, parsedData.destination.longitude]);

                // Definir a rota, se necessário
                setPolyline(parsedData.routeResponse.routes[0].polyline.encodedPolyline);

                // Armazenar as opções de motoristas
                setDrivers(parsedData.options);

                // Recuperar a distância e duração da rota da API diretamente dos dados
                setDistance(parsedData.distance); // A distância já está disponível no sessionStorage
                setDuration(parsedData.duration); // A duração também já está disponível

                // Definir o customerId
                if (storedCustomerId) {
                    setCustomerId(storedCustomerId);
                } else {
                    console.warn('customerId não encontrado no sessionStorage');
                }

            } catch (error) {
                console.error("Erro ao processar os dados:", error);
            }
        } else {
            console.warn("Dados não encontrados no sessionStorage");
        }
    }, []);  // Executar o efeito apenas uma vez, após o carregamento do componente

    // Função para confirmar a viagem
    const handleChooseDriver = async (driverId: number, driverName: string, driverValue: number) => {
        console.log(driverId, driverName, driverValue, distance, duration, customerId);
        if (!customerId || !origin || !destination || distance <= 0 || !duration) {
            alert("Dados incompletos para confirmar a viagem.");
            return;
        }

        const payload = {
            customer_id: customerId,
            origin: `${origin[0]},${origin[1]}`,
            destination: `${destination[0]},${destination[1]}`,
            distance: distance,
            duration: duration,
            driver: {
                id: driverId,
                name: driverName
            },
            value: driverValue
        };

        console.log('Payload:', payload);

        try {
            const response = await fetch('http://localhost:8080/ride/confirm', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Erro ao confirmar a viagem');
            }

            // Redirecionar para a página de histórico após confirmação
            alert('Viagem confirmada com sucesso!');
            router.push('/rides-history'); // Redireciona automaticamente para a tela de histórico
        } catch (error) {
            console.log('Erro ao escolher motorista:', error);
            alert('Erro ao confirmar a viagem.');
        }
    };

    // Verifique se todos os dados necessários estão disponíveis antes de renderizar o mapa
    return (
        <main className="options-container">
            <h2>Escolha um motorista</h2>
            <div className='container-ride-options'>
                {/* Exibir a lista de motoristas */}
                <div>
                    {drivers.length > 0 ? (
                        <div className='options-drivers'>
                            {drivers.map((driver) => (
                                <div key={driver.id} className='options-driver'>
                                    <h3>{driver.name}</h3>
                                    <p>{driver.description}</p>
                                    <p><strong>Veículo:</strong> {driver.vehicle}</p>
                                    <p><strong>Avaliação:</strong> {driver.review.rating} estrelas</p>
                                    <p><strong>Valor da Viagem:</strong> R$ {driver.value.toFixed(2)}</p>
                                    <button onClick={() => handleChooseDriver(driver.id, driver.name, driver.value)}>Escolher</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>Carregando motoristas...</div>
                    )}
                </div>

                {origin && destination && polyline.length > 0 ? (
                    <MapWithEffect origin={origin} destination={destination} polyline={polyline} />
                ) : (
                    <div>Carregando dados...</div>
                )}
            </div>
        </main>
    );
}
