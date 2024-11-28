import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function listRidesRoute(fastify: FastifyInstance) {
  fastify.get('/ride/:customer_id', async (request, reply) => {
    const paramsSchema = z.object({
      customer_id: z.string(),
    });

    const querySchema = z.object({
      driver_id: z.string().optional(),
    });

    try {
      // Validar parâmetros e query
      const { customer_id } = paramsSchema.parse(request.params);
      const { driver_id } = querySchema.parse(request.query);

      // Validar se o motorista é válido, se informado
      if (driver_id) {
        const validDriver = await prisma.driver.findUnique({
          where: { id: parseInt(driver_id, 10) },
        });

        if (!validDriver) {
          return reply.status(400).send({
            error_code: 'INVALID_DRIVER',
            error_description: `Driver with ID ${driver_id} is invalid or not found`,
          });
        }
      }

      // Buscar viagens realizadas pelo usuário
      const rides = await prisma.ride.findMany({
        where: {
          customerId: customer_id,
          ...(driver_id && { driverId: parseInt(driver_id, 10) }), // Filtrar por motorista se informado
        },
        orderBy: { createdAt: 'desc' }, // Ordenar da mais recente para a mais antiga
        include: {
          driver: true, // Incluir dados do motorista
        },
      });

      if (rides.length === 0) {
        return reply.status(404).send({
          error_code: 'NO_RIDES_FOUND',
          error_description: 'No rides found for the given criteria',
        });
      }

      // Formatar resposta
      const response = {
        customer_id,
        rides: rides.map((ride) => ({
          id: ride.id,
          date: ride.createdAt, // Usar createdAt como data da viagem
          origin: ride.origin,
          destination: ride.destination,
          distance: ride.distance,
          duration: ride.duration,
          driver: {
            id: ride.driver.id,
            name: ride.driver.name,
          },
          value: ride.value,
        })),
      };

      return reply.status(200).send(response);
    } catch (error) {
      // Capturar erros de validação do Zod
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error_code: 'INVALID_DATA',
          error_description: error.errors.map((e) => e.message).join(', '),
        });
      }

      // Capturar outros erros e retornar uma resposta genérica
      console.error(error);
      return reply.status(500).send({
        error_code: 'INTERNAL_SERVER_ERROR',
        error_description: 'An unexpected error occurred',
      });
    }
  });
}
