import { Express, Request, Response, Router } from "express";

import { ensureAccessIsGranted } from "../helpers/auth";
import { handleRouteError } from "../helpers/error-handler";
import {
  validateIdMiddleware,
  validateRequestBody,
} from "../helpers/validation";
import {
  addItemToSyncList,
  createSyncCronJob,
  getSyncList,
  process_sync_list,
  removeAllFromSyncList,
  removeItemFromSyncList,
} from "../services/sync";
import { SyncListResponse } from "../types";

const router = Router();

/**
 * @openapi
 * /api/sync/list:
 *   get:
 *     operationId: getSyncList
 *     summary: Get synchronized playlists
 *     description: Returns the list of playlists/items being synchronized on a cron schedule.
 *     responses:
 *       200:
 *         description: Sync list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SyncItem'
 */
router.get(
  "/sync/list",
  ensureAccessIsGranted,
  async (_req: Request, res: Response<SyncListResponse>) => {
    try {
      const list = await getSyncList();
      res.status(200).json(list);
    } catch (error) {
      handleRouteError(error, res, "get sync list");
    }
  },
);

/**
 * @openapi
 * /api/sync/save:
 *   post:
 *     operationId: addToSyncList
 *     summary: Add item to sync list
 *     description: "Add a playlist or other content to the synchronization list. Items in the sync list are automatically re-downloaded on a cron schedule (default: 3 AM daily)."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item
 *             properties:
 *               item:
 *                 $ref: '#/components/schemas/SyncItem'
 *           examples:
 *             playlist:
 *               summary: Sync a playlist
 *               value:
 *                 item:
 *                   id: abc123-def456
 *                   title: My Playlist
 *                   url: "https://listen.tidal.com/playlist/abc123-def456"
 *                   type: playlist
 *                   quality: high
 *     responses:
 *       201:
 *         description: Item added to sync list
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/sync/save",
  ensureAccessIsGranted,
  validateRequestBody(["item"]),
  async (req: Request, res: Response) => {
    try {
      await addItemToSyncList(req.body.item);
      await createSyncCronJob(req.app as Express);

      res.sendStatus(201);
    } catch (error) {
      handleRouteError(error, res, "add item to sync list");
    }
  },
);

/**
 * @openapi
 * /api/sync/remove:
 *   delete:
 *     operationId: removeFromSyncList
 *     summary: Remove item from sync list
 *     description: Remove a specific item from the synchronization list by its ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                 description: ID of the sync item to remove
 *     responses:
 *       204:
 *         description: Item removed from sync list
 *       400:
 *         description: Invalid or missing ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/sync/remove",
  ensureAccessIsGranted,
  validateRequestBody(["id"]),
  validateIdMiddleware,
  async (req: Request, res: Response) => {
    try {
      await removeItemFromSyncList(req.body.id);
      await createSyncCronJob(req.app as Express);

      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "remove item from sync list");
    }
  },
);

/**
 * @openapi
 * /api/sync/remove-all:
 *   delete:
 *     operationId: clearSyncList
 *     summary: Remove all items from sync list
 *     description: Clear the entire synchronization list.
 *     responses:
 *       204:
 *         description: Sync list cleared
 */
router.delete(
  "/sync/remove-all",
  ensureAccessIsGranted,
  async (req: Request, res: Response) => {
    try {
      await removeAllFromSyncList();
      await createSyncCronJob(req.app as Express);

      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "remove all items from sync list");
    }
  },
);

/**
 * @openapi
 * /api/sync/trigger:
 *   post:
 *     operationId: triggerSync
 *     summary: Trigger sync now
 *     description: Manually trigger synchronization of all items in the sync list. Each item is re-queued for download.
 *     responses:
 *       202:
 *         description: Sync triggered
 */
router.post(
  "/sync/trigger",
  ensureAccessIsGranted,
  async (_req: Request, res: Response) => {
    try {
      await process_sync_list(res.app as Express);

      res.sendStatus(202);
    } catch (error) {
      handleRouteError(error, res, "trigger sync");
    }
  },
);

export default router;
