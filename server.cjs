const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.post('/api/track', (_, res) => res.json({ ok: true }));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
const port = process.env.PORT || 4173;
app.listen(port, () => console.log(`[AviationVibeCoder] :${port}`));
