# FSSPX Hub

Information hub for [FSSPX](https://fsspx.org/) chapels in Poland. 

## Development

1. Setup proper Node version with [nvm](https://github.com/nvm-sh/nvm):

    ```bash
    nvm use
    ```

1. Create `.env` file with required env vars. Use `.env.example` as a base. Don't forget to adjust/change the default values of secrets!
1. Make sure you have a running MongoDB instance, matching `DATABASE_URI` from `.env`.

    > CAVEAT! If you want some ready-to-use data already, reach out to the maintainers of this repo for an access to the test database instance.
    
    If you want to start plain, you can achieve that with Docker by running this command:

    ```
    docker run --name fsspx-hub-db -v fsspx-hub-db:/data/db -d -p 27017:27017 mongo
    ```

1. Run the development server:

    ```bash
    pnpm dev
    ```

1. Open [http://localhost:3000/admin](http://localhost:3000/admi) with your browser to reach the Payload Admin panel.
