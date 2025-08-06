This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


mkdir certificates
mkcert -key-file certificates/localhost-key.pem -cert-file certificates/localhost.pem localhost 192.168.1.225 127.0.0.1 ::1

"dev": "next dev --turbopack --experimental-https --experimental-https-key ./certificates/localhost-key.pem --experimental-https-cert ./certificates/localhost.pem -H 192.168.1.225",

https://artificialanalysis.ai/?models=llama-3-3-instruct-70b%2Cllama-3-2-instruct-90b-vision%2Cllama-4-maverick%2Cllama-4-scout%2Cclaude-4-opus%2Cclaude-4-sonnet%2Cdeepseek-r1%2Cnova-premier%2Caya-expanse-32b%2Caya-expanse-8b%2Ccommand-a%2Cclaude-3-7-sonnet%2Cnova-pro%2Cnova-lite%2Cnova-micro%2Ccommand-r-plus%2Ccommand-r-plus-04-2024%2Ccommand-r%2Ccommand-r-03-2024&intelligence-tab=coding
ngrok http --url=liberal-chicken-funky.ngrok-free.app https://192.168.1.225:3000

NEXTAUTH_URL=https://192.168.1.225:3000/

anthropic.claude-3-7-sonnet-20250219-v1:0 eu-west-2
anthropic.claude-sonnet-4-20250514-v1:0 us-east-1

Give me a 2D Side Scroller Game in a Website I can upload to vercel easily.
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
