export default {
  /*
  * 首页Banner列表查询
  * @orgId
  * 古玩城：89f7052610324f6da8100d91d7b7279d
  * 素能中心：80773b45579b4d93acfb114b49330442
  */
  banner: {
    list: '/api/prime/officialsite/bannerlist'
  },
  /*
  * 公司新闻、艺术雅集、活动资讯列表查询
  * @channelId
  * 公司新闻：d642023d8b2a4c4ab4f4f0023d2c8dca
  * 艺术雅集：ea179fb51f764df68042833fa3581c13
  * 活动资讯：16eb978a7b7745b6808edb0da5a9bb07
  */
  news: {
    list: '/api/prime/officialsite/newslist',
    listpage: '/api/prime/officialsite/newslistbypage',
    detail: '/api/prime/officialsite/newsdetail'
  },
  famous: {
    list: '/api/gwc/artist/listAll',
    detail: '/api/gwc/artist/detail'
  }
}
