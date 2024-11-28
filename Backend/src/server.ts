import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { estimateRoute } from "./routes/ride";
import { prisma } from "./lib/prisma";
import dotenv from 'dotenv';
import { confirmRoute } from "./routes/confirm";
import { listRidesRoute } from "./routes/consult";
import { userRoute } from "./routes/user";
import { log } from "console";
import { loginRoute } from "./routes/login";

dotenv.config({ path: '../.env' });


async function bootstrap() {
    const fastify = Fastify({
        logger: true,
    })

    await fastify.register(cors, {
        origin: true,
    })

    await fastify.register(estimateRoute);
    await fastify.register(confirmRoute);
    await fastify.register(listRidesRoute);
    await fastify.register(userRoute);
    await fastify.register(loginRoute);

    await fastify.listen({ port: 8080, host: '0.0.0.0' });
}

bootstrap();