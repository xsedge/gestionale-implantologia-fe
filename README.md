# Gestionale (Gestionale)

Gestionale

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

#### Test the QuantitaCounter component locally

1. Install the dependencies (see above) and start the dev server with `quasar dev`.
2. When the CLI finishes booting it will print the local URL (usually http://localhost:9000).
3. Open the Orders page at `http://localhost:9000/ordini` to see `QuantitaCounter` embedded in the order list view.
4. Use the dynamically generated `+`/`-` buttons to confirm that the quantity updates follow the values provided by the parent component.
5. Open the "Nuovo ordine" modal from the Orders page menu to repeat the same checks in a different context that mounts `QuantitaCounter` with custom steps.

This manual smoke test allows you to reproduce and validate the behaviour before approving the change.

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
