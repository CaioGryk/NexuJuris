import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
import { RedisService } from '../redis/redis.service';

export interface QueueConfig {
  name: string;
  connection?: {
    host: string;
    port: number;
  };
}

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly queues: Map<string, Queue> = new Map();
  private readonly workers: Map<string, Worker> = new Map();

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async onModuleDestroy() {
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    for (const queue of this.queues.values()) {
      await queue.close();
    }
  }

  createQueue(name: string, options?: Queue['opts']): Queue {
    const existingQueue = this.queues.get(name);
    if (existingQueue) {
      return existingQueue;
    }

    const queue = new Queue(name, {
      ...options,
      connection: this.redisService.getClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        ...options?.defaultJobOptions,
      },
    });

    this.queues.set(name, queue);
    return queue;
  }

  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  async addJob(name: string, data: unknown, options?: { priority?: number; delay?: number; ttl?: number }): Promise<void> {
    const queue = this.getQueue(name) || this.createQueue(name);
    
    const jobOptions: Record<string, unknown> = {};
    if (options?.priority) jobOptions.priority = options.priority;
    if (options?.delay) jobOptions.delay = options.delay;
    if (options?.ttl) jobOptions.ttl = options.ttl;

    await queue.add(name, data, jobOptions);
  }

  createWorker(
    name: string,
    processor: (job: Job) => Promise<unknown>,
    options?: { concurrency?: number },
  ): Worker {
    const existingWorker = this.workers.get(name);
    if (existingWorker) {
      return existingWorker;
    }

    const worker = new Worker(name, processor, {
      connection: this.redisService.getClient(),
      concurrency: options?.concurrency || 1,
    });

    this.workers.set(name, worker);
    return worker;
  }

  async getJobCount(name: string): Promise<{ waiting: number; active: number; completed: number; failed: number }> {
    const queue = this.getQueue(name);
    if (!queue) {
      return { waiting: 0, active: 0, completed: 0, failed: 0 };
    }

    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  async drainQueue(name: string): Promise<void> {
    const queue = this.getQueue(name);
    if (queue) {
      await queue.drain();
    }
  }
}