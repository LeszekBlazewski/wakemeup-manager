FROM base as build

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM base as production
ENV NODE_ENV=production

COPY package*.json ./
COPY nuxt.config.js ./
RUN npm install

COPY --from=build ./app/packages/front/.nuxt ./.nuxt/
COPY --from=build ./app/packages/front/static ./static/

CMD ["npm", "run", "start"]
