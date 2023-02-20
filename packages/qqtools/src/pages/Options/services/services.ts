import got, { type Response as GotResponse } from 'got';
import { createHeaders } from '../../../utils/snh48';
import type { IMUserInfo, LoginUserInfo, SMSResult } from './interface';

/**
 * 获取im信息
 * @param { string } token
 */
export async function requestImUserInfo(token: string): Promise<IMUserInfo> {
  const res: GotResponse<IMUserInfo> = await got.post('https://pocketapi.48.cn/im/api/v1/im/userinfo', {
    responseType: 'json',
    headers: createHeaders(token),
    timeout: 180_000,
    json: {}
  });

  return res.body;
}

/**
 * 发送验证码
 * @param { string } mobile: 手机号
 * @param { string } area: 区号
 */
export async function requestSMS(mobile: string, area: string = '86'): Promise<SMSResult> {
  const res: GotResponse<SMSResult> = await got('https://pocketapi.48.cn/user/api/v1/sms/send2', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: { mobile, area }
  });

  return res.body;
}

/**
 * 验证码登录
 * @param { string } mobile: 手机号
 * @param { string } code: 短信验证码
 */
export async function requestMobileCodeLogin(mobile: string, code: string): Promise<LoginUserInfo> {
  const res: GotResponse<LoginUserInfo> = await got('https://pocketapi.48.cn/user/api/v1/login/app/mobile/code', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: { mobile, code }
  });

  return res.body;
}