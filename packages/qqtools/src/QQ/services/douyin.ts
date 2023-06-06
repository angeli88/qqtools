import got, { type Response as GotResponse } from 'got';
import type { _AwemePostObject } from '@qqtools3/main/src/logProtocol/logTemplate/douyin';
import { pcUserAgent, awemePostQuery, type VideoQuery } from '../function/expand/douyin/signUtils';
import { _douyinLogProtocol } from '../../utils/logProtocol/logActions';
import type { AwemePostResponse } from './interface';

/**
 * 该方法运行在worker线程中，所以需要和其他依赖隔离
 */

/**
 * 请求user的视频列表
 * @param { string } cookie: string
 * @param { VideoQuery } videoQuery: user id
 */
export async function requestAwemePost(cookie: string, videoQuery: VideoQuery): Promise<AwemePostResponse | string> {
  const query: string = awemePostQuery(videoQuery);
  const res: GotResponse<AwemePostResponse | string> = await got.get(
    `https://www.douyin.com/aweme/v1/web/aweme/post/?${ query }`, {
      responseType: 'json',
      headers: {
        Referer: `https://www.douyin.com/user/${ videoQuery.secUserId }`,
        Host: 'www.douyin.com',
        'User-Agent': pcUserAgent,
        Cookie: cookie
      },
      followRedirect: false
    });

  _douyinLogProtocol.post<_AwemePostObject>('awemePost', {
    userId: videoQuery.secUserId,
    response: res.body === '' ? '' : JSON.stringify(res.body, null, 2)
  });

  return res.body;
}

/* 请求ttwid */
export async function requestTtwidCookie(): Promise<string> {
  const res: GotResponse = await got.post('https://ttwid.bytedance.com/ttwid/union/register/', {
    responseType: 'json',
    json: {
      region: 'union',
      aid: 1768,
      needFid: false,
      service: 'www.ixigua.com',
      migrate_info: { ticket: '', source: 'source' },
      cbUrlProtocol: 'https',
      union: true
    }
  });

  const cookie: Array<string> = [];

  if (res.headers?.['set-cookie']) {
    for (const cookieStr of res.headers['set-cookie']) {
      cookie.push(cookieStr);
    }
  }

  return cookie.join('; ');
}