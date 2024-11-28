import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function confirmRoute(fastify: FastifyInstance) {
  fastify.patch('/ride/confirm', async (request, reply) => {
    const confirmRideSchema = z.object({
      customer_id: z.string(),
      origin: z.string(),
      destination: z.string(),
      distance: z.number().positive('Distance must be a positive number'),
      duration: z.string(),
      driver: z.object({
        id: z.number().int().positive('Driver ID must be a valid positive integer'),
        name: z.string(),
      }),
      value: z.number().positive('Value must be a positive number'),
    });

    try {
      // Validar o corpo da requisição
      const {
        customer_id,
        origin,
        destination,
        distance,
        duration,
        driver,
        value,
      } = confirmRideSchema.parse(request.body);

      console.log('Requisição recebida:', request.body);

      // Verificar se origem e destino são diferentes
      if (origin === destination) {
        return reply.status(400).send({
          error_code: 'INVALID_DATA',
          error_description: 'Origin and destination cannot be the same address',
        });
      }

      // Verificar se o cliente existe no banco de dados
      const validCustomer = await prisma.user.findUnique({
        where: { customerId: customer_id },
      });

      if (!validCustomer) {
        return reply.status(404).send({
          error_code: 'CUSTOMER_NOT_FOUND',
          error_description: `Customer with ID ${customer_id} not found`,
        });
      }

      // Verificar se o motorista existe no banco de dados
      const validDriver = await prisma.driver.findUnique({
        where: { id: driver.id },
      });

      if (!validDriver) {
        return reply.status(404).send({
          error_code: 'DRIVER_NOT_FOUND',
          error_description: `Driver with ID ${driver.id} not found`,
        });
      }

      // Validar a quilometragem para o motorista
      if (distance < validDriver.minKm) {
        return reply.status(406).send({
          error_code: 'INVALID_DISTANCE',
          error_description: `Distance ${distance}km is not valid for driver ${driver.name}`,
        });
      }

      // Salvar a viagem no banco de dados
      await prisma.ride.create({
        data: {
          customerId: customer_id,
          origin,
          destination,
          distance,
          duration,
          driverId: driver.id,
          value,
        },
      });

      // Responder com sucesso
      return reply.status(200).send({
        success: true
      });
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
