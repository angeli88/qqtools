import { randomUUID } from 'node:crypto';
import type { MessageElem } from 'oicq';
import type { ChannelInfo } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatChannelServiceInterface';
import QChatSocket from '../QChatSocket';
import { qChatSocketList } from '../Basic';
import { log } from '../utils/pocket48Utils';
import { getRoomMessage, getRoomMessageForOicq, getLogMessage, type RoomMessageArgs } from '../utils/pocket48V2Utils';
import { isOicq } from './utils';
import type QQ from '../QQ';
import type OicqQQ from '../OicqQQ';
import type { OptionsItemPocket48V2, MemberInfo } from '../../types';
import type { CustomMessageAllV2, UserV2, MessageChain } from '../qq.types';

/* 口袋48 */
class Pocket48V2Expand {
  static channelIdMap: Map<string, Array<ChannelInfo>>;

  public config: OptionsItemPocket48V2;
  public qq: QQ | OicqQQ;
  public qChatSocketId?: string;    // 对应的nim的唯一socketId
  public qChatSocket?: QChatSocket; // socket
  public memberInfo?: MemberInfo;   // 房间成员信息

  constructor({ config, qq }: { config: OptionsItemPocket48V2; qq: QQ | OicqQQ }) {
    this.config = config;
    this.qq = qq;
  }

  // 处理单个消息
  async roomSocketMessage(event: CustomMessageAllV2): Promise<void> {
    const {
      pocket48LiveAtAll,
      pocket48ServerId,
      pocket48ShieldMsgType,
      pocket48MemberInfo,
      pocket48LogSave,
      pocket48LogDir
    }: OptionsItemPocket48V2 = this.config;

    if (event.serverId !== pocket48ServerId) return; // 频道不一致时不处理

    // 类型
    let type: string = event.type;

    if (type === 'custom' && ('attach' in event) && ('messageType' in event.attach)) {
      type = event.attach.messageType;
    } else {
      type = type.toUpperCase();
    }

    if (pocket48ShieldMsgType && pocket48ShieldMsgType.includes(type)) return; // 屏蔽信息类型

    // 用户
    const user: UserV2 | undefined = event.ext ? JSON.parse(event.ext).user : undefined;

    if ((!user || user?.roleId !== 3) && type !== 'PRESENT_TEXT') return; // 过滤非房间成员

    let channel: Array<ChannelInfo> | undefined;

    if (Pocket48V2Expand.channelIdMap.has(event.channelId)) {
      channel = Pocket48V2Expand.channelIdMap.get(event.channelId);
    } else {
      const channelResult: Array<ChannelInfo> | undefined = await this.qChatSocket?.qChat!.qchatChannel.getChannels({
        channelIds: [event.channelId]
      });

      channelResult && Pocket48V2Expand.channelIdMap.set(event.channelId, channelResult);
    }

    // 发送的数据
    const roomMessageArgs: RoomMessageArgs = {
      user,
      data: event,
      pocket48LiveAtAll,
      pocket48ShieldMsgType,
      memberInfo: this.memberInfo,
      pocket48MemberInfo,
      channel
    };

    if (isOicq(this.qq)) {
      const sendGroup: Array<MessageElem> = getRoomMessageForOicq(roomMessageArgs);

      if (sendGroup.length > 0) {
        await this.qq.sendMessage(sendGroup);
      }
    } else {
      const sendGroup: Array<MessageChain> = getRoomMessage(roomMessageArgs);

      if (sendGroup.length > 0) {
        await this.qq.sendMessage(sendGroup);
      }
    }

    // 日志
    if (pocket48LogSave && pocket48LogDir && !/^\s*$/.test(pocket48LogDir)) {
      const logData: string | undefined = getLogMessage({
        user,
        data: event,
        memberInfo: this.memberInfo,
        channel
      });

      if (logData) {
        await log(pocket48LogDir, logData);
      }
    }
  }

  // 循环处理所有消息
  async roomSocketMessageAll(event: CustomMessageAllV2): Promise<void> {
    try {
      await this.roomSocketMessage(event);
    } catch (err) {
      console.error(err);
    }
  }

  // 事件监听
  handleRoomSocketMessage: Function = (event: CustomMessageAllV2): void => {
    this.roomSocketMessageAll(event);
  };

  // 口袋48监听初始化
  async initPocket48(): Promise<void> {
    const {
      pocket48RoomListener,
      pocket48ServerId,
      pocket48Account,
      pocket48Token
    }: OptionsItemPocket48V2 = this.config;

    if (!pocket48RoomListener) return;

    if (!(pocket48ServerId && pocket48Account && pocket48Token)) return;

    // 判断socket列表内是否有当前房间的socket连接
    const index: number = qChatSocketList.findIndex(
      (o: QChatSocket): boolean => o.pocket48ServerId === pocket48ServerId);

    this.qChatSocketId = randomUUID();

    if (index < 0) {
      const qChatSocket: QChatSocket = new QChatSocket({
        pocket48Account,
        pocket48Token,
        pocket48ServerId
      });

      await qChatSocket.init();
      qChatSocket.addQueue({
        id: this.qChatSocketId,
        onmsgs: this.handleRoomSocketMessage
      });
      qChatSocketList.push(qChatSocket); // 添加到列表
      this.qChatSocket = qChatSocket;
    } else {
      qChatSocketList[index].addQueue({
        id: this.qChatSocketId,
        onmsgs: this.handleRoomSocketMessage
      });
      this.qChatSocket = qChatSocketList[index];
    }

    if (this.qq.membersList?.length) {
      const idx: number = this.qq.membersList.findIndex((o: MemberInfo): boolean => o.serverId === `${ pocket48ServerId }`);

      if (idx >= 0) {
        this.memberInfo = this.qq.membersList[idx];
      }
    }
  }

  // 移除socket连接
  disconnectPocket48(): void {
    const { pocket48ServerId }: OptionsItemPocket48V2 = this.config;
    const index: number = qChatSocketList.findIndex((o: QChatSocket): boolean => o.pocket48ServerId === pocket48ServerId);

    if (index >= 0 && this.qChatSocketId) {
      qChatSocketList[index].removeQueue(this.qChatSocketId);

      if (qChatSocketList[index].queues.length === 0) {
        qChatSocketList[index].disconnect();
        qChatSocketList.splice(index, 1);
      }
    }

    this.qChatSocketId = undefined;
  }

  // 销毁
  destroy(): void {
    // 销毁口袋监听
    if (this.qChatSocketId) {
      this.disconnectPocket48();
    }
  }
}

export default Pocket48V2Expand;