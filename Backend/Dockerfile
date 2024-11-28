# Etapa 1: Usar a imagem oficial do Node.js como base
FROM node:18

# Etapa 2: Definir o diretório de trabalho dentro do container
WORKDIR /app

# Etapa 3: Copiar os arquivos de configuração do projeto (package.json, package-lock.json)
COPY package*.json ./

# Etapa 4: Instalar as dependências
RUN npm install

# Etapa 5: Copiar todos os arquivos do projeto para o container
COPY . .

# Etapa 6: Instalar as dependências do TypeScript globalmente
RUN npm install -g typescript

# Etapa 7: Rodar o comando Prisma para gerar os arquivos necessários (caso use migration ou introspecção)
RUN npx prisma generate

# Etapa 8: Expor a porta que o backend irá rodar (por exemplo, 3000)
EXPOSE 8080

# Etapa 9: Comando para rodar o servidor de desenvolvimento (usando ts-node-dev ou outro comando conforme seu script)
CMD ["npm", "run", "dev"]
