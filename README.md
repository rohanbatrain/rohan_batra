This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Bulk Import Characters

You can create many characters at once via a bulk API that accepts JSON arrays or CSV data.

- Endpoint: `POST /api/admin/characters/bulk`
- Auth: Clerk user with `admin` or `editor` role (send a Bearer JWT in the Authorization header)
- Content-Types: `application/json` or `text/csv`

JSON example:

```bash
curl -X POST "$BASE/api/admin/characters/bulk" \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '[
		{"name":"Alice","role":"protagonist","birthdate":"1990-05-01","tags":["hero"]},
		{"name":"Bob","role":"supporting","age":32,"tags":["friend","ally"]}
	]'
```

CSV example (use `|` to separate tags):

```bash
curl -X POST "$BASE/api/admin/characters/bulk" \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: text/csv" \
	--data-binary @characters.csv
```

CSV headers supported include: `name,fullName,slug,visibility,role,significance,description,personality,background,physicalDescription,goals,conflicts,birthdate,age,tags,featured,avatar,bookId`.

See `examples/bulk-add-characters.js` for a Node script that uploads either JSON or CSV files.
