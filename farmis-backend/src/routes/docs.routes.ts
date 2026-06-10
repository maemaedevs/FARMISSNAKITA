import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import { openapiSpec } from '../docs/openapi';

export const docsRouter = Router();

// Raw OpenAPI document.
docsRouter.get('/docs.json', (_req, res) => {
  res.json(openapiSpec);
});

// Interactive Swagger UI.
docsRouter.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec as Record<string, unknown>, {
    customSiteTitle: 'Farmis API Docs',
    swaggerOptions: { persistAuthorization: true },
  }),
);
