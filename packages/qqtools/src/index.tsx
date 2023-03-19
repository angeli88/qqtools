import { createRoot, type Root } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import zhCN from 'antd/locale/zh_CN';
import { magenta } from '@ant-design/colors';
import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { storeFactory } from './store/store';
import Routers from './router/Routers';
import IDBInit from './utils/IDB/IDBInit';
import './main.tailwindcss.css';
import { proxyServerInit } from './utils/proxyServer/proxyServer';
import './components/Accessibility/Accessibility';

dayjs.locale('zh-cn');

/* app */
const root: Root = createRoot(document.getElementById('app')!);

root.render(
  <Provider store={ storeFactory() }>
    <ConfigProvider locale={ zhCN }
      theme={{
        token: {
          colorPrimary: magenta.primary
        }
      }}
    >
      <HashRouter>
        <Routers />
      </HashRouter>
    </ConfigProvider>
  </Provider>
);

IDBInit();
proxyServerInit();