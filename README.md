# MTF Lab

A Next.js MTF (Margin Trading Facility) Return & Risk Simulator for Groww and similar brokers.

## Features

- **Three funding modes**: Cash, Pledged holdings, Cash + Pledge
- **Break-even calculator**: Required stock appreciation to cover MTF costs
- **Return simulator**: Net P&L after interest, brokerage, and pledge charges
- **Decision engine**: How long you can hold before costs erase profits
- **Interactive charts**: P&L curve, break-even vs holding period, leverage comparison
- **Scenario explorer**: Heatmap of returns across stock movements
- **Risk metrics**: Effective leverage, downside at -5%, daily cost drag
- **Guided wizard flow** with localStorage persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS 4
- Recharts
- Framer Motion
- Zod

## Default Values

Based on Groww MTF rates (editable):
- Daily interest: 0.041% (14.95% p.a.)
- Leverage: up to 4x
- Brokerage: 0.1% per order
- Pledge/unpledge: ₹20 + GST per ISIN
