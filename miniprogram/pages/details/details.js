Page({
  data: {
    themeColor: '',
    songsList: [],
    totalTime: '',
    allTime: 0,
    name: '',
    singer: '',
    url: '',
    order: ''
  },
  onLoad () {
    wx.cloud.callFunction({
      name: 'getData',
      data: {
        collection: 'current_theme'
      },
      success: (res) => {
        this.setData({
          themeColor: res.result.data[0].color
        })
      }
    })
    wx.cloud.callFunction({
      name: 'getData',
      data: {
        collection: 'my_favor'
      },
      success: (res) => {
        // 从缓存中读取上次播放的歌曲，初始化songsData,同步操作
        var songsData = wx.getStorageSync('songsData') 
        if (!songsData) {
          songsData = res.result.data[0]
        }
        this.setData({
          name: songsData.name,
          singer: songsData.singer,
          allTime: songsData.allTime,
          totalTime: songsData.totalTime,
          url: songsData.url,
          order: songsData.order,
          songsList: res.result.data
        })
      }
    })
  },
  changeSong: function (e) {
    var data = e.currentTarget.dataset.info
    this.setData({
      name: data.name,
      singer: data.singer,
      allTime: data.allTime,
      totalTime: data.totalTime,
      url: data.url,
      order: data.order
    })
    // 将当前播放的音乐写入缓存
    wx.setStorageSync('songsData',data)
    this.selectComponent("#footer").init('destroy')
  }
})