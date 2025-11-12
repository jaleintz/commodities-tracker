# Commodities Inflation Tracker

A Next.js application for tracking commodity prices and storing them in a Supabase database.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Input form for tracking prices of:
  - Eggs
  - Hamburger
  - Bacon
  - Whole Milk
  - Butter
  - Bread
- Data is automatically saved to Supabase database
- Responsive design with Tailwind CSS
- Timestamps are automatically recorded

## Environment Variables

The `.env.local` file contains:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Database

Table name: `commodities-inflation-tb`

Columns:
- id (auto-increment)
- egg_price
- hamburger_price
- bacon_price
- whole_milk_price
- butter_price
- bread_price
- created_at (timestamp)
