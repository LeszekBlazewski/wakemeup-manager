FROM node:16-alpine as base
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY ./lerna.json ./
# Package api
FROM base as api-build
WORKDIR /app/packages/api
COPY  packages/api/package*.json ./
WORKDIR /app/
RUN npx lerna bootstrap --scope=api --includeDependencies
WORKDIR /app/packages/api
COPY  packages/api .
RUN npm run build
FROM base as api-production
WORKDIR /app/packages/api
ENV NODE_ENV=production
COPY  packages/api/package*.json ./
WORKDIR /app/
RUN npx lerna bootstrap --scope=api --includeDependencies
WORKDIR /app/packages/api
COPY --from=api-build  /app/packages/api/dist ./dist
# Package wol-agent
FROM base as wol-agent-build
WORKDIR /app/packages/wol-agent
COPY  packages/wol-agent/package*.json ./
WORKDIR /app/
RUN npx lerna bootstrap --scope=wol-agent --includeDependencies
WORKDIR /app/packages/wol-agent
COPY  packages/wol-agent .
RUN npm run build
FROM base as wol-agent-production
WORKDIR /app/packages/wol-agent
ENV NODE_ENV=production
COPY  packages/wol-agent/package*.json ./
WORKDIR /app/
RUN npx lerna bootstrap --scope=wol-agent --includeDependencies
WORKDIR /app/packages/wol-agent
COPY --from=wol-agent-build  /app/packages/wol-agent/dist ./dist
# Package front
FROM base as front-build
WORKDIR /app/packages/front
COPY  packages/front/package*.json ./
WORKDIR /app/
COPY --from=api-production /app/packages/api/package.json /app/packages/api/
RUN npx lerna bootstrap --scope=front --includeDependencies
COPY --from=api-production /app/packages/api/ /app/packages/api/
WORKDIR /app/packages/front
COPY  packages/front .
RUN npm run build
FROM base as front-production
WORKDIR /app/packages/front
ENV NODE_ENV=production
COPY  packages/front/package*.json ./
COPY  packages/front/nuxt.config.js ./
WORKDIR /app/
COPY --from=api-production /app/packages/api/package.json /app/packages/api/
RUN npx lerna bootstrap --scope=front --includeDependencies
COPY --from=api-production /app/packages/api/ /app/packages/api/
WORKDIR /app/packages/front
COPY --from=front-build  ./app/packages/front/.nuxt ./.nuxt/
COPY --from=front-build  ./app/packages/front/static ./static/
CMD ["npm", "run", "start"]
# final stage
FROM base
COPY --from=api-production /app/packages/api /app/packages/api
COPY --from=wol-agent-production /app/packages/wol-agent /app/packages/wol-agent
COPY --from=front-production /app/packages/front /app/packages/front