FROM node:22-alpine AS alpine

#main backend build
FROM alpine AS build_backend
WORKDIR /app
COPY . /app
RUN npx yarn
RUN npx yarn build

FROM alpine AS production
WORKDIR /app

#copies only required files/folders
COPY --from=build_backend    /app/dist                               /app/dist
COPY --from=build_backend    /app/node_modules                       /app/node_modules

USER node
CMD ["node", "dist/index.js"]
