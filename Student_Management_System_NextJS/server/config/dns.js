const dns = require('dns');

const servers = (process.env.MONGO_DNS_SERVERS || '')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (servers.length > 0) {
  dns.setServers(servers);
}
