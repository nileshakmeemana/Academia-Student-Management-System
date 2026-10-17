// Resolves a mongodb+srv:// URI into a plain mongodb:// URI when the normal DNS
// lookup fails. Some networks (many home/ISP routers) refuse the SRV and TXT
// queries Atlas needs and fail with "querySrv ECONNREFUSED". We then try other
// DNS servers, and finally DNS-over-HTTPS (port 443), which works almost anywhere.
const dns = require('dns');

const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

const SYSTEM_SERVERS = dns.getServers();
const CUSTOM_SERVERS = list(process.env.MONGO_DNS_SERVERS);
const PUBLIC_SERVERS = ['1.1.1.1', '8.8.8.8', '9.9.9.9'];
const DOH = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/resolve'];

// Errors that mean "the SRV/TXT lookup itself failed", not a bad cluster name.
const isSrvLookupError = (err) =>
  Boolean(err) &&
  /query(Srv|Txt)/i.test(`${err.syscall || ''} ${err.message || ''}`) &&
  ['ECONNREFUSED', 'ETIMEOUT', 'ETIMEDOUT', 'ESERVFAIL', 'ECONNRESET', 'EREFUSED'].includes(err.code);

async function viaServers(servers, srvName, host) {
  const r = new dns.promises.Resolver({ timeout: 4000, tries: 1 });
  r.setServers(servers);
  const srv = await r.resolveSrv(srvName);
  let txt = [];
  try {
    txt = await r.resolveTxt(host);
  } catch (err) {
    if (!['ENODATA', 'ENOTFOUND'].includes(err.code)) throw err;
  }
  return { hosts: srv.map((s) => `${s.name}:${s.port}`), txt: txt.map((parts) => parts.join('')) };
}

async function viaDoh(endpoint, srvName, host) {
  const ask = async (name, type) => {
    const res = await fetch(`${endpoint}?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { accept: 'application/dns-json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`DNS-over-HTTPS ${res.status}`);
    const body = await res.json();
    return (body.Answer || []).filter((a) => a.type === (type === 'SRV' ? 33 : 16)).map((a) => a.data);
  };
  const srv = await ask(srvName, 'SRV');
  if (!srv.length) throw new Error('No SRV records');
  const txt = await ask(host, 'TXT');
  return {
    // "0 0 27017 ac-xxx-shard-00-00.abc.mongodb.net."
    hosts: srv.map((d) => {
      const [, , port, target] = d.split(/\s+/);
      return `${target.replace(/\.$/, '')}:${port}`;
    }),
    txt: txt.map((d) => d.replace(/"\s*"/g, '').replace(/^"|"$/g, '')),
  };
}

// mongodb+srv://user:pass@cluster0.abc.mongodb.net/db?x=y  ->  mongodb://user:pass@h1:27017,h2,h3/db?tls=true&replicaSet=…&x=y
async function resolveSrvUri(uri) {
  const url = new URL(uri);
  const host = url.hostname;
  const srvName = `_mongodb._tcp.${host}`;
  const parent = host.split('.').slice(1).join('.');

  const attempts = [];
  if (CUSTOM_SERVERS.length) attempts.push(['custom DNS', () => viaServers(CUSTOM_SERVERS, srvName, host)]);
  if (SYSTEM_SERVERS.length) attempts.push(['system DNS', () => viaServers(SYSTEM_SERVERS, srvName, host)]);
  attempts.push(['public DNS', () => viaServers(PUBLIC_SERVERS, srvName, host)]);
  DOH.forEach((ep) => attempts.push([`DNS-over-HTTPS (${new URL(ep).host})`, () => viaDoh(ep, srvName, host)]));

  const errors = [];
  for (const [label, run] of attempts) {
    try {
      const { hosts, txt } = await run();
      // Same safety rule as the driver: SRV targets must live under the cluster's domain.
      const okHosts = hosts.filter((h) => h.split(':')[0].endsWith(`.${parent}`));
      if (!okHosts.length) throw new Error('SRV records point outside the cluster domain');

      const params = new URLSearchParams();
      txt.forEach((t) => new URLSearchParams(t).forEach((v, k) => params.set(k, v)));
      if (!params.has('tls') && !params.has('ssl')) params.set('tls', 'true');
      url.searchParams.forEach((v, k) => params.set(k, v)); // options in the URI win over TXT

      const auth = url.username ? `${url.username}${url.password ? `:${url.password}` : ''}@` : '';
      const path = url.pathname && url.pathname !== '/' ? url.pathname : '/';
      console.log(`MongoDB SRV lookup failed on the default DNS; resolved ${host} via ${label}.`);
      return `mongodb://${auth}${okHosts.join(',')}${path}?${params.toString()}`;
    } catch (err) {
      errors.push(`${label}: ${err.code || err.message}`);
    }
  }
  const err = new Error(`Could not resolve ${srvName} (${errors.join('; ')})`);
  err.code = 'ESRVRESOLVE';
  throw err;
}

module.exports = { isSrvLookupError, resolveSrvUri };
