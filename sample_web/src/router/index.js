import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Google',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/Google.vue'),
  },
  {
    path: '/google',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/Google.vue'),
  },
  {
    path: '/browser',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/Browser.vue'),
  },
  {
    path: '/rec',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/Record.vue'),
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
