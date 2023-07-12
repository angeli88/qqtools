import { randomBytes } from 'node:crypto';
import Signer from './Signer';

const CHARACTERS: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * msToken的生成
 * @param { number } length: 107或者128
 */
export function msToken(length: number = 128): string {
  const bytes: Buffer = randomBytes(length);

  return Array.from(bytes, (byte: number): string => CHARACTERS[byte % CHARACTERS.length]).join('');
}

/* ua必须对应Params */
export const douyinUserAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57';
const systemInfoParams: Record<string, string> = {
  device_platform: 'webapp',
  aid: '6383',
  channel: 'channel_pc_web',
  pc_client_type: '1',
  version_code: '170400',
  version_name: '17.4.0',
  cookie_enabled: 'true',
  screen_width: '1440',
  screen_height: '900',
  browser_language: 'zh-CN',
  browser_platform: 'Win32',
  browser_name: 'Edge',
  browser_version: '113.0.1774.57',
  browser_online: 'true',
  engine_name: 'Blink',
  engine_version: '113.0.0.0',
  os_name: 'Windows',
  os_version: '10',
  cpu_core_num: '4',
  device_memory: '8',
  platform: 'PC',
  downlink: '10',
  effective_type: '4g',
  round_trip_time: '100'
};

export function awemePostQuery(secUserId: string): string {
  const token: string = msToken();
  const urlParam: URLSearchParams = new URLSearchParams({
    locate_query: 'false',
    show_live_replay_strategy: '1',
    count: '30',
    publish_video_strategy_type: '2',
    ...systemInfoParams,
    sec_user_id: secUserId,
    max_cursor: `${ new Date().getTime() }`,
    webid: `${ Math.random() }`.replace(/^0\./, ''),
    msToken: token
  });
  const xbogus: string = Signer.sign(urlParam.toString(), douyinUserAgent);

  urlParam.set('X-Bogus', xbogus);

  return urlParam.toString();
}