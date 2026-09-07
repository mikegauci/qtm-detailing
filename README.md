# QTM Detailing

Premium dark marketing site for **QTM Detailing** — automotive detailing in Malta.

## Stack

- Next.js 16 (App Router, Turbopack)
- Tailwind CSS 4
- shadcn/ui
- Motion (scroll animations)
- Supabase (CMS, leads, bookings)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env.local` and add your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route      | Description                          |
| ---------- | ------------------------------------ |
| `/`        | Homepage with hero, services, pricing |
| `/services`| Full service catalog and FAQ         |
| `/gallery` | Before/after portfolio with lightbox |
| `/about`   | Story and process                    |
| `/contact` | Contact details and WhatsApp link    |

## Brand Colors

- Purple: `#4a1e71`
- Cyan/Blue: `#027991`
- Dark base: `#07070b`

## Content

Placeholder content lives in `src/content/`. Edit these files to swap in real services, prices, testimonials, and contact details.

## Build

```bash
npm run build
npm start
```
