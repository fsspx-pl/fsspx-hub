# FSSPX Hub

Information hub for [FSSPX](https://fsspx.org/) chapels in Poland. 

# Development

1. Setup proper Node version with [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use
```

2. Create `.env` file with required env vars. Use `.env.example` as a base. Don't forget to adjust/change the default values of secrets!
2. Make sure you have a running MongoDB instance, matching `DATABASE_URI` from `.env`. With Docker, you can achieve that quickly with:

```
docker run --name fsspx-hub-db -v fsspx-hub-db:/data/db -d -p 27017:27017 mongo
```

2. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admi) with your browser to reach the Payload Admin panel.