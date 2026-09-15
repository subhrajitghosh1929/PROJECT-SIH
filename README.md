# TransitMate — Prototype

This is the full TransitMate prototype as a real, standalone web project —
no longer tied to a chat window. It's still a **front-end demo with mock
data**: there's no real backend, no real accounts, no real GPS or bus data
yet. That's expected at this stage — this is for showing people the idea
and getting feedback, not a production app.

## Fastest way to share it — zero coding required

1. Go to **https://app.netlify.com/drop**
2. Drag the whole `dist` folder (the one sitting next to this README) onto
   that page.
3. Netlify gives you a live link in about 10 seconds — something like
   `random-name-123.netlify.app`. That link works on any phone or laptop
   browser. Share it with anyone.
4. Optional: make a free Netlify account first so the link doesn't expire
   and you can update it later by dragging a new `dist` folder in.

That's it — no terminal, no installing anything.

## If you want to keep developing it (needs a developer)

This folder is a normal [Vite](https://vitejs.dev) + React project.

```bash
npm install       # install dependencies
npm run dev       # run it locally at http://localhost:5173
npm run build     # produces a fresh dist/ folder to re-deploy
```

To put it on GitHub: create a new repository, then from inside this folder:

```bash
git init
git add .
git commit -m "Initial TransitMate prototype"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

Once it's on GitHub, you can also connect it to Vercel or Netlify for
automatic deploys every time the code changes — a developer can set this up
in a few minutes.

## What's in here

- `src/App.jsx` — the entire app: Login, Home, Route Recommender, Live
  Tracking (with the mock map), Seat & Crowd Intelligence, Alerts, Habit
  Analyzer, Community, and Settings (including light/dark mode).
- All data throughout is **mock/sample data** — routes, crowd levels,
  community posts, everything. Nothing is connected to a real transit
  system yet.

## What's genuinely next (not part of this prototype)

- A real backend, database, and user accounts
- Real GPS tracking (user location + live bus/metro position)
- A real map (Google Maps, Mapbox, or Mappls)
- Real transit data from a transit authority or crowdsourced from riders

These were discussed in detail during prototyping — ask your AI assistant
to pick the conversation back up when you're ready for that stage.
.