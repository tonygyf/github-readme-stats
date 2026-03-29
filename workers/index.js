import { VercelRequest, VercelResponse } from './vercel-adapter.js';
import api from '../api/index.js';
import gist from '../api/gist.js';
import pin from '../api/pin.js';
import toplevel from '../api/top-langs.js';
import wakatime from '../api/wakatime.js';

const routes = {
  '/api': api,
  '/api/gist': gist,
  '/api/pin': pin,
  '/api/top-langs': toplevel,
  '/api/wakatime': wakatime,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    const route = routes[pathname];
    if (!route) {
      return new Response('Not Found', { status: 404 });
    }

    const req = new VercelRequest(request);
    req.query = Object.fromEntries(searchParams);

    const res = new VercelResponse(request);

    await route(req, res);

    return res.send();
  },
};