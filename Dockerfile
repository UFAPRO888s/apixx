FROM node:18.18.2-slim
WORKDIR /app
COPY api/ .
RUN yarn install --frozen-lockfile
EXPOSE 80
CMD ["yarn", "start"]