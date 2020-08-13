/* 全局的store */
import { configureStore, getDefaultMiddleware, ReducersMapObject, Reducer, Store } from '@reduxjs/toolkit';
import { createReducer, ignoreOptions } from './reducers';

/* reducer列表 */
const reducer: Reducer = createReducer({});
const asyncReducers: ReducersMapObject = {}; // 异步的reducers

/* store */
const store: Store = {} as Store;

export function storeFactory(initialState: object = {}): Store {
  // 避免热替换导致redux的状态丢失
  if (Object.keys(store).length === 0) {
    /* store */
    Object.assign(store, configureStore({
      reducer,
      preloadedState: initialState,
      middleware: getDefaultMiddleware({
        immutableCheck: ignoreOptions,
        serializableCheck: ignoreOptions
      })
    }));
  }

  return store;
}

/* 注入store */
export function injectReducers(asyncReducer: ReducersMapObject): void {
  for (const key in asyncReducer) {
    // 获取reducer的key值，并将reducer保存起来
    if (!(key in asyncReducers)) {
      const item: Reducer = asyncReducer[key];

      asyncReducers[key] = item;
    }
  }

  // 异步注入reducer
  store.replaceReducer(createReducer(asyncReducers));
}

export default store;