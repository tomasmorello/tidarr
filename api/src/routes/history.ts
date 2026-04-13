import { Request, Response, Router } from "express";

import { getAppInstance } from "../helpers/app-instance";
import { ensureAccessIsGranted } from "../helpers/auth";
import { handleRouteError } from "../helpers/error-handler";
import { flushHistory } from "../services/history";

const router = Router();

/**
 * @openapi
 * /api/history/list:
 *   get:
 *     operationId: getHistory
 *     summary: Get download history
 *     description: Returns the download history. Requires ENABLE_HISTORY=true in Docker configuration.
 *     responses:
 *       200:
 *         description: History list (array of Tidal content ID strings)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoryList'
 *   delete:
 *     operationId: clearHistory
 *     summary: Clear download history
 *     description: Delete all entries from the download history.
 *     responses:
 *       204:
 *         description: History cleared
 */
router.get(
  "/history/list",
  ensureAccessIsGranted,
  (_req: Request, res: Response) => {
    try {
      const app = getAppInstance();
      res.json(app.locals.history);
    } catch (error) {
      handleRouteError(error, res, "get history");
    }
  },
);

router.delete(
  "/history/list",
  ensureAccessIsGranted,
  (_req: Request, res: Response) => {
    try {
      flushHistory();
      res.sendStatus(204);
    } catch (error) {
      handleRouteError(error, res, "remove all items from history");
    }
  },
);

export default router;
