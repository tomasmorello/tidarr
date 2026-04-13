/**
 * @openapi
 * components:
 *   schemas:
 *     ContentType:
 *       type: string
 *       enum:
 *         - album
 *         - track
 *         - playlist
 *         - artist
 *         - video
 *         - favorite_albums
 *         - favorite_tracks
 *         - favorite_playlists
 *         - favorite_videos
 *         - favorite_artists
 *         - artist_videos
 *         - mix
 *       description: Type of Tidal content
 *
 *     QualityType:
 *       type: string
 *       enum:
 *         - low
 *         - normal
 *         - high
 *         - max
 *       description: "Download quality. low=AAC-96, normal=AAC-320, high=16-bit FLAC, max=24-bit FLAC"
 *
 *     ProcessingItem:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - artist
 *         - type
 *         - quality
 *         - status
 *         - loading
 *         - error
 *       properties:
 *         id:
 *           type: string
 *           description: "Tidal content ID (numeric string for albums/tracks/artists/videos, UUID for playlists)"
 *         title:
 *           type: string
 *           description: "Item title. Use 'All albums' for artist type, 'All artist videos' for artist_videos type"
 *         artist:
 *           type: string
 *           description: "Artist name. Can be empty string for playlists, mixes, and favorites"
 *         url:
 *           type: string
 *           description: "Full Tidal URL (e.g. https://listen.tidal.com/album/123456) or content path. Optional for favorite_* types"
 *         type:
 *           $ref: '#/components/schemas/ContentType'
 *         quality:
 *           $ref: '#/components/schemas/QualityType'
 *         status:
 *           type: string
 *           enum:
 *             - queue_download
 *             - download
 *             - queue_processing
 *             - processing
 *             - queue
 *             - finished
 *             - error
 *           description: "Item status. Use 'queue_download' when adding new items. 'queue' is legacy"
 *         loading:
 *           type: boolean
 *           description: Whether the item is loading. Set to true when adding new items
 *         error:
 *           type: boolean
 *           description: Whether the item has an error. Set to false when adding new items
 *
 *     ProcessingItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         artist:
 *           type: string
 *         url:
 *           type: string
 *         type:
 *           $ref: '#/components/schemas/ContentType'
 *         quality:
 *           $ref: '#/components/schemas/QualityType'
 *         status:
 *           type: string
 *         loading:
 *           type: boolean
 *         error:
 *           type: boolean
 *         retryCount:
 *           type: integer
 *         networkError:
 *           type: boolean
 *         source:
 *           type: string
 *           enum:
 *             - lidarr
 *             - tidarr
 *         progress:
 *           type: object
 *           properties:
 *             current:
 *               type: integer
 *             total:
 *               type: integer
 *
 *     SyncItem:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - url
 *         - type
 *         - quality
 *       properties:
 *         id:
 *           type: string
 *           description: Tidal content ID or UUID
 *         title:
 *           type: string
 *           description: Playlist or item title
 *         url:
 *           type: string
 *           description: Full Tidal URL
 *         type:
 *           $ref: '#/components/schemas/ContentType'
 *         quality:
 *           $ref: '#/components/schemas/QualityType'
 *         artist:
 *           type: string
 *           description: Artist name (optional)
 *         lastUpdate:
 *           type: string
 *           description: ISO 8601 timestamp of last sync
 *
 *     HistoryList:
 *       type: array
 *       items:
 *         type: string
 *       description: Array of Tidal content IDs that have been downloaded
 *
 *     AuthSuccessResponse:
 *       type: object
 *       required:
 *         - accessGranted
 *         - token
 *       properties:
 *         accessGranted:
 *           type: boolean
 *         token:
 *           type: string
 *           description: JWT token valid for 12 hours
 *
 *     AuthErrorResponse:
 *       type: object
 *       required:
 *         - error
 *         - message
 *       properties:
 *         error:
 *           type: boolean
 *         message:
 *           type: string
 *
 *     IsAuthActiveResponse:
 *       type: object
 *       required:
 *         - isAuthActive
 *         - authType
 *       properties:
 *         isAuthActive:
 *           type: boolean
 *         authType:
 *           type: string
 *           nullable: true
 *           enum:
 *             - password
 *             - oidc
 *
 *     SettingsResponse:
 *       type: object
 *       properties:
 *         output:
 *           type: string
 *         parameters:
 *           type: object
 *           properties:
 *             ENABLE_BEETS:
 *               type: string
 *             REPLAY_GAIN:
 *               type: string
 *             PLEX_URL:
 *               type: string
 *             PLEX_PUBLIC_URL:
 *               type: string
 *             PLEX_LIBRARY:
 *               type: string
 *             PLEX_TOKEN:
 *               type: string
 *             PLEX_PATH:
 *               type: string
 *             JELLYFIN_URL:
 *               type: string
 *             JELLYFIN_PUBLIC_URL:
 *               type: string
 *             JELLYFIN_API_KEY:
 *               type: string
 *             NAVIDROME_URL:
 *               type: string
 *             NAVIDROME_PUBLIC_URL:
 *               type: string
 *             NAVIDROME_USER:
 *               type: string
 *             NAVIDROME_PASSWORD:
 *               type: string
 *             GOTIFY_URL:
 *               type: string
 *             GOTIFY_TOKEN:
 *               type: string
 *             NTFY_URL:
 *               type: string
 *             NTFY_TOPIC:
 *               type: string
 *             NTFY_TOKEN:
 *               type: string
 *             NTFY_PRIORITY:
 *               type: string
 *             PUID:
 *               type: string
 *             PGID:
 *               type: string
 *             UMASK:
 *               type: string
 *             TIDARR_VERSION:
 *               type: string
 *             APPRISE_API_ENDPOINT:
 *               type: string
 *             APPRISE_API_TAG:
 *               type: string
 *             PUSH_OVER_URL:
 *               type: string
 *             LOCK_QUALITY:
 *               type: string
 *             SYNC_CRON_EXPRESSION:
 *               type: string
 *             NO_DOWNLOAD:
 *               type: string
 *             ENABLE_HISTORY:
 *               type: string
 *             M3U_BASEPATH_FILE:
 *               type: string
 *             PLAYLIST_ALBUMS:
 *               type: string
 *             ARTIST_SINGLE_DOWNLOAD:
 *               type: string
 *             DOWNLOAD_BATCH_SIZE:
 *               type: string
 *             DOWNLOAD_BATCH_CRON:
 *               type: string
 *         noToken:
 *           type: boolean
 *           description: True if no Tidal token is configured
 *         tiddl_config:
 *           type: object
 *           description: "Tiddl configuration including auth tokens, download settings, templates, etc."
 *         configErrors:
 *           type: array
 *           items:
 *             type: string
 *           description: "Configuration errors, if any"
 *
 *     QueueStatusResponse:
 *       type: object
 *       required:
 *         - isPaused
 *       properties:
 *         isPaused:
 *           type: boolean
 *
 *     CustomCSSResponse:
 *       type: object
 *       required:
 *         - css
 *       properties:
 *         css:
 *           type: string
 *
 *     SaveSuccessResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *
 *     TiddlTomlResponse:
 *       type: object
 *       required:
 *         - toml
 *       properties:
 *         toml:
 *           type: string
 *           description: Raw TOML content of the tiddl configuration file
 *
 *     ApiKeyResponse:
 *       type: object
 *       required:
 *         - apiKey
 *       properties:
 *         apiKey:
 *           type: string
 *           description: 64-character API key
 *
 *     SignedUrlResponse:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         url:
 *           type: string
 *           description: Signed URL path with expiration and signature parameters
 *
 *     SabnzbdVersionResponse:
 *       type: object
 *       properties:
 *         version:
 *           type: string
 *
 *     SabnzbdAddResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         nzo_ids:
 *           type: array
 *           items:
 *             type: string
 *
 *     SabnzbdGetConfigResponse:
 *       type: object
 *       properties:
 *         config:
 *           type: object
 *           properties:
 *             version:
 *               type: string
 *             categories:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   priority:
 *                     type: integer
 *                   pp:
 *                     type: string
 *                   script:
 *                     type: string
 *                   dir:
 *                     type: string
 *             misc:
 *               type: object
 *               properties:
 *                 complete_dir:
 *                   type: string
 *                 download_dir:
 *                   type: string
 *                 api_key:
 *                   type: string
 *
 *     SabnzbdQueueResponse:
 *       type: object
 *       properties:
 *         queue:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum:
 *                 - Downloading
 *                 - Idle
 *                 - Paused
 *             paused:
 *               type: boolean
 *             pause_int:
 *               type: string
 *             speedlimit:
 *               type: string
 *             speedlimit_abs:
 *               type: string
 *             noofslots:
 *               type: integer
 *             limit:
 *               type: integer
 *             start:
 *               type: integer
 *             finish:
 *               type: integer
 *             slots:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum:
 *                       - Downloading
 *                       - Queued
 *                       - Paused
 *                   index:
 *                     type: integer
 *                   eta:
 *                     type: string
 *                   timeleft:
 *                     type: string
 *                   avg_age:
 *                     type: string
 *                   mb:
 *                     type: string
 *                   mbleft:
 *                     type: string
 *                   mbmissing:
 *                     type: string
 *                   size:
 *                     type: string
 *                   sizeleft:
 *                     type: string
 *                   filename:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   cat:
 *                     type: string
 *                   percentage:
 *                     type: string
 *                   nzo_id:
 *                     type: string
 *                   unpackopts:
 *                     type: string
 *                   labels:
 *                     type: array
 *                     items:
 *                       type: string
 *
 *     SabnzbdHistoryResponse:
 *       type: object
 *       properties:
 *         history:
 *           type: object
 *           properties:
 *             noofslots:
 *               type: integer
 *             month_size:
 *               type: string
 *             week_size:
 *               type: string
 *             day_size:
 *               type: string
 *             total_size:
 *               type: string
 *             slots:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum:
 *                       - Completed
 *                       - Failed
 *                   name:
 *                     type: string
 *                   nzo_id:
 *                     type: string
 *                   category:
 *                     type: string
 *                   size:
 *                     type: string
 *                   bytes:
 *                     type: string
 *                   fail_message:
 *                     type: string
 *                   download_time:
 *                     type: integer
 *                   downloaded:
 *                     type: integer
 *                   completeness:
 *                     type: integer
 *                   script:
 *                     type: string
 *                   script_log:
 *                     type: string
 *                   script_line:
 *                     type: string
 *                   download_name:
 *                     type: string
 *                   path:
 *                     type: string
 *                   storage:
 *                     type: string
 *                   status_string:
 *                     type: string
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */
