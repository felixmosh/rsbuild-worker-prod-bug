import { WorkerExtractor } from './WorkerExtractor';

(async function main() {
  console.log('Server started!');

  const workerExtractor = new WorkerExtractor(
    new URL('./worker.worker.ts', import.meta.url),
  );

  const workerPath = workerExtractor.url.pathname;
  console.log({ workerPath });

  // needed so rspack won't include this file in the bundle
  // in real example, there is a node_modules lib that loads the worker with `import(worker-path)`
  const worker = __non_webpack_require__(workerPath);

  if(worker.default && typeof worker.default === 'function') {
    await worker.default();
  }

})();
if (module.hot) {
  module.hot.accept();
}
