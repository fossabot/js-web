# ---- Base ----
FROM node:lts-alpine AS base

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
	&& apk add openjdk8 \
	&& [ "$JAVA_HOME" = "$(docker-java-home)" ]
##

# ---- Dependencies ----
FROM base AS dependencies

WORKDIR /usr/src/app

COPY tsconfig.node.json .
COPY package.json .
COPY yarn.lock .
COPY packages/core/package.json ./packages/core/package.json

RUN yarn install --pure-lockfile --non-interactive --production

COPY packages/core ./packages/core

RUN mv node_modules prod_node_modules && mv packages/core/node_modules prod_core_node_modules

RUN yarn install && yarn cache clean

RUN NODE_ENV=production yarn build:core && cp -R packages/core/dist/ prod_dist/

# ---- Release ----
FROM base AS release
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

COPY --from=dependencies /usr/src/app/packages/core/package.json /usr/src/app/packages/core/package.json
COPY --from=dependencies /usr/src/app/prod_node_modules /usr/src/app/node_modules
COPY --from=dependencies /usr/src/app/prod_core_node_modules /usr/src/app/packages/core/node_modules
COPY --from=dependencies /usr/src/app/prod_dist /usr/src/app/packages/core/dist

WORKDIR /usr/src/app/packages/core
ENV NODE_ENV production

CMD yarn db:migration:run:docker
