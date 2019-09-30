var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    questions: [],
    score: {},
    statistics: {},
    currentIndex: 1,
    total: 3,
    showSubmit: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.id) {
      let id = options.id;
      this.setData({
        id: id
      });
    }
    this.getQuestions();
  },
  getQuestions: function() {
    let that = this;
    util.request(api.SkinAnserList).then(function(res) {
      console.log(res);
      if (res.code === 200) {

        let total = res.data.list.length;
        let currentQuestion = [];
        if (total > 0) {
          currentQuestion = res.data.list[0];
        }
        that.setData({
          questions: res.data.list,
          currentQuestion: currentQuestion,
          score: res.data.rules.score,
          statistics: res.data.rules.statistics,
          total: total,
        });
      }
    });

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },
  //单选
  choseOption: function(e) {
    let qid = e.currentTarget.dataset.qid;
    let aid = e.detail.value;
    let that = this;
    //设置总的数据
    let questions = this.data.questions;
    let currentQuestion = this.data.currentQuestion;
    for (var j in questions) {
      if (qid == questions[j].id) {
        let answers = questions[j].answer;
        for (var k in answers) {
          answers[k].isChoice = false;
          if (answers[k].id == aid) {
            answers[k].isChoice = true;
          }
        }
        currentQuestion = questions[j];
        break;
      }
    }

    //设置总的数据
    this.setData({
      currentQuestion: currentQuestion,
      questions: questions,
    });

    if (this.data.currentIndex == this.data.total) {
      this.setData({
        showSubmit: true,
      });
    } else {
      setTimeout(function() {
        that.change(1);
      }, 1000);
    }

  },
  changeQuestion: function(e) {
    let type = e.currentTarget.dataset.type;
    this.change(type);
  },
  change: function(type) {
    let currentIndex = this.data.currentIndex;
    let questions = this.data.questions;
    
    if (type == 0) {
      if (currentIndex <= 1) {
        return;
      }
      currentIndex = currentIndex - 1;
    }
    if (type == 1) {
      if (currentIndex >= this.data.total) {
        return;
      }
      //如果当前题目没有选择，提示选择
      let isChoice = this.checkIsChoice(questions, currentIndex);
      if (!isChoice) {
        wx.showToast({
          title: '请选择当前题目',
          duration: 1500,
        })
        return;
      }
      currentIndex = currentIndex + 1;
    }
    //获取题目
    for (var i in questions) {
      if (currentIndex - 1 == i) {
        let currentQuestion = questions[i];
        this.setData({
          currentQuestion: currentQuestion,
          currentIndex: currentIndex
        });
      }
    }
  },
  checkIsChoice: function(questions, currentIndex) {
    let isChoice = false;
    for (var i in questions) {
      if (i == currentIndex - 1) {
        let answers = questions[i].answer;
        for (var j in answers) {
          if (answers[j].isChoice == true) {
            isChoice = true;
          }
        }
        continue;
      }
    }
    return isChoice;
  },
  getScore: function(option) {
    let score = this.data.score;
    switch (option) {
      case 'A':
        return score.A;
        break;
      case 'B':
        return score.B;
        break;
      case 'C':
        return score.C;
        break;
      case 'D':
        return score.D;
        break;
      case 'E':
        return score.E;
        break;
      case 'X':
        return score.X;
        break;
      default:
        return 0;
    }
  },
  statistics: function(total_score) {
    let statistics = this.data.statistics;
    for (var i in statistics) {
      if (statistics[i].min <= total_score && statistics[i].max >= total_score) {
        return statistics[i].value;
      }
    }
    return '';
  },
  handleSubmitOpen: function() {

    let that = this;
    let total_score = 0;
    //计算总分值
    let questions = this.data.questions;
    for (var i in questions) {
      let answers = questions[i].answer;
      for (var j in answers) {
        if (answers[j].isChoice == true) {
          total_score += Number(this.getScore(answers[j].option));
        }
      }
    }
    //得到结果
    let sensitive = this.statistics(total_score);
    wx.setStorageSync('sensitive', sensitive)
    wx.setStorageSync('answer_back', 1);
    wx.navigateBack({
      delta: 1
    })
  }
})