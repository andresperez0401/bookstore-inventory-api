# Bookstore Inventory API

API REST para inventario de libros con NestJS, Prisma 7, PostgreSQL, JWT y Zod.

## URL del despliegue de la aplicacion

1) https://bookstore-inventory-api-fhbh.onrender.com

## Stack

- NestJS 11
- Prisma 7 + PostgreSQL
- Docker y Docker Compose
- Swagger
- Zod para validacion

## Requisitos

- Node.js 20 o superior
- npm
- Docker Desktop (opcional, recomendado)

## Instalacion

1. Clonar el repositorio y entrar al proyecto.
2. Instalar dependencias.

```powershell
npm install
```

3. Crear variables de entorno a partir de [.env.example](.env.example).

```powershell
Copy-Item .env.example .env
```

Variables minimas:
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- EXCHANGE_RATE_API_URL
- DEFAULT_CURRENCY
- DEFAULT_EXCHANGE_RATE
- PROFIT_MARGIN_PERCENTAGE
- PORT

## Prisma 7: nota importante

En Prisma 7 la conexion se define en [prisma.config.ts](prisma.config.ts), no en datasource.url del schema.

## Base de datos y migraciones

Si usas Docker para Postgres:

```powershell
docker-compose up -d postgres
```

Generar cliente y correr migraciones:

```powershell
npm run db:generate
npm run db:migrate
```

Cargar seed:

```powershell
npm run db:seed
```

## Ejecutar API

```powershell
npm run start:dev
```

Base URL local:
- http://localhost:3000

## Swagger

Documentacion disponible en:
- http://localhost:3000/docs
- http://localhost:3000/api/docs

Configuracion en [src/main.ts](src/main.ts).

## Endpoints

### Publicos

- GET /
- POST /auth/register
- POST /auth/login

### Books CRUD

- POST /books
- GET /books?page=1&limit=10
- GET /books/{id}
- PUT /books/{id}
- DELETE /books/{id}

### Books filtros

- GET /books/search?category=Programming&page=1&limit=10
- GET /books/low-stock?threshold=10&page=1&limit=10
- GET /books/category/{category}?page=1&limit=10

### Pricing

- POST /books/{id}/calculate-price?currency=EUR

## Estructura de respuesta de calculate-price

Respuesta:

```json
{
  "book_id": "uuid",
  "cost_usd": 15.99,
  "exchange_rate": 0.85,
  "cost_local": 13.59,
  "margin_percentage": 40,
  "selling_price_local": 19.03,
  "currency": "EUR",
  "calculation_timestamp": "2025-01-15T10:30:00Z"
}
```

## Flujo de calculo de precio

Implementado en [src/modules/books/services/books.service.ts](src/modules/books/services/books.service.ts).

1. Busca el libro por id.
2. Toma costUsd.
3. Consulta tipo de cambio en Exchange Rate API (USD base).
4. Calcula costo local y luego aplica margen.
5. Guarda sellingPriceLocal en base de datos.
6. Retorna el detalle del calculo.

Si la API externa falla por red o timeout, usa DEFAULT_EXCHANGE_RATE como fallback (implementado en [src/modules/exchange-rate/services/exchange-rate.service.ts](src/modules/exchange-rate/services/exchange-rate.service.ts)).

## Seguridad

La API usa JWT global con guard en [src/modules/auth/guards/jwt-auth.guard.ts](src/modules/auth/guards/jwt-auth.guard.ts).

Para probar endpoints protegidos:
1. Ejecutar login.
2. Copiar access_token.
3. Enviar header Authorization: Bearer <token>.

## Postman

Archivos listos para importar:
- [postman/bookstore-inventory-api.postman_collection.json](postman/bookstore-inventory-api.postman_collection.json)
- [postman/bookstore-local.postman_environment.json](postman/bookstore-local.postman_environment.json)

Flujo recomendado:
1. Importar collection y environment.
2. Ejecutar Login para guardar token automaticamente.
3. Crear libro y copiar su id a la variable bookId.
4. Probar CRUD, filtros y calculate-price.

## Docker

Levantar todo:

```powershell
npm run docker:up
```

Logs de API:

```powershell
npm run docker:logs
```

Detener:

```powershell
npm run docker:down
```

## Scripts utiles

- npm run start:dev
- npm run build
- npm run lint
- npm run test
- npm run db:generate
- npm run db:migrate
- npm run db:seed
- npm run docker:up
- npm run docker:logs
- npm run docker:down

