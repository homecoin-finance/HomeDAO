FROM node:16

RUN apt-get -y update

USER node

RUN mkdir /home/node/.npm-global
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

USER root

RUN mkdir /src
WORKDIR /src

RUN yarn global add truffle@5.5.11
RUN yarn install
