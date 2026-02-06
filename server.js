
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Paths de archivos JSON
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const paths = {
  users: path.join(DATA_DIR, 'users.json'),
  products_yummy: path.join(DATA_DIR, 'products_yummy.json'),
  products_uwu: path.join(DATA_DIR, 'products_uwu.json'),
  shifts: path.join(DATA_DIR, 'shifts.json'),
  sales: path.join(DATA_DIR, 'sales.json'),
  sessions: path.join(DATA_DIR, 'sessions.json'),
  logs: path.join(DATA_DIR, 'logs.json')
};

// Helper para leer/escribir JSON
const readJSON = (file, def = []) => {
  if (!fs.existsSync(file)) return def;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return def;
  }
};

const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// Configuración de Webhooks (Mismo que types.ts)
const WEBHOOKS = {
  yummy: {
    TIME_LOG: "https://discord.com/api/webhooks/1409036327084621824/R1k1KsUJ1qfE3xEDtml0fLPuzU2Y9q7_k7_MGArbo9UUtow4K1ltMWK37VE_2HOVjlgr",
    SALES_LOG: "https://discord.com/api/webhooks/1409036353097961492/FPeovkjPJfrnOik9YK-Jv0ig63vDzlL-s5SOwWLw89I74Xd5XGkbyG2sefAOjb_gOAWV"
  },
  uwu: {
    TIME_LOG: "https://discord.com/api/webhooks/146824778354590101469/NHxdUGcqhzSs4tcNHTMFhYrO2MTT5GSLtpE6l5dJGZBC9ytHaz-e3-DcW6ONLiHfEGpr",
    SALES_LOG: "https://discord.com/api/webhooks/1468234728904593623/JQNF4EqPXKfkjiMIsnErJyJ2E-udICTQma5Ix6gkSs4EPDq7afc9g_s-JFlqAbiFvv1n"
  }
};

const formatMoney = (amount) => new Intl.NumberFormat('es-CL').format(Math.floor(amount));

// --- ENDPOINTS ---

app.get('/api/data', (req, res) => {
  res.json({
    users: readJSON(paths.users),
    products_yummy: readJSON(paths.products_yummy),
    products_uwu: readJSON(paths.products_uwu),
    shifts: readJSON(paths.shifts),
    logs: readJSON(paths.logs)
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(paths.users);
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
  res.json(user);
});

app.post('/api/clock', async (req, res) => {
  const { userId, username, locale, type, timestamp, session, shiftLog } = req.body;
  
  // Guardar log crudo
  const logs = readJSON(paths.logs);
  logs.unshift({ id: Date.now().toString(), userId, username, locale, type, timestamp });
  writeJSON(paths.logs, logs);

  // Guardar sesión del usuario
  const allSessions = readJSON(paths.sessions, {});
  allSessions[userId] = session;
  writeJSON(paths.sessions, allSessions);

  // Si terminó turno, guardar en historial
  if (shiftLog) {
    const shifts = readJSON(paths.shifts);
    shifts.unshift(shiftLog);
    writeJSON(paths.shifts, shifts);
  }

  // Enviar a Discord
  if (WEBHOOKS[locale]) {
    const color = type === 'entrada' ? 5763719 : type === 'pausa' ? 16776960 : 15548997;
    const emoji = type === 'entrada' ? '✅' : type === 'pausa' ? '⏸️' : '⛔';
    
    await fetch(WEBHOOKS[locale].TIME_LOG, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `${emoji} ${type.toUpperCase()}`,
          color,
          fields: [
            { name: "👤 Empleado", value: username, inline: true },
            { name: "🕒 Hora", value: new Date(timestamp).toLocaleTimeString(), inline: true },
            { name: "🏪 Local", value: locale.toUpperCase(), inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    }).catch(console.error);
  }

  res.json({ success: true });
});

app.post('/api/sale', async (req, res) => {
  const { username, locale, items, total } = req.body;
  const sales = readJSON(paths.sales);
  sales.unshift({ id: Date.now().toString(), username, locale, items, total, timestamp: new Date().toISOString() });
  writeJSON(paths.sales, sales);

  if (WEBHOOKS[locale]) {
    const itemsDesc = items.map(i => `${i.icon} ${i.name} (x${i.quantity})`).join('\n');
    await fetch(WEBHOOKS[locale].SALES_LOG, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "🧮 Venta Registrada",
          color: 6470386,
          fields: [
            { name: "👤 Cajero", value: username, inline: true },
            { name: "💰 Total", value: `$${formatMoney(total)}`, inline: true },
            { name: "🏪 Local", value: locale.toUpperCase(), inline: true },
            { name: "🛒 Productos", value: itemsDesc || "Sin productos" }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    }).catch(console.error);
  }
  res.json({ success: true });
});

// Admin routes
app.post('/api/admin/users', (req, res) => {
  const user = req.body;
  const users = readJSON(paths.users);
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user; else users.push(user);
  writeJSON(paths.users, users);
  res.json({ success: true });
});

app.delete('/api/admin/users/:id', (req, res) => {
  let users = readJSON(paths.users);
  users = users.filter(u => u.id !== req.params.id);
  writeJSON(paths.users, users);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Backend kawaii corriendo en puerto ${PORT}`));
