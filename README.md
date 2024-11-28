# Projeto Desafio Shopper

Este é um projeto que utiliza Docker para orquestrar um ambiente de desenvolvimento com as tecnologias Node.js, Next.js e PostgreSQL. Abaixo, você encontrará instruções sobre como configurar e iniciar o projeto localmente.

## Tecnologias Utilizadas

- **Backend**: Node.js (utilizando TypeScript)
- **Frontend**: Next.js (utilizando TypeScript)
- **Banco de Dados**: PostgreSQL (hospedado na [Neon Tech](https://neon.tech))
- **Outras Tecnologias**: Docker, Docker Compose

## Requisitos

1. **Docker** e **Docker Compose** instalados em sua máquina.
   
2. **Conta na Neon Tech** para utilizar o banco de dados PostgreSQL.

## Como Subir o Projeto

### 1. Clonando o Repositório

Clone o repositório do projeto em sua máquina:

```bash
git clone <url_do_repositório>
cd <diretório_do_projeto>
```
### 2. Criando o Arquivo .env
Na raiz do repositório, crie um arquivo chamado .env. Este arquivo será utilizado para armazenar as variáveis de ambiente do projeto. As duas principais variáveis que você deve configurar são:

DATABASE_URL: URL de conexão com o banco de dados PostgreSQL.
GOOGLE_API_KEY: Chave da API do Google, com api do maps ativa.
O conteúdo do arquivo .env será:

```bash
DATABASE_URL=postgresql://<usuario>:<senha>@<host>:<porta>/<nome_do_banco>?schema=public
GOOGLE_API_KEY=<sua_chave_api_google>
Detalhes sobre as variáveis:
DATABASE_URL:
```

### 3. Subindo o Projeto com Docker Compose
Agora que o arquivo .env está configurado corretamente, o próximo passo é subir os containers. O Docker Compose será responsável por orquestrar os containers para o frontend, backend e banco de dados.

No diretório raiz do projeto, execute o seguinte comando:

```bash
docker-compose up --build
```

### 4. Acessando a Aplicação
Após o Docker Compose levantar os containers, você pode acessar a aplicação nos seguintes endereços:

Frontend: O frontend estará disponível na URL http://localhost.
Backend: O backend estará disponível na URL http://localhost:8080.

## Como Funciona o Projeto
Backend (Node.js): O backend é um serviço API RESTful que se comunica com o banco de dados PostgreSQL. Ele está configurado para usar a URL de conexão fornecida no arquivo .env para acessar o banco de dados.
Frontend (Next.js): O frontend é um aplicativo Next.js que interage com a API do backend. Ele foi configurado para consumir os endpoints fornecidos pela API.
Banco de Dados (PostgreSQL): O banco de dados está hospedado na Neon Tech, usando PostgreSQL. Ele armazena todas as informações necessárias para a operação do backend e do frontend.
