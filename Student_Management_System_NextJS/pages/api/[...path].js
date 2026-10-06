// Every /api/* request is handed to the Express app in server/app.js.
// On Vercel this file becomes one serverless function.
import app from '@/server/app';

export const config = {
  api: {
    bodyParser: false, // express.json() parses the body
    externalResolver: true, // Express sends the response
  },
};

export default function handler(req, res) {
  // Let Express parse the query string itself (Next adds the catch-all "path" param).
  req.query = undefined;
  // Next attaches its own res.status/json/send/redirect helpers; remove them so
  // Express's versions (from its response prototype) are used, exactly as in a plain Express server.
  ['status', 'json', 'send', 'redirect'].forEach((m) => delete res[m]);
  return app(req, res);
}
