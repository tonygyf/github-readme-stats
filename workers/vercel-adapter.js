export class VercelRequest {
  constructor(request, query) {
    this.query = query;
  }
}

export class VercelResponse {
  constructor() {
    this._status = 200;
    this._headers = {};
    this._body = '';
  }

  setHeader(key, value) {
    this._headers[key] = value;
    return this;
  }

  status(code) {
    this._status = code;
    return this;
  }

  send(body) {
    this._body = body ?? '';
    return new Response(this._body, {
      status: this._status,
      headers: this._headers,
    });
  }
}