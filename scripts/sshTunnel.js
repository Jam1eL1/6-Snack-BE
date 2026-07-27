const { spawnSync } = require("node:child_process");

const requiredEnvironmentVariables = [
  "SSH_KEY_PATH",
  "DB_HOST",
  "EC2_USER",
  "EC2_HOST",
];

for (const name of requiredEnvironmentVariables) {
  if (!process.env[name]) {
    throw new Error(`${name} is required.`);
  }
}

const result = spawnSync(
  "ssh",
  [
    "-i",
    process.env.SSH_KEY_PATH,
    "-L",
    `5432:${process.env.DB_HOST}:5432`,
    `${process.env.EC2_USER}@${process.env.EC2_HOST}`,
  ],
  { stdio: "inherit" },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
