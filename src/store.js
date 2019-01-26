import Vue from 'vue'
import Vuex from 'vuex'
import { queryPosts, queryPost, queryHot, queryTag, queryMood, queryPage } from './utils/services'
import { formatPost, formatMood, formatPage } from './utils/format'

Vue.use(Vuex)

let tipsTimer = ''

export default new Vuex.Store({
  state: {
    tips: '',
    tipsUpdateAt: '',
    page: 0,
    pageSize: 10,
    posts: [],
    hasMore: true
  },
  mutations: {
    // 设置一言
    setTips(state, { tips, tipsUpdateAt }) {
      state.tips = tips
      state.tipsUpdateAt = tipsUpdateAt
    },
    // 设置文章列表
    setPosts(state, { posts, page }) {
      state.page = page
      state.posts = state.posts.concat(posts)
      state.hasMore = posts.length === state.pageSize
    },
    // 重置文章列表
    resetPosts(state) {
      state.page = 0
      state.posts = []
      state.hasMore = true
    }
  },
  actions: {
    // 显示一言
    async showTips({ commit }, { tips }) {
      clearTimeout(tipsTimer)
      let tipsUpdateAt = new Date()
      commit('setTips', {
        tips,
        tipsUpdateAt
      })
      tipsTimer = setTimeout(() => {
        commit('setTips', {
          tips: '',
          tipsUpdateAt: new Date()
        })
      }, 6000)
    },
    // 获取文章列表
    async queryPosts({ commit, state }) {
      const { page, pageSize, hasMore } = state
      if (!hasMore) return
      let data = await queryPosts({
        page: page + 1,
        pageSize
      })
      data.forEach(formatPost)
      data = await queryHot(data)
      commit('setPosts', { posts: data, page: page + 1 })
    },
    // 获取归档
    async queryArchive(context, { page, pageSize }) {
      let data = await queryPosts({
        page,
        pageSize
      })
      data.forEach(formatPost)
      data = await queryHot(data)
      return data
    },
    // 获取文章详情
    async queryPost({ state }, { number }) {
      // 获取本篇
      let post = state.posts.find(o => o.number === number)
      // TODO:获取前篇后篇
      if (!post) {
        post = await queryPost(number)
        post = await queryHot(post)
        post = formatPost(post)
      }
      return post
    },
    // 获取标签
    async queryTag() {
      const data = await queryTag()
      return data
    },
    // 获取心情
    async queryMood(context, { page, pageSize }) {
      let data = await queryMood({
        page,
        pageSize
      })
      data = formatMood(data)
      return data
    },
    // 获取书单 & 友链 & 关于
    async queryPage(context, { type }) {
      let data = await queryPage(type)
      data = formatPage(data, type)
      return data
    }
  }
})
