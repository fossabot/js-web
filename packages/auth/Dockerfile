FROM node:lts-alpine AS build

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

WORKDIR /usr/src/app

COPY tsconfig.node.json .
COPY package.json .
COPY yarn.lock .
COPY packages/core ./packages/core
COPY packages/auth ./packages/auth

RUN yarn install --pure-lockfile --non-interactive

WORKDIR /usr/src/app/packages/core
RUN yarn ts:build

WORKDIR /usr/src/app/packages/auth
RUN yarn build

# --------------> The production image
FROM node:lts-alpine
RUN apk add dumb-init

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

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

COPY --chown=node:node --from=build /usr/src/app/packages/core/package.json /usr/src/app/packages/core/package.json
COPY --chown=node:node --from=build /usr/src/app/packages/core/dist /usr/src/app/packages/core/dist

COPY --chown=node:node --from=build /usr/src/app/packages/auth/package.json /usr/src/app/packages/auth/package.json
COPY --chown=node:node --from=build /usr/src/app/packages/auth/dist /usr/src/app/packages/auth/dist
COPY --chown=node:node --from=build /usr/src/app/packages/auth/views /usr/src/app/packages/auth/views

RUN yarn install --pure-lockfile --non-interactive --production

WORKDIR /usr/src/app/packages/auth

USER node

CMD ["dumb-init", "node", "dist/main.js"]
