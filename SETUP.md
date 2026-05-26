## Flow Deployment (Next.js + PM2 + Domainesia)

### 1. Build di lokal
```bash
pnpm build
```

### 2. Upload ke server
Yang perlu di-upload ke server:
- `.next/` (hasil build)
- `public/` (gambar, font, dll)
- `prisma/` (schema + migrations + seed)
- `package.json`
- `pnpm-lock.yaml`
- `server.js`
- `.env` (atau edit langsung di server)

Yang **tidak perlu** di-upload:
- `node_modules/`

### 3. Di server, install dependencies
```bash
cd ~/k3-smart
pnpm install --frozen-lockfile
```

### 4. Jalankan migration + seed (kalau ada perubahan DB)
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5. Restart PM2
```bash
npx pm2 stop server
npx pm2 delete server
NODE_ENV=production npx pm2 start server.js --name server
npx pm2 save
```

---

## Cara upload ke server
Pakai `rsync` dari lokal:
```bash
rsync -avz --exclude='node_modules' --exclude='.git' \
  -e "ssh -p 64000" \
  ./ ksmartnp@flanders.id.rapidplex.com:~/k3-smart/
```

Atau kalau mau lebih simpel, zip dulu lalu upload via File Manager Domainesia.
