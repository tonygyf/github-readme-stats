import { VercelRequest, VercelResponse } from './vercel-adapter.js';
import api from '../api/index.js';
import gist from '../api/gist.js';
import pin from '../api/pin.js';
import toplevel from '../api/top-langs.js';
import wakatime from '../api/wakatime.js';

// 路由映射表
const routes = {
  '/api': api,
  '/api/gist': gist,
  '/api/pin': pin,
  '/api/top-langs': toplevel,
  '/api/wakatime': wakatime,
  '/': api, // 增加根路径兼容
};

export default {
  async fetch(request, env, ctx) {
    // --- 核心修复：桥接环境变量 ---
    // 必须手动将 env 里的变量挂载到 globalThis.process.env
    // 这样 api/index.js 里的代码才能读到你设置的 PAT
    globalThis.process = globalThis.process || { env: {} };
    if (env) {
      Object.assign(globalThis.process.env, env);
    }

    const url = new URL(request.url);
    let { pathname } = url;
    const { searchParams } = url;

    // 简单兼容性处理：如果路径以 / 结尾则去掉它
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }

    const route = routes[pathname];

    // 如果找不到路由，返回清晰的 404
    if (!route) {
      return new Response(`Route Not Found: ${pathname}. Try /api?username=xxx`, { 
        status: 404,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      });
    }

    try {
      const req = new VercelRequest(request);
      req.query = Object.fromEntries(searchParams);

      const res = new VercelResponse(request);

      // 执行 API 逻辑
      await route(req, res);

      // 发送最终的图片响应
      return res.send();
    } catch (err) {
      // 捕获运行时错误，防止显示 XML 报错页面
      // 这样你能直接在浏览器看到具体的错误代码堆栈
      return new Response(`Worker Error: ${err.message}\n${err.stack}`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      });
    }
  },
};