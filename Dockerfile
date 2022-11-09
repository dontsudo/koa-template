## 🔗 Base stage
FROM node:lts-alpine AS base

WORKDIR /app
RUN apk add --no-cache g++ git curl make python3 libc6-compat


## 🔗 Dependencies stage
FROM base AS dependencies

COPY package.json yarn.lock ./

RUN yarn --production

## 🔗 Release stage
FROM base AS release

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

CMD ["yarn", "start"]
