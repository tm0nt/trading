# Estágio de construção
FROM node:18-alpine AS builder

# Instala dependências do sistema para Prisma (exemplo para PostgreSQL)
# RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma

# Habilitar corepack e instalar dependências
RUN corepack enable && \
    pnpm install

# Copiar o restante do código-fonte
COPY . .

# Gerar cliente do Prisma
RUN pnpm prisma generate

# Construir aplicação Next.js
RUN pnpm build

# Remover dependências de desenvolvimento
RUN pnpm prune --prod

# Estágio de produção
FROM node:18-alpine AS production

# Instalar dependências do sistema (mesmo que no estágio de construção)
# RUN apk add --no-cache openssl

WORKDIR /app

# Habilitar corepack para pnpm
RUN corepack enable

# Copiar artefatos de construção
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.mjs ./  

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Expor a porta
EXPOSE 3000

# Comando de inicialização
CMD ["pnpm", "start"]