FROM node:lts-alpine

WORKDIR /usr/app

# Turn on development mode
ENV NODE_ENV=development

# Install dependencies
COPY /package.json ./package-lock.json /usr/app/
RUN npm ci

# Copy app sources
COPY ./.node-dev.json ./nodemon.json ./tsconfig.json /usr/app/
COPY ./src /usr/app/src/

# Copy test/lint config files
COPY ./jest.config.js ./jest.setup.js ./eslintrc.js .prettierrc /usr/app/

# Set docker detection env flag
ENV IS_DOCKER=true

# Set and expose default port
ENV PORT=4000
EXPOSE 4000

# Expose debugger port
EXPOSE 9222

CMD npm run dev
