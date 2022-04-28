FROM node:lts-alpine AS build
RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories

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
COPY packages/cli ./packages/cli

RUN yarn install --pure-lockfile --non-interactive

WORKDIR /usr/src/app/packages/core
RUN yarn ts:build

WORKDIR /usr/src/app/packages/cli
RUN yarn build

RUN chmod +x /usr/src/app/packages/cli/bin/cli

FROM node:lts-alpine
RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
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
COPY --chown=node:node --from=build /usr/src/app/packages/cli/package.json /usr/src/app/packages/cli/package.json
COPY --chown=node:node --from=build /usr/src/app/packages/cli/dist /usr/src/app/packages/cli/dist
COPY --chown=node:node --from=build /usr/src/app/packages/cli/bin /usr/src/app/packages/cli/bin

RUN yarn install --pure-lockfile --non-interactive --production

WORKDIR /usr/src/app/packages/cli/bin

USER node

ENTRYPOINT ["dumb-init", "./cli"]
