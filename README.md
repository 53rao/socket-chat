## Getting Started

### Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS
- **Real-time Communication:** WebSocket (ws)
- **WebSocket Server:** Node.js, TypeScript, `tsx`

### Start the Development Server

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

You can start editing the page by modifying `app/page.tsx`. The page automatically updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a font family for Vercel.

### Start the WebSocket Server

In a separate terminal, run:

```bash
npx tsx server/ws-server.ts
```

### Environment Variables

Create a `.env` file in the project root:

```env
DISCORD_WEBHOOK_URL=
```

Add your Discord webhook URL as the value of `DISCORD_WEBHOOK_URL` when needed.