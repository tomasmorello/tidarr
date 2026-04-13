import { Request, Response, Router } from "express";

import { ensureAccessIsGranted } from "../helpers/auth";
import { sanitizeProcessingData } from "../processing/core/processing-manager";

const router = Router();

/**
 * @openapi
 * /api/stream-processing:
 *   get:
 *     operationId: streamProcessing
 *     summary: Stream processing queue updates (SSE)
 *     description: Server-Sent Events endpoint that streams real-time updates of the processing queue. Sends the full queue state on connection and pushes updates as items change status.
 *     responses:
 *       200:
 *         description: SSE stream of processing queue data
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessingItemResponse'
 */
router.get(
  "/stream-processing",
  ensureAccessIsGranted,
  (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Add the new connection to the list
    req.app.locals.activeListConnections.push(res);

    // Remove the connection from the list when it closes
    req.on("close", () => {
      req.app.locals.activeListConnections =
        req.app.locals.activeListConnections.filter(
          (conn: Response) => conn !== res,
        );
    });

    // Send initial state to the new client (strip internal fields)
    const sanitizedData = sanitizeProcessingData(
      req.app.locals.processingStack.data,
    );
    res.write(`data: ${JSON.stringify(sanitizedData)}\n\n`);
  },
);

/**
 * @openapi
 * /api/stream-item-output/{id}:
 *   get:
 *     operationId: streamItemOutput
 *     summary: Stream individual item output logs (SSE)
 *     description: Server-Sent Events endpoint that streams real-time output/logs for a specific processing item.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Processing item ID
 *     responses:
 *       200:
 *         description: SSE stream of item output
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 output:
 *                   type: string
 */
router.get(
  "/stream-item-output/:id",
  ensureAccessIsGranted,
  (req: Request, res: Response) => {
    const itemId = req.params.id;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Get or create the connections array for this item
    const connections: Map<string, Response[]> =
      req.app.locals.activeItemOutputConnections;
    if (!connections.has(itemId)) {
      connections.set(itemId, []);
    }
    connections.get(itemId)?.push(res);

    // Remove the connection when it closes
    req.on("close", () => {
      const itemConnections = connections.get(itemId);
      if (itemConnections) {
        const filtered = itemConnections.filter((conn) => conn !== res);
        if (filtered.length === 0) {
          connections.delete(itemId);
        } else {
          connections.set(itemId, filtered);
        }
      }
    });

    // Send initial output for this item
    const output =
      req.app.locals.processingStack.actions.getItemOutput(itemId) || "";
    res.write(`data: ${JSON.stringify({ id: itemId, output })}\n\n`);
  },
);

export default router;
