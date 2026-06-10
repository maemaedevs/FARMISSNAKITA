import { sign } from 'jsonwebtoken';

import { env } from '../lib/env';

export function issueAdminToken(params: { sub: string }) {
  // jsonwebtoken's `expiresIn` is typed as `ms.StringValue | number`, but our env var is plain `string`.
  // Cast to allow values like "1d", "15m", etc.
  const expiresIn = env.JWT_EXPIRES_IN as unknown as Parameters<typeof sign>[2]['expiresIn'];
  return sign(
    {
      sub: params.sub,
      role: 'admin',
    },
    env.JWT_SECRET,
    { expiresIn },
  );
}

export function issueClientToken(params: { sub: string }) {
  const expiresIn = env.JWT_EXPIRES_IN as unknown as Parameters<typeof sign>[2]['expiresIn'];
  return sign(
    {
      sub: params.sub,
      role: 'client',
    },
    env.JWT_SECRET,
    { expiresIn },
  );
}

