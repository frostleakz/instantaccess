require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, AllowedMentionsTypes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const INTERVAL_MS = 10 * 60 * 60 * 1000;
const STATE_FILE = path.join(__dirname, 'last-message.json');

if (!TOKEN || !CHANNEL_ID) {
  console.error('Missing DISCORD_TOKEN or CHANNEL_ID in .env');
  process.exit(1);
}

const MESSAGE = `@everyone @here
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

**#1 CONTENT ON THE INTERNET** <:1540446778963398731:1553725014862340106>

**PREVIEWS**  <:15408995336454185761:1553725045103403180>  https://discord.com/channels/1553720565892915280/1553721827442827356

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

**・PRICE: $25**

**・BUY:** https://boppers.vip/

<:1526154265632964710:1553725029525618738>  **INSTANT ACCESS**

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
***Make a Support Ticket: https://discord.com/channels/1553720565892915280/1553724756233158777 After Purchase For Access*** <:1501232690219847730:1553998475170029679>`;

function loadLastId() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')).id || null;
  } catch {
    return null;
  }
}

function saveLastId(id) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ id }, null, 2));
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

async function postPromo() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    throw new Error('CHANNEL_ID is not a text channel');
  }

  const prev = loadLastId();
  if (prev) {
    try {
      const old = await channel.messages.fetch(prev);
      await old.delete();
      console.log('Deleted previous promo', prev);
    } catch (err) {
      console.warn('Could not delete previous message:', err.message);
    }
  }

  const sent = await channel.send({
    content: MESSAGE,
    allowedMentions: {
      parse: [AllowedMentionsTypes.Everyone],
    },
  });

  saveLastId(sent.id);
  console.log('Posted promo', sent.id, new Date().toISOString());
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  try {
    await postPromo();
  } catch (err) {
    console.error('First post failed:', err);
  }
  setInterval(() => {
    postPromo().catch((err) => console.error('Scheduled post failed:', err));
  }, INTERVAL_MS);
});

client.login(TOKEN);