import type { OpenDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { useEffect, ReactElement, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import type { Params, NavigateFunction } from 'react-router';
import { Form, Button, Space, Input, InputNumber, Divider, Switch, Checkbox, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { Store } from 'rc-field-form/es/interface';
import type { CheckboxOptionType } from 'antd/es/checkbox';
import { random, transform } from 'lodash-es';
import style from './index.sass';
import { saveFormData, getOptionItem } from '../reducers/reducers';
import CustomCmd from './CustomCmd';
import type { OptionsItem } from '../../../types';

const pocket48ShieldMsgTypeOptions: Array<CheckboxOptionType> = [
  { value: 'TEXT', label: '普通信息' },
  { value: 'REPLY', label: '回复信息' },
  { value: 'IMAGE', label: '图片' },
  { value: 'AUDIO', label: '语音' },
  { value: 'VIDEO', label: '视频' },
  { value: 'LIVEPUSH', label: '直播' },
  { value: 'FLIPCARD', label: '翻牌' },
  { value: 'EXPRESS', label: '表情' },
  { value: 'GIFTREPLY', label: '礼物回复信息' },
  { value: 'UNKNOWN', label: '未知类型' },
  { value: 'ERROR', label: '错误信息' }
];

/* 表单的初始化值 */
const initialStates: Store = {
  groupWelcomeSend: '<%= qqtools:At %>欢迎入群。',
  /*
  taobaTemplate: `@{{ nickname }} 刚刚在【{{ title }}】打赏了{{ money }}元，感谢这位聚聚！
项目地址：https://www.taoba.club/#/pages/idols/detail?id={{ taobaid }}
当前进度：￥{{ donation }} / ￥{{ amount }}
相差金额：￥{{ amountdifference }}
集资参与人数：{{ juser }}人
项目截止时间：{{ expire }}
距离项目截止还有：{{ timedifference }}`,
   */
  taobaCommandTemplate: `桃叭：{{ title }}
https://www.taoba.club/#/pages/idols/detail?id={{ taobaid }}`
};

/* 配置表单 */
function Edit(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const params: Params = useParams();
  const navigate: NavigateFunction = useNavigate();
  const [form]: [FormInstance] = Form.useForm();

  // 数据回填
  async function getData(): Promise<void> {
    const { result }: { result: OptionsItem } = await dispatch(getOptionItem({
      query: params.id
    }));

    form.setFieldsValue(result.value);
  }

  // 保存
  async function handleSaveClick(event: MouseEvent): Promise<void> {
    let formValue: Store | null = null;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      console.error(err);
    }

    if (!formValue) return;

    // 获取id或者随机id
    const id: string = params?.id ?? String(random(1, 10000000));
    const name: string = formValue.optionName;

    // 剔除undefined
    const formatFormValue: Store = transform(formValue, function(result: Store, value: any, key: string): void {
      if (value !== undefined) {
        result[key] = value;
      }
    }, {});

    await dispatch(saveFormData({
      data: { id, name, value: formatFormValue }
    }));

    navigate('/Options');
  }

  // 选择日志保存位置
  async function handleLogSaveDirClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      pocket48LogDir: result.filePaths[0]
    });
  }

  // 清除保存位置
  function handleLogSaveDirResetClick(event: MouseEvent<HTMLButtonElement>): void {
    form.resetFields(['pocket48LogDir']);
  }

  useEffect(function() {
    if (params?.id) {
      getData();
    }
  }, [params?.id]);

  return (
    <Form className={ style.form }
      form={ form }
      initialValues={ initialStates }
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 19 }}
    >
      {/* 基础表单配置 */}
      <Form.Item name="optionName"
        label="配置名称"
        rules={ [{ required: true, message: '必须填写配置名称', whitespace: true }] }
      >
        <Input />
      </Form.Item>
      <Form.Item name="optionType" label="配置类型">
        <Select allowClear={ true }>
          <Select.Option value="0">mirai</Select.Option>
          <Select.Option value="1">oicq</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="qqNumber" label="QQ号" rules={ [{ required: true, message: '必须填写QQ号' }] }>
        <InputNumber className={ style.inputNumber } />
      </Form.Item>
      <Form.Item name="groupNumber" label="群号" rules={ [{ required: true, message: '必须填写群号' }] }>
        <Input placeholder={ '支持配置多个群，以 "," 分隔' } />
      </Form.Item>
      <Form.Item name="socketHost" label="host">
        <Input placeholder="配置socket的host，默认为localhost，一般不需要填写" />
      </Form.Item>
      <Form.Item name="socketPort" label="端口号" rules={ [{ required: true, message: '必须填写端口号' }] }>
        <InputNumber className={ style.inputNumber } />
      </Form.Item>
      <Form.Item name="authKey" label="authKey">
        <Input />
      </Form.Item>

      {/* 口袋48房间监听配置 */}
      <Divider>口袋监听配置</Divider>
      <Form.Item name="pocket48RoomListener" label="开启监听" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="pocket48RoomId" label="房间ID">
        <Input />
      </Form.Item>
      <Form.Item name="pocket48IsAnonymous" label="游客模式" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="pocket48Account" label="IM的account">
        <Input />
      </Form.Item>
      <Form.Item name="pocket48Token" label="IM的token">
        <Input />
      </Form.Item>
      <Form.Item name="pocket48LiveAtAll" label="@全体成员" valuePropName="checked">
        <Checkbox>直播时@全体成员（需要有管理员权限）</Checkbox>
      </Form.Item>
      <Form.Item name="pocket48ShieldMsgType" label="屏蔽信息类型">
        <Checkbox.Group options={ pocket48ShieldMsgTypeOptions } />
      </Form.Item>
      <Form.Item name="pocket48RoomEntryListener" label="口袋房间进出监听" valuePropName="checked">
        <Checkbox>口袋房间进出监听（需要先导入房间信息）</Checkbox>
      </Form.Item>
      <Form.Item name="pocket48MemberInfo" label="发送时带上房间信息" valuePropName="checked">
        <Checkbox>发送时带上房间信息（需要先导入房间信息）</Checkbox>
      </Form.Item>
      <Form.Item name="pocket48LogSave" label="房间信息日志" valuePropName="checked">
        <Checkbox>口袋消息会同步记录到日志</Checkbox>
      </Form.Item>
      <Form.Item label="日志保存位置">
        <Space>
          <Form.Item name="pocket48LogDir" noStyle={ true }>
            <Input readOnly={ true } />
          </Form.Item>
          <Button onClick={ handleLogSaveDirClick }>选择日志保存位置</Button>
          <Button type="primary" danger={ true } onClick={ handleLogSaveDirResetClick }>清除</Button>
        </Space>
      </Form.Item>

      {/* 微博监听配置 */}
      <Divider>微博监听配置</Divider>
      <Form.Item name="weiboListener" label="开启监听" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="weiboUid" label="微博uid">
        <Input />
      </Form.Item>
      <Form.Item name="weiboAtAll" label="@全体成员" valuePropName="checked">
        <Checkbox>发微博时@全体成员（需要有管理员权限）</Checkbox>
      </Form.Item>

      {/* B站直播监听 */}
      <Divider>B站直播监听</Divider>
      <Form.Item name="bilibiliLive" label="开启监听" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="bilibiliLiveId" label="直播间ID">
        <Input />
      </Form.Item>
      <Form.Item name="bilibiliAtAll" label="@全体成员" valuePropName="checked">
        <Checkbox>直播时@全体成员（需要有管理员权限）</Checkbox>
      </Form.Item>

      {/* 桃叭集资监听 */}
      <Divider>桃叭集资配置</Divider>
      <Form.Item name="taobaListen" label="开启功能" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="taobaId" label="桃叭ID">
        <Input />
      </Form.Item>
      <Form.Item name="taobaCommandTemplate" label="集资命令模板">
        <Input.TextArea rows={ 3 } />
      </Form.Item>
      {/*
      <Form.Item name="taobaTemplate" label="集资结果模板">
        <Input.TextArea rows={ 7 } />
      </Form.Item>
      <Form.Item name="taobaRankList" label="结果包含排行榜" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="otherTaobaIds" label="其他桃叭ID">
        <Input />
      </Form.Item>
      */}

      {/* 群欢迎功能 */}
      <Divider>群欢迎功能</Divider>
      <Form.Item name="groupWelcome" label="开启功能" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="groupWelcomeSend" label="发送信息">
        <Input.TextArea rows={ 5 } />
      </Form.Item>

      {/* 定时任务 */}
      <Divider>定时任务</Divider>
      <Form.Item name="cronJob" label="开启任务" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="cronTime" label="执行时间">
        <Input />
      </Form.Item>
      <Form.Item name="cronSendData" label="发送信息">
        <Input.TextArea rows={ 5 } />
      </Form.Item>

      {/* 自定义命令 */}
      <Divider>自定义命令</Divider>
      <Form.Item name="customCmd" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
        <CustomCmd />
      </Form.Item>
      <Space>
        <Button type="primary" onClick={ handleSaveClick }>保存</Button>
        <Link to="/Options">
          <Button type="primary" danger={ true }>返回</Button>
        </Link>
      </Space>
    </Form>
  );
}

export default Edit;