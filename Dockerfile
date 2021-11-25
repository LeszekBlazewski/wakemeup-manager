FROM node:16-alpine as base
WORKDIR /app
COPY ./package.json ./
RUN apk add --no-cache --virtual .gyp python3 make g++ \
  && npm install \
  && apk del .gyp
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
ENV HOST=0.0.0.0
COPY  packages/front/package*.json ./
COPY  packages/front/nuxt.config.js ./
WORKDIR /app/
COPY --from=api-production /app/packages/api/package.json /app/packages/api/
RUN npx lerna bootstrap --scope=front --includeDependencies
COPY --from=api-production /app/packages/api/ /app/packages/api/
WORKDIR /app/packages/front
COPY --from=front-build  ./app/packages/front/.nuxt ./.nuxt/
COPY --from=front-build  ./app/packages/front/static ./static/
CMD ["npm", "run", "start", "-p", "80"]
# final stage
FROM base
COPY --from=api-production /app/packages/api /app/packages/api
COPY --from=front-production /app/packages/front /app/packages/front