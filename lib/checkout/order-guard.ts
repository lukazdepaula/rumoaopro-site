import { AsyncLocalStorage } from 'node:async_hooks';
import { getOrderById } from './db';
import { assertRetryWork, claimRetryWork, finishRetryWork } from './retry-storage';
import type { Order } from './types';

const owners = new AsyncLocalStorage<{ id: string; token: string }>();

/** Reentrant only within the same request; ownership is stored in the database. */
export async function withRaptorOrderGuard<T>(id: string, action: (order: Order) => Promise<T>): Promise<T> {
  const inherited = owners.getStore();
  if (inherited?.id === id) {
    await assertRaptorOrderOwner(id);
    const order = await getOrderById(id);
    if (!order) throw Error('Order not found');
    return action(order);
  }
  const key = `raptor-order:${id}`;
  const claim = await claimRetryWork(key);
  if (claim.state !== 'claimed' || !claim.token) throw Error('Raptor order is already processing');
  try {
    return await owners.run({ id, token: claim.token }, async () => {
      const order = await getOrderById(id);
      if (!order) throw Error('Order not found');
      const result = await action(order);
      await assertRaptorOrderOwner(id);
      return result;
    });
  } finally {
    await finishRetryWork(key, claim.token, false);
  }
}

export async function assertRaptorOrderOwner(id: string) {
  const owner = owners.getStore();
  if (!owner || owner.id !== id) throw Error('Missing Raptor order ownership');
  await assertRetryWork(`raptor-order:${id}`, owner.token);
}

export async function assertRaptorOrderPaid(id: string) {
  await assertRaptorOrderOwner(id);
  const order = await getOrderById(id);
  if (!order || order.status !== 'paid') throw Error('Closed or unpaid order cannot grant access');
  return order;
}
