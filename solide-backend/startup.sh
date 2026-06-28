#!/bin/sh
export DATABASE_URL="${DATABASE_URL:-file:/app/data/dev.db}"
if [ -z "$JWT_SECRET" ]; then
  export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
fi
mkdir -p /app/data/uploads
cp -r ./uploads/* /app/data/uploads/ 2>/dev/null || true
npx prisma db push
exec node dist/index.js