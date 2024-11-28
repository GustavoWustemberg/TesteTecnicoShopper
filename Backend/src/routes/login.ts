import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'sua_chave_secreta_aqui'; // Substitua por uma chave secreta forte

export async function loginRoute(fastify: FastifyInstance) {
    fastify.post('/login', async (request, reply) => {
        try {
            // Define o esquema de validação para o corpo da requisição
            const loginSchema = z.object({
                userName: z.string()
            });

            // Valida os dados enviados na requisição
            const { userName } = loginSchema.parse(request.body);

            // Verifica se o usuário existe no banco de dados
            const user = await prisma.user.findUnique({
                where: { userName },
            });

            if (!user) {
                return reply.status(404).send({
                    success: false,
                    error: "Usuário não encontrado.",
                });
            }

            // Gera um token JWT com o id e userName do usuário
            const token = jwt.sign(
                { customerId: user.customerId },
                SECRET_KEY,
                { expiresIn: '1h' } // Token válido por 1 hora
            );

            // Retorna sucesso e o token
            return reply.status(200).send({
                success: true,
                message: "Login realizado com sucesso.",
                token,
            });
        } catch (error) {
            // Trata erros de validação
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: error.errors.map(err => err.message).join(", "),
                });
            }

            // Trata outros erros
            return reply.status(500).send({
                success: false,
                error: "Erro interno no servidor.",
            });
        }
    });
}
