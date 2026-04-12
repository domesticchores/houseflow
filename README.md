# BNB Imager

Imager for the Bits 'n Bytes Project from Computer Science House.

## Getting Started

Build the container

``` sh
docker build -t bnb-imager .
```

Run the container

``` sh
docker run -p 8080:8080 bnb-imager
```

## Environment
make an `.env` file with the following:
```
VITE_SSO_CLIENT_ID=
VITE_SSO_AUTHORITY=
VITE_SSO_ENABLED=
VITE_API_PREFIX=
VITE_BACKEND_URL=
VITE_BACKEND_AUTH=
```

## Local Development
Use the following commands to run locally. You may need to run the backend server as well.
```
npm i
npm run dev
```