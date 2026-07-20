/**
 * Register Discord slash commands via REST API.
 * Run once: DISCORD_TOKEN=xxx DISCORD_APP_ID=xxx node scripts/register-discord-commands.js
 */

const APP_ID = process.env.DISCORD_APP_ID;
const TOKEN = process.env.DISCORD_TOKEN;

if (!APP_ID || !TOKEN) {
  console.error("Set DISCORD_APP_ID and DISCORD_TOKEN env vars");
  process.exit(1);
}

const commands = [
  {
    name: "create",
    description: "Create a new Cloud Mail account",
    options: [
      {
        name: "username",
        description: "Email username (before @)",
        type: 3, // STRING
        required: true,
      },
      {
        name: "domain",
        description: "Email domain",
        type: 3, // STRING
        required: true,
        autocomplete: true,
      },
      {
        name: "password",
        description: "Account password (min 6 chars)",
        type: 3, // STRING
        required: true,
      },
    ],
  },
];

const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`;

async function register() {
  console.log(`Registering ${commands.length} command(s) to ${url}...`);

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Failed (${res.status}):`, body);
    process.exit(1);
  }

  const data = await res.json();
  console.log("Done! Registered commands:");
  data.forEach((cmd) => console.log(`  /${cmd.name} — ${cmd.id}`));
}

register().catch(console.error);

