import * as path from 'node:path';
import * as process from 'node:process';
import { createClient, type Client } from 'oicq';
import { isDevelopment, __dirname } from '../utils.js';
import * as log from '../log.js';
import { Login, System } from './EventType.js';
import type { Config } from '../types.js';
import type {
  OicqArgs,
  SystemLoginSliderEvent,
  SystemLoginSliderListener,
  SystemLoginDeviceEvent,
  SystemLoginDeviceListener,
  SystemLoginErrorEvent,
  SystemLoginErrorListener,
  SystemOfflineEvent,
  SystemOfflineListener,
  SystemOnlineListener
} from './types.js';

/**
 * oicq登录
 */

class Oicq {
  public config: Config;
  public client: Client;
  private onlineSuccessCallback: () => any;

  constructor(args: OicqArgs) {
    this.config = args.config;
    this.onlineSuccessCallback = args.onlineSuccessCallback;
  }

  // 监听验证码
  handleSystemLoginSlider: SystemLoginSliderListener = (event: SystemLoginSliderEvent): void => {
    console.log('请打开下面的网址，滑动验证码后输入ticket。');
    console.log(event.url);
    process.stdin.once('data', (ticket: Buffer): void => this.client.submitSlider(String(ticket).trim()));
  };

  // 监听设备锁
  handleSystemLoginDevice: SystemLoginDeviceListener = (event: SystemLoginDeviceEvent): void => {
    console.log('请打开下面的网址，处理设备锁。');
    console.log(event.url);
    process.stdin.once('data', (): Promise<void> => this.client.login(this.config.password));
  };

  // 登录错误
  handleSystemLoginError: SystemLoginErrorListener = (event: SystemLoginErrorEvent): void => {
    log.error(event.message);
    this.client.logout();
  };

  // 被下线
  handleSystemOffline: SystemOfflineListener = (event: SystemOfflineEvent): void => {
    log.warning(event.message);
    this.client.logout();
  };

  // 登录成功
  handleSystemOnline: SystemOnlineListener = (): void => {
    console.log('账号登录成功。');
    this.onlineSuccessCallback();
  };

  // 初始化
  init(): void {
    this.client = createClient(this.config.uin, {
      log_level: 'trace',
      platform: this.config.platform ?? 1,
      ignore_self: false,
      data_dir: isDevelopment ? path.join(__dirname, '../oicq') : path.join(__dirname, 'oicq')
    });
    this.client.on(Login.Slider, this.handleSystemLoginSlider);
    this.client.on(Login.Device, this.handleSystemLoginDevice);
    this.client.on(Login.Error, this.handleSystemLoginError);
    this.client.on(System.Offline, this.handleSystemOffline);
    this.client.on(System.Online, this.handleSystemOnline);
  }
}

export default Oicq;