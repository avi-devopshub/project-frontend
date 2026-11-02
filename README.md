# Medical ERP Frontend (Dummy)

A minimal React + Vite application for validating the Jenkins -> Amazon S3 -> CloudFront deployment pipeline.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build is generated in `dist/`.

## Environment label

Set `VITE_ENV` when building, for example:

```bash
VITE_ENV=DEV npm run build
```
