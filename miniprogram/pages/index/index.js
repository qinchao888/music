const app = getApp()
Page({
  data: {
    musicList: [],
    themeColorList: [],
    isShowTheme: false,
    // themeColor: '',
    animationData: {},
    rate: 2
  },
  onLoad () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    wx.getSystemInfo({
      success: (res) => {
        var rate = 750 / res.screenWidth
        this.setData({rate})
      }
    })
    wx.cloud.callFunction({
      name: 'getData',
      data: {
        collection: 'music_list'
      },
      success: res => {
        this.setData({
          musicList: res.result.data
        })
      },
      fail : () => {
        wx.showModal({
          title: '歌单加载失败'
        })
      }
    })
    wx.cloud.callFunction({
      name: 'getData',
      data: {
        collection: 'theme_color'
      },
      success: res => {
        this.setData({
          themeColorList: res.result.data
        })
      },
      fail : () => {
        wx.showModal({
          title: '主题色加载失败'
        })
      }
    })
  },
  showTheme: function () {
    var animation = wx.createAnimation({
      duration: 200
    })
    var distance = 240 / this.data.rate
    if (!this.data.isShowTheme) { // 显示
      animation.translate(-distance).step()
    } else { // 隐藏
      animation.translate(distance).step() 
    }
    this.setData({
      animationData: animation.export(),
      isShowTheme: !this.data.isShowTheme
    })
  },
  switchTheme: function (e) {
    var themeColor = e.target.dataset.value
    if (themeColor) {
      this.setData({
        themeColor: themeColor
      })
    }
    // 移出动画
    var animation = wx.createAnimation({
      duration: 200
    })
    animation.translate(240 / this.data.rate).step()
    this.setData({
      animationData: animation.export(),
      isShowTheme: false
    })
    wx.cloud.callFunction({
      name: 'updateData',
      data: {
        collection: 'current_theme',
        themeColor: themeColor
      }
    })
  }
})
