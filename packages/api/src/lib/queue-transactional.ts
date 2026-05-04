import { enqueueJob } from "./queue.js";
import type { TransactionalEmailMeta } from "./queue.js";

export async function queueTransactionalEmail(
  orgId: string,
  userId: string,
  meta: TransactionalEmailMeta
): Promise<void> {
  await enqueueJob("send_transactional", {
    orgId,
    userId,
    metadata: { transactional: meta },
  });
}
