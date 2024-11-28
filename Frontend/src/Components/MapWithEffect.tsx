import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  origin: [number, number];
  destination: [number, number];
  polyline: string;  // Supondo que polyline seja uma string codificada
};

const decodePolyline = (encoded: string): [number, number][] => {
  let index = 0;
  const points: [number, number][] = [];
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dLat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += dLat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dLng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
};

export default function MapWithEffect({ origin, destination, polyline }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Verificar se está no lado do cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    // Evitar inicializar o mapa mais de uma vez
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
    }

    // Inicializar o mapa
    const map = L.map(mapRef.current).setView(origin, 13);
    leafletMapRef.current = map;

    // Adicionar camada de tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Criar círculo branco para a origem
    L.circleMarker(origin, {
      radius: 5,  // Tamanho do círculo
      fillColor: "white",  // Cor de preenchimento
      color: "black",  // Cor da borda
      weight: 2,  // Peso da borda
      opacity: 1,  // Opacidade da borda
      fillOpacity: 1,  // Opacidade do preenchimento
    })
      .addTo(map)
      .bindPopup("Origem")
      .openPopup();

    // Criar marcador para o destino
    L.circleMarker(destination, {
        radius: 5,  // Tamanho do círculo
        fillColor: "white",  // Cor de preenchimento
        color: "black",  // Cor da borda
        weight: 2,  // Peso da borda
        opacity: 1,  // Opacidade da borda
        fillOpacity: 1,  // Opacidade do preenchimento
      }).addTo(map).bindPopup("Destino");

    // Decodificar a polilinha e adicionar no mapa
    const decodedPolyline = decodePolyline(polyline);
    L.polyline(decodedPolyline, { color: "blue" }).addTo(map);

    // Cleanup na desmontagem
    return () => {
      map.remove();
    };
  }, [isClient, origin, destination, polyline]);

  if (!isClient) {
    return <div>Carregando mapa...</div>;
  }

  return <div className="map" ref={mapRef} style={{ height: "40vh", width: "40vh" }} />;
}
