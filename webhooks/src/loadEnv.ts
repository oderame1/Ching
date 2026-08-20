// Load this service's own .env before any other module (notably the shared
// backend config, which also calls dotenv). Importing this first guarantees the
// webhook service uses its own PORT/config instead of inheriting the backend's.
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
