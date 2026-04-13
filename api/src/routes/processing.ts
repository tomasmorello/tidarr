import { Request, Response, Router } from "express";

import { ensureAccessIsGranted } from "../helpers/auth";
import { handleRouteError } from "../helpers/error-handler";
import {
  validateIdMiddleware,
  validateItemMiddleware,
  validateRequestBody,
} from "../helpers/validation";

const router = Router();

/**
 * @openapi
 * /api/save:
 *   post:
 *     operationId: addToQueue
 *     summary: Add an item to the download queue
 *     description: "Add an album, track, video, playlist, mix, artist discography, or favorites to the download queue. The item object must include all required fields: id, title, artist, url, type, quality, status, loading, and error."
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
 *                 $ref: '#/components/schemas/ProcessingItem'
 *           examples:
 *             album:
 *               summary: Download an album
 *               value:
 *                 item:
 *                   id: "251082404"
 *                   title: Random Access Memories
 *                   artist: Daft Punk
 *                   url: "https://listen.tidal.com/album/251082404"
 *                   type: album
 *                   quality: high
 *                   status: queue_download
 *                   loading: true
 *                   error: false
 *             track:
 *               summary: Download a track
 *               value:
 *                 item:
 *                   id: "123456789"
 *                   title: Get Lucky
 *                   artist: Daft Punk
 *                   url: "https://listen.tidal.com/track/123456789"
 *                   type: track
 *                   quality: high
 *                   status: queue_download
 *                   loading: true
 *                   error: false
 *             video:
 *               summary: Download a video
 *               value:
 *                 item:
 *                   id: "123456789"
 *                   title: Video Title
 *                   artist: Artist Name
 *                   url: "123456789"
 *                   type: video
 *                   quality: high
 *                   status: queue_download
 *                   loading: true
 *                   error: false
 *             playlist:
 *               summary: Download a playlist
 *               value:
 *                 item:
 *                   id: abc123-def456
 *                   title: My Playlist
 *                   artist: ""
 *                   url: "https://listen.tidal.com/playlist/abc123-def456"
 *                   type: playlist
 *                   quality: high
 *                   status: queue_download
 *                   loading: true
 *                   error: false
 *             artist:
 *               summary: Download all albums by an artist
 *               value:
 *                 item:
 *                   id: "3566315"
 *                   title: All albums
 *                   artist: Daft Punk
 *                   url: "https://listen.tidal.com/artist/3566315"
 *                   type: artist
 *                   quality: high
 *                   status: queue_download
 *                   loading: true
 *                   error: false
 *             favorite_albums:
 *               summary: Download all favorite albums (url is optional for favorites)
 *               value:
 *                 item:
 *                   id: favorite_albums
 *                   title: Favorite Albums
 *                   artist: ""
 *                   type: favorite_albums
 *                   quality: high
 *                   status: queue_download
 *                   loading: true
 *                   error: false
 *     responses:
 *       201:
 *         description: Item added to queue
 *       400:
 *         description: Invalid request body or item structure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/save",
  ensureAccessIsGranted,
  validateRequestBody(["item"]),
  validateItemMiddleware,
  async (req: Request, res: Response) => {
    try {
      req.app.locals.processingStack.actions.addItem(req.body.item);
      res.sendStatus(201);
    } catch (error) {
      handleRouteError(error, res, "add item to queue");
    }
  },
);

/**
 * @openapi
 * /api/remove:
 *   delete:
 *     operationId: removeFromQueue
 *     summary: Remove an item from the queue
 *     description: Remove a specific item from the download queue by its ID.
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
 *                 description: ID of the item to remove
 *     responses:
 *       204:
 *         description: Item removed
 *       400:
 *         description: Invalid or missing ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/remove",
  ensureAccessIsGranted,
  validateRequestBody(["id"]),
  validateIdMiddleware,
  (req: Request, res: Response) => {
    try {
      req.app.locals.processingStack.actions.removeItem(req.body.id);
      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "remove item from queue");
    }
  },
);

/**
 * @openapi
 * /api/remove-all:
 *   delete:
 *     operationId: clearQueue
 *     summary: Clear the entire download queue
 *     description: Remove all items from the download queue.
 *     responses:
 *       204:
 *         description: Queue cleared
 */
router.delete(
  "/remove-all",
  ensureAccessIsGranted,
  (req: Request, res: Response) => {
    try {
      req.app.locals.processingStack.actions.removeAllItems();
      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "remove all items from queue");
    }
  },
);

/**
 * @openapi
 * /api/remove-finished:
 *   delete:
 *     operationId: removeFinishedFromQueue
 *     summary: Remove finished and errored items from queue
 *     description: "Remove all items with 'finished' or 'error' status from the download queue."
 *     responses:
 *       204:
 *         description: Finished items removed
 */
router.delete(
  "/remove-finished",
  ensureAccessIsGranted,
  (req: Request, res: Response) => {
    try {
      req.app.locals.processingStack.actions.removeFinishedItems();
      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "remove finished items from queue");
    }
  },
);

/**
 * @openapi
 * /api/queue/pause:
 *   post:
 *     operationId: pauseQueue
 *     summary: Pause the download queue
 *     description: "Stops processing new items. Cancels the current download and resets it to 'queue_download' status. Cleans up incomplete downloads."
 *     responses:
 *       204:
 *         description: Queue paused
 */
router.post(
  "/queue/pause",
  ensureAccessIsGranted,
  async (req: Request, res: Response) => {
    try {
      await req.app.locals.processingStack.actions.pauseQueue();
      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "pause queue");
    }
  },
);

/**
 * @openapi
 * /api/queue/resume:
 *   post:
 *     operationId: resumeQueue
 *     summary: Resume the download queue
 *     description: Resume processing items in the download queue.
 *     responses:
 *       204:
 *         description: Queue resumed
 */
router.post(
  "/queue/resume",
  ensureAccessIsGranted,
  (req: Request, res: Response) => {
    try {
      req.app.locals.processingStack.actions.resumeQueue();
      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "resume queue");
    }
  },
);

/**
 * @openapi
 * /api/single-download:
 *   post:
 *     operationId: singleDownload
 *     summary: Trigger a single download in NO_DOWNLOAD mode
 *     description: "Trigger a one-off download for a specific item. Works for items in 'queue_download', 'error', or 'finished' status. The item goes through the full download pipeline (beets, move to library, notifications) and ends up as 'finished'. Useful in NO_DOWNLOAD mode to selectively download individual items."
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
 *                 description: ID of the item to download
 *     responses:
 *       204:
 *         description: Download triggered
 *       400:
 *         description: Invalid or missing ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Item not found or not in valid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/single-download",
  ensureAccessIsGranted,
  validateRequestBody(["id"]),
  validateIdMiddleware,
  async (req: Request, res: Response) => {
    try {
      await req.app.locals.processingStack.actions.singleDownload(req.body.id);
      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "single download");
    }
  },
);

/**
 * @openapi
 * /api/queue/status:
 *   get:
 *     operationId: getQueueStatus
 *     summary: Get queue pause status
 *     description: Returns whether the download queue is currently paused.
 *     responses:
 *       200:
 *         description: Queue status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueueStatusResponse'
 */
router.get(
  "/queue/status",
  ensureAccessIsGranted,
  (req: Request, res: Response) => {
    try {
      const status = req.app.locals.processingStack.actions.getQueueStatus();
      res.json(status);
    } catch (error) {
      handleRouteError(error, res, "get queue status");
    }
  },
);

export default router;
