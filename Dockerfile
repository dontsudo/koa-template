FROM node:lts-alpine AS base

WORKDIR /app
RUN apk add --no-cache g++ git curl make python3 libc6-compat

FROM base AS dependencies

COPY package.json yarn.lock ./
