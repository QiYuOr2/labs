// 题目：实现一个带并发限制的Promise调度器
// 要求：
// 请实现一个带并发限制的Promise调度器Scheduler，保证同时最多运行的Promise数量不超过限制。调度器需要提供两个主要方法：

// add(promiseCreator)：添加一个返回Promise的函数到调度器。
// start()：开始执行所有已添加的Promise函数。
// 示例：

class Scheduler {
  constructor(limit) {
    this.limit = limit;
    this.queue = [];
    this.current = 0;
  }

  add(promiseCreator) {
    this.queue.push(promiseCreator);
  }

  start() {
    const next = () => {
      if (this.queue.length === 0 || this.current >= this.limit) {
        return;
      }
      const promise = this.queue.shift();
      this.current++;
      promise().finally(() => {
        this.current--;
        next();
      });
    }
    for (let i = 0; i < this.limit; i++) {
      next();
    }
  }

  start() {
    while (this.queue.length) {
      if (this.current < this.limit) {
        const promise = this.queue.shift();
        this.current++;
        promise().finally(() => {
          this.current--;
        });
      }
    }
  }
}

// 示例用法：
const timeout = (time) => new Promise((resolve) => setTimeout(resolve, time));

const scheduler = new Scheduler(2);

const addTask = (time, order) => {
  scheduler.add(() => timeout(time).then(() => console.log(order)));
};

addTask(1000, "1");
addTask(500, "2");
addTask(300, "3");
addTask(400, "4");

scheduler.start();

// 预期输出：
// 2
// 3
// 1
// 4
