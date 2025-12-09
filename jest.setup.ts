import '@testing-library/jest-dom';
// jest.setup.ts  (o el archivo de setup que tengas)

// Polyfill simple para ResizeObserver en Jest
if (typeof (global as any).ResizeObserver === "undefined") {
  class ResizeObserver {
    callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe() {
      // no-op
    }
    unobserve() {
      // no-op
    }
    disconnect() {
      // no-op
    }
  }

  (global as any).ResizeObserver = ResizeObserver;
}
