import { randomBytes } from 'node:crypto';
import Signer from '../../../sdk/Signer';

const CHARACTERS: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * msToken的生成
 * @param { number } length: 107或者128
 */
export function msToken(length: number = 128): string {
  const bytes: Buffer = randomBytes(length);

  return Array.from(bytes, (byte: number): string => CHARACTERS[byte % CHARACTERS.length]).join('');
}

export const pcUserAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  + ' (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.69';

export interface VideoQuery {
  secUserId: string;
  webId: string;
}

export function awemePostQuery(videoQuery: VideoQuery): string {
  const token: string = msToken();
  const urlParam: URLSearchParams = new URLSearchParams({
    device_platform: 'webapp',
    aid: '6383',
    channel: 'channel_pc_web',
    sec_user_id: videoQuery.secUserId,
    max_cursor: `${ new Date().getTime() }`,
    locate_query: 'false',
    show_live_replay_strategy: '1',
    count: '10',
    publish_video_strategy_type: '2',
    pc_client_type: '1',
    version_code: '170400',
    version_name: '17.4.0',
    cookie_enabled: 'true',
    screen_width: '1440',
    screen_height: '900',
    browser_language: 'zh-CN',
    browser_platform: 'MacIntel',
    browser_name: 'Edge',
    browser_version: '110.0.1587.69',
    browser_online: 'true',
    engine_name: 'Blink',
    engine_version: '110.0.0.0',
    os_name: 'Mac+OS',
    os_version: '10.15.7',
    cpu_core_num: '4',
    device_memory: '8',
    platform: 'PC',
    downlink: '3.6',
    effective_type: '4g',
    round_trip_time: '100',
    webid: videoQuery.webId,
    msToken: token
  });
  const xbogus: string = Signer.sign(urlParam.toString(), pcUserAgent);

  urlParam.set('X-Bogus', xbogus);

  return urlParam.toString();
}