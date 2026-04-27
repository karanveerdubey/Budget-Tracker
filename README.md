# Budget Tracker

A full-stack expense tracking web application with receipt OCR, budget management, and interactive financial visualizations. Live at [expenses.karandubey.xyz](https://expenses.karandubey.xyz).

---

## Features

- **Receipt OCR** — upload a receipt photo and have expenses parsed automatically via the OpenAI API
- **Budget tracking** — set monthly budgets per category and track spending against them
- **Visualizations** — pie charts, progress bars, and line graphs for spending trends
- **Secure auth** — login and signup with hashed passwords and session management
- **100% uptime** — deployed on AWS EC2 with Caddy as a reverse proxy and a custom domain

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| OCR | OpenAI API |
| Deployment | AWS EC2, Caddy |

---

## Project Structure

```
Budget-Tracker/
├── budget-tracker-frontend/   # React app
├── routes/                    # Express API routes
├── middleware/                # Auth middleware
├── server.js                  # Entry point
└── db.js                      # PostgreSQL connection
```
