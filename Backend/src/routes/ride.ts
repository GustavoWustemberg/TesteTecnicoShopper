import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import axios from 'axios';
import { prisma } from '../lib/prisma';

export async function estimateRoute(fastify: FastifyInstance) {
  fastify.post('/ride/estimate', async (request, reply) => {
    const createRideSchema = z.object({
      customer_id: z.string(),
      origin: z.string(),
      destination: z.string(),
    });

    // Validar e extrair os dados do corpo da requisição
    const { customer_id, origin, destination } = createRideSchema.parse(request.body);

    // Validações extras
    if (origin === destination) {
      return reply.status(400).send({
        error_code: 'INVALID_DATA',
        error_description: 'Origin and destination cannot be the same address',
      });
    }

    try {
      // Função para obter coordenadas usando o Geocoding API
      const getCoordinates = async (address: string) => {
        const apiKey = process.env.GOOGLE_API_KEY;
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
          params: {
            address: address,
            key: apiKey,
          },
        });
        if (response.data.status === 'OK') {
          const location = response.data.results[0].geometry.location;
          return { latitude: location.lat, longitude: location.lng };
        } else {
          throw new Error(`Unable to get coordinates for address: ${address}`);
        }
      };

      // Obter coordenadas para a origem e o destino
      const originCoords = await getCoordinates(origin);
      const destinationCoords = await getCoordinates(destination);

      // Chamar a API do Google Maps Routes para calcular a rota
      const apiKey = process.env.GOOGLE_API_KEY; // Adicione sua chave de API no arquivo `.env`
      const response = await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: {
            location: {
              latLng: { latitude: originCoords.latitude, longitude: originCoords.longitude }
            }
          },
          destination: {
            location: {
              latLng: { latitude: destinationCoords.latitude, longitude: destinationCoords.longitude }
            }
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          computeAlternativeRoutes: false,
          routeModifiers: {
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false
          },
          languageCode: 'pt-BR',
          units: 'METRIC'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
          },
        }
      );

      // Log da resposta para debugging
      console.log('Google Maps API Response:', response.data);

      // Verificar se há rotas na resposta
      const routeData = response.data.routes && response.data.routes.length > 0
        ? response.data.routes[0]
        : null;

      if (!routeData) {
        return reply.status(400).send({
          error_code: 'ROUTE_NOT_FOUND',
          error_description: 'No route found for the given origin and destination.',
        });
      }

      // Verificar a duração e distância da rota diretamente do objeto routeData
      const distanceMeters = routeData.distanceMeters || 0; // Distância em metros
      const distanceKm = distanceMeters / 1000; // Convertendo para quilômetros
      const duration = routeData.duration || ''; // Duração da rota

      // Filtrar motoristas disponíveis com base na distância mínima
      const availableDrivers = await prisma.driver.findMany({
        where: {
          minKm: {
            lte: distanceKm, // Motoristas que aceitam distâncias menores ou iguais à da rota
          },
        },
      });

      // Calcular o valor da corrida para cada motorista e ordenar pelo menor custo
      const options = availableDrivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        description: driver.description,
        vehicle: driver.vehicle,
        review: {
          rating: driver.rating,
          comment: driver.comment,
        },
        value: driver.ratePerKm * distanceKm,
      })).sort((a, b) => a.value - b.value); // Ordenar pelo menor valor

      // Responder ao cliente
      return reply.status(200).send({
        origin: {
          latitude: originCoords.latitude,
          longitude: originCoords.longitude,
        },
        destination: {
          latitude: destinationCoords.latitude,
          longitude: destinationCoords.longitude,
        },
        distance: distanceKm, // Distância agora em quilômetros
        duration,
        options,
        routeResponse: response.data, // Resposta original da API do Google
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({
        error_code: 'ROUTE_CALCULATION_ERROR',
        error_description: 'An error occurred while calculating the route. Please try again.',
      });
    }
  });
}
