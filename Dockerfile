FROM ubuntu:18.04

EXPOSE 8080
VOLUME /root/app

RUN apt-get update \
    && apt-get install -y npm \
    && apt-get clean \
    && npm install -g yarn

WORKDIR /root/app

ENTRYPOINT yarn install && yarn watch
