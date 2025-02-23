import path from 'node:path';

export class WorkerExtractor {
  constructor(private _url: URL) {
  }

  public get url():URL {
    this._url.pathname = path.join(__dirname, this._url.pathname.replace(__webpack_public_path__, ''));
    return this._url;
  }
}
