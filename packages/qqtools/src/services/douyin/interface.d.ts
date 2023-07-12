/* 抖音user */
interface AwemeItemRate {
  width: number;
  height: number;
  url_list: Array<string>;
}

export interface AwemeItem {
  desc: string;
  video: {
    bit_rate: Array<{
      play_addr: AwemeItemRate;
      download_addr?: AwemeItemRate;
    }>;
    cover: {
      url_list: Array<string>;
    };
  };
  aweme_id: string;
  create_time: number;
  author: {
    nickname: string;
  };
}

export interface AwemePostResponse {
  aweme_list: Array<AwemeItem>;
  max_cursor: number;
  has_more: 1 | 0;
}