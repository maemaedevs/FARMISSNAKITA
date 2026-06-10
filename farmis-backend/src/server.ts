import { env } from './lib/env';
import { app } from './app';

app.listen(env.PORT, () => {
  console.log(`[farmis-backend] Listening on http://localhost:${env.PORT}`);
});

