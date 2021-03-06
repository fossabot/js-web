# Base on offical Node.js Alpine image
FROM node:lts-alpine

# Set working directory
WORKDIR /usr/app

RUN apk add --no-cache git
# Install PM2 globally
# RUN yarn global add pm2

COPY package.json .
COPY yarn.lock .
COPY packages/web/package.json ./packages/web/package.json

# Install dependencies and remove cahce after installation done
RUN yarn install --pure-lockfile --non-interactive --prefer-offline && yarn cache clean

ARG AUTH_API_BASE_URL
ENV AUTH_API_BASE_URL=$AUTH_API_BASE_URL
ENV NEXT_PUBLIC_AUTH_API_BASE_URL=$AUTH_API_BASE_URL

ARG CENTRAL_API_BASE_URL
ENV CENTRAL_API_BASE_URL=$CENTRAL_API_BASE_URL
ENV NEXT_PUBLIC_CENTRAL_API_BASE_URL=$CENTRAL_API_BASE_URL

ARG PAYMENT_API_BASE_URL
ENV PAYMENT_API_BASE_URL=$PAYMENT_API_BASE_URL
ENV NEXT_PUBLIC_PAYMENT_API_BASE_URL=$PAYMENT_API_BASE_URL

ARG NOTIFICATION_API_BASE_URL
ENV NOTIFICATION_API_BASE_URL=$NOTIFICATION_API_BASE_URL
ENV NEXT_PUBLIC_NOTIFICATION_API_BASE_URL=$NOTIFICATION_API_BASE_URL

ARG CORPORATE_WEB_BASE_URL
ENV NEXT_PUBLIC_CORPORATE_WEB_BASE_URL=$CORPORATE_WEB_BASE_URL

ARG CDN_BASE_URL
ENV NEXT_PUBLIC_CDN_BASE_URL=$CDN_BASE_URL

ARG NEXT_PUBLIC_HIDE_V2_FEATURE
ENV NEXT_PUBLIC_HIDE_V2_FEATURE=$NEXT_PUBLIC_HIDE_V2_FEATURE

ARG SENTRY_ENVIRONMENT_NAME
ENV SENTRY_ENVIRONMENT_NAME=$SENTRY_ENVIRONMENT_NAME
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT_NAME=$SENTRY_ENVIRONMENT_NAME

ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE
ENV NEXT_PUBLIC_SENTRY_RELEASE=$SENTRY_RELEASE

ARG SENTRY_ORG
ENV SENTRY_ORG=$SENTRY_ORG

ARG SENTRY_PROJECT
ENV SENTRY_PROJECT=$SENTRY_PROJECT

ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

ARG SENTRY_DSN
ENV SENTRY_DSN=$SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN

ARG RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$RECAPTCHA_SITE_KEY

ARG NOTIFICATION_URL
ENV NEXT_PUBLIC_NOTIFICATION_URL=$NOTIFICATION_URL

ARG NEXT_PUBLIC_NOTIFICATION_API_BASE_URL
ENV NEXT_PUBLIC_NOTIFICATION_API_BASE_URL=$NOTIFICATION_API_BASE_URL

ARG NEXT_PUBLIC_HIDE_V2_FEATURE
ENV NEXT_PUBLIC_HIDE_V2_FEATURE=$NEXT_PUBLIC_HIDE_V2_FEATURE

ENV NODE_ENV production

COPY packages/web/ ./packages/web/

WORKDIR /usr/app/packages/web

RUN yarn build

# Expose the listening port
EXPOSE 3000

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Run npm start script when container starts
CMD [ "yarn", "start" ]

# Uncomment below if we want to use PM2 for the NextJS app
# CMD [ "pm2-runtime", "npm", "--", "start" ]
