# Hayot OS

Shaxsiy hayotni boshqarish tizimi — vazifalar, odatlar, ibodat, o'qish, moliya, karyera va media bitta joyda.

## Texnologiyalar

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth (Credentials, JWT sessiya)
- Railway (hosting + Postgres)

## Mahalliy ishga tushirish

```bash
npm install
cp .env.example .env   # DATABASE_URL va AUTH_SECRET ni to'ldiring
npx prisma db push     # sxemani bazaga qo'llash
npm run dev
```

`AUTH_SECRET` generatsiya qilish uchun:

```bash
openssl rand -base64 32
```

## Railway'ga deploy qilish

1. Railway loyihangizga **PostgreSQL** service qo'shing (agar hali yo'q bo'lsa).
2. Shu repo uchun yangi **service** yarating va uni GitHub reponi bilan bog'lang (yoki `railway up` orqali).
3. Service **Variables** bo'limida quyidagilarni qo'shing:
   - `DATABASE_URL` — Postgres service'ning `DATABASE_URL` qiymatini shu yerga referens qiling (Railway'da servicelar orasida `${{Postgres.DATABASE_URL}}` kabi referens qilish mumkin)
   - `AUTH_SECRET` — yuqoridagi buyruq bilan generatsiya qilingan qiymat
4. Build/Start buyruqlari avtomatik `package.json`dan olinadi (`npm run build`, `npm start`).
5. Birinchi deploydan keyin, bazaga sxemani qo'llash uchun Railway CLI orqali bir martalik buyruq yuboring:
   ```bash
   railway run npx prisma db push
   ```

## Loyiha tuzilmasi

- `src/app/(dashboard)/` — autentifikatsiyadan o'tgan foydalanuvchi ko'radigan sahifalar (sidebar bilan)
- `src/app/login`, `src/app/register` — kirish/ro'yxatdan o'tish
- `src/app/api/` — route handlerlar (auth, register, tasks)
- `src/lib/auth.ts` — NextAuth konfiguratsiyasi
- `src/lib/prisma.ts` — Prisma client singleton
- `prisma/schema.prisma` — barcha modullar uchun ma'lumotlar bazasi sxemasi
- `src/proxy.ts` — himoyalangan sahifalarga kirishni tekshiruvchi proxy (Next.js 16'da `middleware` proxy deb nomlangan)

## Hozirgi holat (1-bosqich)

- ✅ Autentifikatsiya (ro'yxatdan o'tish/kirish)
- ✅ Dashboard skeleti va navigatsiya
- ✅ Vazifalar (Tasks) moduli — to'liq CRUD
- ⏳ Odatlar, Ibodat, O'qish, Moliya, Karyera, Media, Analitika — sxema tayyor, UI navbatda
