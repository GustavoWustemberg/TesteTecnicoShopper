"use client";
import { useEffect, useCallback, useState } from 'react';

interface Driver {
    id: number;
    name: string;
}

interface Ride {
    id: number;
    date: string;
    origin: string;
    destination: string;
    distance: number;
    duration: string;
    driver: Driver;
    value: number;
}

interface ApiResponse {
    customer_id: string;
    rides: Ride[];
}

const useFetchRidesHistory = (customerId: string, selectedDriver: string, setRides: React.Dispatch<React.SetStateAction<Ride[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setDrivers: React.Dispatch<React.SetStateAction<string[]>>) => {
    const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            const address = data.address;
            const street = address.road || '';
            const houseNumber = address.house_number || '';
            const city = address.city || address.town || address.village || '';
            const state = address.state || '';
            const postcode = address.postcode || '';
            const country = address.country || '';

            const simplifiedAddress = `${street}, ${houseNumber}, ${city}, ${state}, ${country} - ${postcode}`;
            return simplifiedAddress || 'Endereço não encontrado';
        } catch (error) {
            console.error('Erro ao obter o endereço:', error);
            return 'Endereço não disponível';
        }
    };

    const fetchRidesHistory = useCallback(async () => {
        if (!customerId) {
            alert('Informe o ID do usuário.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/ride/${customerId}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar o histórico de viagens');
            }

            const data: ApiResponse = await response.json();
            const ridesData = data.rides;

            const uniqueDrivers = Array.from(new Set(ridesData.map((ride) => ride.driver.name)));
            setDrivers(['all', ...uniqueDrivers]);

            const filteredRides =
                selectedDriver === 'all'
                    ? ridesData
                    : ridesData.filter((ride) => ride.driver.name === selectedDriver);

            const updatedRides = await Promise.all(
                filteredRides.map(async (ride) => {
                    const [originLat, originLon] = ride.origin.split(',').map(Number);
                    const [destinationLat, destinationLon] = ride.destination.split(',').map(Number);

                    const originAddress = await getAddressFromCoordinates(originLat, originLon);
                    const destinationAddress = await getAddressFromCoordinates(destinationLat, destinationLon);

                    return {
                        ...ride,
                        origin: originAddress,
                        destination: destinationAddress,
                    };
                })
            );

            setRides(updatedRides);
        } catch (error) {
            console.error('Erro ao buscar o histórico de viagens:', error);
            alert('Erro ao carregar o histórico de viagens.');
        } finally {
            setLoading(false);
        }
    }, [customerId, selectedDriver, setRides, setLoading, setDrivers]);

    return fetchRidesHistory;
};

export default function RidesHistory(): JSX.Element {
    const [customerId, setCustomerId] = useState<string>('');
    const [selectedDriver, setSelectedDriver] = useState<string>('all');
    const [rides, setRides] = useState<Ride[]>([]);
    const [drivers, setDrivers] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchRidesHistory = useFetchRidesHistory(customerId, selectedDriver, setRides, setLoading, setDrivers);

    useEffect(() => {
        const storedCustomerId = sessionStorage.getItem('customerId');
        if (storedCustomerId) {
            setCustomerId(storedCustomerId);
        }
    }, []);

    useEffect(() => {
        if (customerId) {
            fetchRidesHistory();
        }
    }, [customerId, fetchRidesHistory]);

    const handleCustomerIdChange = (value: string) => {
        setCustomerId(value);
        localStorage.setItem('customerId', value);
    };

    return (
        <div className="history-container">
            <h2>Histórico de Viagens</h2>
            <br />
            <p>Veja abaixo o histórico de corridas realizadas.</p>
            <br />
            <div className="history-filters">
                <div className="history-filterField">
                    <label>ID do Usuário:</label>
                    <input
                        type="text"
                        value={customerId}
                        onChange={(e) => handleCustomerIdChange(e.target.value)}
                        placeholder="Informe o ID do usuário"
                    />
                </div>

                <div className="history-filterField">
                    <label>Motorista:</label>
                    <select
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                        {drivers.map((driver, index) => (
                            <option key={index} value={driver}>
                                {driver === 'all' ? 'Mostrar Todos' : driver}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="history-containerTable">
                <h2>Histórico de viagens</h2>
                {loading ? (
                    <div>Carregando...</div>
                ) : (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Origem</th>
                                <th>Destino</th>
                                <th>Distância</th>
                                <th>Duração</th>
                                <th>Motorista</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rides.map((ride) => (
                                <tr key={ride.id}>
                                    <td>{ride.date}</td>
                                    <td>{ride.origin}</td>
                                    <td>{ride.destination}</td>
                                    <td>{ride.distance} km</td>
                                    <td>{ride.duration}</td>
                                    <td>{ride.driver.name}</td>
                                    <td>{ride.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
