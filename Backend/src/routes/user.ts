import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function userRoute(fastify: FastifyInstance) {
    fastify.post('/user', async (request, reply) => {
        try {
            // Define o esquema para validação
            const createUserSchema = z.object({
                userName: z.string()
            });

            // Valida o corpo da requisição
            const { userName } = createUserSchema.parse(request.body);

            // Verifica se o userName já existe no banco de dados
            const existingUser = await prisma.user.findUnique({
                where: { userName },
            });

            if (existingUser) {
                return reply.status(409).send({
                    success: false,
                    error: `O userName '${userName}' já está em uso.`,
                });
            }

            // Cria o usuário no banco de dados
            const user = await prisma.user.create({
                data: {
                    userName,
                },
            });

            // Retorna resposta de sucesso
            return reply.status(200).send({ success: true, user });
        } catch (error) {
            // Retorna erro de validação, se houver
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: error.errors.map(err => err.message).join(", "),
                });
            }

            // Retorna erro genérico
            return reply.status(500).send({ success: false, error: "Erro interno no servidor." });
        }
    });
}
