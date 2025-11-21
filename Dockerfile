# syntax=docker/dockerfile:1.4

# Install all deps for building (includes dev deps)
FROM node:20-alpine AS deps_build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build client + server using build deps
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps_build /app/node_modules ./node_modules
RUN npm run build

# Install production-only deps once (no dev deps)
FROM node:20-alpine AS deps_prod
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Slim runtime: copy prod node_modules and built dist
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
COPY --from=deps_prod /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD ["node","-e","http=require('http');port=process.env.PORT||'5000';http.get('http://127.0.0.1:'+port+'/api/health',res=>{process.exit(res.statusCode===200?0:1)}).on('error',()=>process.exit(1))"]
CMD ["node", "dist/index.js"]
