FROM alpine:latest


RUN apk update

RUN mkdir /app
WORKDIR /app
RUN apk add --no-cache nodejs npm python3
COPY . /app

RUN npm config set python /usr/bin/python
RUN npm i -g npm
RUN npm install
RUN npm rebuild bcrypt --build-from-source
RUN apk del builds-deps
EXPOSE 9005

CMD ["npm", "start"]
