export interface IMUserInfo {
  status: 200 | number;
  success: boolean;
  content: {
    userId: number;
    accid: string;
    pwd: string;
  };
}

export interface SMSResult {
  status: number;
  success: boolean;
  message: string;
  content: null;
}

/* 登录结果 */
export interface LoginUserInfo {
  content: {
    userInfo: {
      userId: number;
      token: string;
      nickname: string;
      avatar: string;
    };
    token: string;
  };
  status: number;
  success: boolean;
  message: string;
}