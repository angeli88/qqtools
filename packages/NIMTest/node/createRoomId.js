const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const _ = require('lodash');
const dayjs = require('dayjs');

require('dayjs/locale/zh-cn');
require('../../NIMNodePolyfill/NIMNodePolyfill.cjs');

const NIM_SDK = require('@yxim/nim-web-sdk/dist/SDK/NIM_Web_SDK_nodejs');
const QChatSDK = require('nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js');

dayjs.locale('zh-cn');

const fsP = fs.promises;
const { Chatroom } = NIM_SDK;

const token = '';
const pa = '';
const pocket48Account = '';
const pocket48Token = '';

const appInfo = JSON.stringify({
  vendor: 'apple',
  deviceId: '52727911-9996-4449-8888-137923752345',
  appVersion: '6.2.2',
  appBuild: '21080401',
  osVersion: '14.2.0',
  osType: 'ios',
  deviceName: 'iPhone XR',
  os: 'ios'
});

function headers() {
  return {
    appInfo,
    'Content-Type': 'application/json;charset=utf-8',
    Host: 'pocketapi.48.cn',
    'User-Agent': 'PocketFans201807/6.0.23 (iPhone; iOS 14.2; Scale/2.00)',
    token,
    pa
  };
}

// 获取房间信息
function getRoomInfo(chatroomId) {
  return new Promise(async (resolve, reject) => {
    const appKey = await import(path.join(__dirname, '../../qqtools/src/QQ/sdk/appKey.mjs'));
    const nimChatroomSocket = Chatroom.getInstance({
      appKey: atob(appKey.default),
      isAnonymous: true,
      chatroomNick: randomUUID(),
      chatroomAvatar: '',
      chatroomId,
      chatroomAddresses: ['chatweblink01.netease.im:443'],
      onconnect(event) {
        resolve({
          nimChatroomSocket,
          event,
          success: 1
        });
      },
      ondisconnect(event) {
        resolve({
          nimChatroomSocket,
          event,
          success: 0
        });
      },
      onerror(err) {
        console.error(err);
      }
    });
  });
}

// 获取房间信息
function getServerInfo(serverId) {
  return new Promise(async (resolve, reject) => {
    try {
      const appKey = await import(path.join(__dirname, '../../qqtools/src/QQ/sdk/appKey.mjs'));
      const qchat = new QChatSDK({
        appkey: atob(appKey.default),
        account: pocket48Account,
        token: pocket48Token,
        linkAddresses: ['qchatweblink01.netease.im:443']
      });

      qchat.on('logined', async () => {
        const serverInfo = await qchat.qchatServer.getServers({
          serverIds: [serverId]
        });

        resolve({
          serverInfo,
          qchat,
          owner: serverInfo[0].owner,
          success: 1
        });
      });

      await qchat.login();
    } catch (err) {
      console.error(err);
    }
  });
}

async function main() {
  const Got = await import('got');
  const got = Got.default;

  // 写入文件
  const fileName = path.join(__dirname, 'roomId.json');
  let roomId = [];

  if (fs.existsSync(fileName)) {
    const file = await fsP.readFile(fileName, { encoding: 'utf8' });
    const json = JSON.parse(file);

    roomId = json.roomId;
  }

  try {
    // 获取当前账号的关注id
    const resFriends = await got.post('https://pocketapi.48.cn/user/api/v1/friendships/friends/id', {
      headers: headers(),
      responseType: 'json',
      json: {}
    });
    const friends = resFriends.body.content.data;

    for (let i = 0, j = friends.length; i < j; i++) {
      const friend = friends[i];

      console.log(i, friends.length - 1);

      const index = _.findIndex(roomId, { id: friend });

      let item = {};

      if (index >= 0) {
        item = roomId[index];
        continue;
      }

      // 获取账号信息
      const [resMembersInfo, resServerJumpInfo, resArchives] = await Promise.all([
        got.post('https://pocketapi.48.cn/im/api/v1/im/room/info/type/source', {
          headers: headers(),
          responseType: 'json',
          json: {
            type: 0,
            sourceId: friend
          }
        }),
        got.post('https://pocketapi.48.cn/im/api/v1/im/server/jump', {
          headers: headers(),
          responseType: 'json',
          json: {
            targetType: 1,
            starId: friend
          }
        }),
        got.post('https://pocketapi.48.cn/user/api/v1/user/star/archives', {
          headers: headers(),
          responseType: 'json',
          json: {
            memberId: friend
          }
        })
      ]);

      if (resMembersInfo.body.status === 200 || resServerJumpInfo.body.status === 200) {
        let ownerName2;

        if (resMembersInfo.body.status === 200 && resMembersInfo?.body?.content?.roomInfo) {
          const { roomId: rid, ownerName } = resMembersInfo.body.content.roomInfo;
          const { nimChatroomSocket, event, success } = await getRoomInfo(rid);
          const account = success ? event?.chatroom?.creator : undefined;

          ownerName2 = ownerName;
          nimChatroomSocket.disconnect();
          Object.assign(item, {
            id: friend,
            roomId: rid,
            account
          });

          console.log(`ID: ${ friend } ownerName: ${ ownerName } roomId: ${ rid } account: ${ account }`);
        }

        if (resServerJumpInfo.body.status === 200 && resServerJumpInfo?.body?.content?.jumpServerInfo) {
          const { serverId, serverOwner, serverOwnerName, teamId } = resServerJumpInfo.body.content.jumpServerInfo;
          const { qchat, owner, success } = await getServerInfo(`${ serverId }`);

          await qchat.destroy();

          item.ownerName = serverOwnerName ?? ownerName2;

          if (!item.id) {
            item.id = serverOwner;
          }

          Object.assign(item, {
            serverId,
            account: owner
          });

          if (resArchives.body.status === 200 && resArchives?.body?.content?.starInfo) {
            const { starTeamName, starTeamId, starGroupName, periodName, pinyin } = resArchives.body.content.starInfo;

            item.team = starTeamName;
            item.teamId = starTeamId;
            item.groupName = starGroupName;
            item.periodName = periodName;
            item.pinyin = pinyin;
          }

          console.log(`ID: ${ serverOwner } ownerName: ${ serverOwnerName } serverId: ${ item.serverId } team: ${ item.team }`);
        } else {
          ownerName2 && (item.ownerName = ownerName2);
        }

        if (Object.keys(item).length > 0) {
          if (index >= 0) {
            roomId[index] = item;
          } else {
            roomId.push(item);
          }
        }

        const newData = JSON.stringify({
          roomId: _.orderBy(roomId, ['id'], ['asc']),
          buildTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }, null, 2);

        await fsP.writeFile(fileName, newData);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

main();
