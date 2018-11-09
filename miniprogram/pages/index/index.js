const app = getApp()
Page({
  data: {
    musicList: [],
    themeColorList: [],
    isShowTheme: false,
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
      setTimeout(() => {
        if (this.data.isShowTheme) { // 3秒后自动隐藏当前显示的主题色选择框
          this.showTheme()  
        }
      }, 3000)
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
      },
      success: () => {
        wx.showToast({
          title: '主题色设置成功',
          icon: 'none',
          duration: 1000
        })
      },
      fail: () => {
        wx.showToast({
          title: '主题色设置失败',
          icon: 'none',
          duration: 1000
        })
      }
    })
  }
})
