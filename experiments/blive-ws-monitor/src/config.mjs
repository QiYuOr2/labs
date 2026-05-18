import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * @typedef {Object} MonitorConfig
 * @property {[number, string][]} streamers
 */

/**
 * @returns {MonitorConfig}
 */
export function loadConfig() {
  const content = readFileSync(
    join(process.cwd(), 'monitor.config.json'),
    'utf-8'
  );

  /**
   * @type {MonitorConfig}
   */
  const config = JSON.parse(content);

  return config
}