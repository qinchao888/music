/**tips: 
1. 播放完成后需再次播放，由于currentTime仍旧停留在上次结束的时候导致无法初始化。
解决办法：创建新实例
2. currentTime - this.data.preTime <= 1将误差控制在1以内，防止后退时由于问题1导致无法后退。
*/
var timer = 0
var changingTimer = 0
var innerAudioContext = {}
Component({
  properties: {
    themeColor: String,
    singer: String,
    allTime: Number,
    totalTime: String,
    name: String,
    url: String,
    songsList: Array,
    order: Number
  },
  data: {
    sliderValue: 0,
    icon: '../../images/pause.svg',
    curTime: '00:00',
    preTime: 0,
    popValue: '',
    isSingleLoop: false
  },
  ready () {
    setTimeout(() => { // 保证url已初始化
      this.init()
    }, 1000)
  },
  methods: {
    init (e) {
      console.log(this.data.songsList)
      this.setData({
        sliderValue: 0,
        curTime: '00:00',
        preTime: 0
      })
      if ( e === 'destroy') { // 切换当前播放的歌曲
        innerAudioContext.pause() // 终止当前音乐的播放并销毁当前实例，重建新实例
        if (this.data.icon === '../../images/pause.svg') { // 切换的歌曲一定处于播放状态
          this.setData({
            icon: '../../images/play.svg'
          })
        }
        clearInterval(timer)
        this.destroy(innerAudioContext)
      }
      innerAudioContext = wx.createInnerAudioContext() // 非全局对象,须写入data中
      innerAudioContext.src = this.data.url
      // innerAudioContext.volume = 1
      if (e === 'play' || e === 'destroy') {
        innerAudioContext.play()  
      }
      innerAudioContext.onPlay(()=> { // 监听播放
        if (this.data.preTime >= this.data.allTime) {
          clearInterval(timer)
          this.destroy(innerAudioContext)
          this.init('play') // 创建新实例，并调用play()
        } else {
          this.changeProgress() 
        }
      })
      innerAudioContext.onPause(() => { // 监听暂停
        clearInterval(timer)
      })
      innerAudioContext.onEnded(() => { // 监听播放结束
        clearInterval(timer)
        this.setData({
          icon: '../../images/pause.svg'
        })
      })
      // innerAudioContext.onSeeking(() => {
      //   console.log('seeking')
      // })
    },
    changeProgress: function () { // 左侧变化的时间
      timer = setInterval(() => {
        var currentTime = Math.floor(innerAudioContext.currentTime)
        var curTime = this.getCurrentTime(currentTime)
        if (curTime > this.data.totalTime) {
          curTime = this.data.totalTime
        }
        var value = Math.ceil((100 / this.data.allTime) * currentTime)
        if (currentTime + 1 >= this.data.preTime && currentTime - this.data.preTime <= 1) {
          this.setData({
            sliderValue: value,
            curTime: curTime,
            preTime: currentTime
          })
        }
      }, 200)
    },
    changeTime: function (e) { // 快进或后退
      clearInterval(timer)
      var value = e.detail.value
      var time = Math.ceil(value / 100 * this.data.allTime)
      innerAudioContext.seek(time)
      var curTime = this.getCurrentTime(time)
      this.setData({
        sliderValue: value,
        curTime: curTime,
        preTime: time
      }, () => {
        if (this.data.icon === '../../images/play.svg') { // 当前处于播放状态
          this.changeProgress()
        }
      })
    },
    changing: function (e) {
      clearInterval(timer)
      if (changingTimer) {
        clearTimeout(changingTimer)
      }
      changingTimer = setTimeout(() => { // 节流，否则滑动滑块时会产生剧烈的抖动
        var value = e.detail.value
        var time = Math.ceil(value / 100 * this.data.allTime)
        var curTime = this.getCurrentTime(time)
        this.setData({
          sliderValue: value,
          curTime: curTime,
          preTime: time
        })
      }, 60)
    },
    changeIcon: function () { // 切换图标，控制music的播放和暂停
      if (this.data.icon === '../../images/pause.svg') {
        this.setData({
          icon: '../../images/play.svg'
        })
        innerAudioContext.play()
      } else {
        this.setData({
          icon : '../../images/pause.svg'
        })
        innerAudioContext.pause()
      }
    },
    getCurrentTime: function (currentTime) {
      var m = this.formatTime(parseInt(currentTime / 60))
      var s = this.formatTime(parseInt(currentTime % 60))
      var curTime = m +':' + s
      return curTime
    },
    formatTime: function (time) {
      return time < 10 ? '0' + time : '' + time
    },
    touchStart: function (e) {
      var value = e.target.dataset.value
      this.setData({
        popValue: value
      })
    },
    touchEnd: function (e) {
      this.setData({
        popValue:''
      })
    },
    destroy: function (e) { // 终止计时器并销毁当前实例
      clearInterval(timer)
      e.offPause()
      e.offEnded()
      e.offPlay()
      e.destroy() 
    },
    playPrev: function () { // 播放上一首
      var index = this.getCurrentIndex()
      var length = this.data.songsList.length
      index = index - 1 < 0 ? length - 1 : index - 1
      this.run(index)
    },
    playNext: function () { // 播放下一首
      var index = this.getCurrentIndex()
      var length = this.data.songsList.length
      index = index + 1 > length - 1 ? 0 : index + 1
      this.run(index)
    },
    getCurrentIndex: function () { // 获取当前播放歌曲的索引值
      var index = this.data.order - 1
      return index
    },
    run: function (index) { // 播放当前歌曲
      var data = this.data.songsList[index]
      this.setData({
        singer: data.singer,
        allTime: data.allTime,
        totalTime: data.totalTime,
        name: data.name,
        url: data.url,
        order: data.order
      }, () => {
        this.init('destroy')
      })
    },
    changeLoopMode: function () {
      this.setData({
        isSingleLoop: !this.data.isSingleLoop
      })
    }
  } 
})
