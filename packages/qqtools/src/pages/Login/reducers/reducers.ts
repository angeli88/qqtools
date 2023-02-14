import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction } from '@reduxjs/toolkit';
import type { QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { roomIdObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { QQModals } from '../../../QQ/QQBotModals/ModalTypes';

export interface LoginInitialState {
  loginList: Array<QQModals>;
}

type CaseReducers = SliceCaseReducers<LoginInitialState>;

const { actions, reducer }: Slice = createSlice<LoginInitialState, CaseReducers, 'login'>({
  name: 'login',
  initialState: {
    loginList: [] // 使用Map存储数组，保证里面的值不被immer处理
  },
  reducers: {
    // 添加一个新的登陆
    setAddLogin(state: LoginInitialState, action: PayloadAction<QQModals>): void {
      state.loginList = state.loginList.concat([action.payload]);
    },

    // 删除登陆
    setDeleteLogin(state: LoginInitialState, action: PayloadAction<QQModals>): void {
      state.loginList = state.loginList.filter((o: QQModals): boolean => o.id !== action.payload.id);
    }
  }
});

export const { setAddLogin, setDeleteLogin }: Record<string, Function> = actions;

export const getRoomId: QueryDispatchFunc = IDBRedux.getAction({
  objectStoreName: roomIdObjectStoreName
});

export default { login: reducer };