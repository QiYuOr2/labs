export class PromiseQueue<T> {
  private isRunning = false;
  private queue: Array<() => Promise<T>> = [];

  public push(promise: () => Promise<T>) {
    this.queue.push(promise);

    if (!this.isRunning) {
      this.run();
    }
  }

  public async run() {
    while (this.queue.length) {
      const promise = this.queue.shift();
      this.isRunning = true;

      if (promise) {
        await promise();
      }
    }
    this.isRunning = false;
  }
}
