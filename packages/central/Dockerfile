FROM node:lts-alpine AS node-java

## Install java
RUN { \
		echo '#!/bin/sh'; \
		echo 'set -e'; \
		echo; \
		echo 'dirname "$(dirname "$(readlink -f "$(which javac || which java)")")"'; \
	} > /usr/local/bin/docker-java-home \
	&& chmod +x /usr/local/bin/docker-java-home
ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV PATH $PATH:/usr/lib/jvm/java-1.8-openjdk/jre/bin:/usr/lib/jvm/java-1.8-openjdk/bin

RUN set -x \
	&& apk add --no-cache openjdk8 \
	&& [ "$JAVA_HOME" = "$(docker-java-home)" ]
##

FROM node-java AS build

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .
COPY packages/core/package.json ./packages/core/package.json
COPY packages/central/package.json ./packages/central/package.json

RUN yarn install --pure-lockfile --non-interactive

COPY tsconfig.node.json .
COPY packages/core ./packages/core

WORKDIR /usr/src/app/packages/core

RUN yarn ts:build

COPY packages/central /usr/src/app/packages/central

WORKDIR /usr/src/app/packages/central

RUN yarn build

# --------------> The production image
FROM node-java

RUN apk add --no-cache dumb-init

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

COPY --chown=node:node --from=build /usr/src/app/packages/central/package.json /usr/src/app/packages/central/package.json
COPY --chown=node:node --from=build /usr/src/app/packages/core/package.json /usr/src/app/packages/core/package.json

RUN yarn install --pure-lockfile --non-interactive --production && yarn cache clean

COPY --chown=node:node --from=build /usr/src/app/packages/core/dist /usr/src/app/packages/core/dist
COPY --chown=node:node --from=build /usr/src/app/packages/central/dist /usr/src/app/packages/central/dist

WORKDIR /usr/src/app/packages/central

USER node

CMD ["dumb-init", "node", "dist/main.js"]
