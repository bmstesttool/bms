import Vue from 'vue';
import VueRouter from 'vue-router';

// const Container = () => import('@/views/Container.vue');
const Home = () => import('@/views/Home.vue');
const Login = () => import('@/views/Login.vue');

// const Edit = () => import('@/views/Edit.vue');
// const Test = () => import('@/views/Test.vue');
// const History = () => import('@/views/History.vue');

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    // redirect: '/edit',
    component: Home,
    // children: [
    //   { path: '/edit', component: Edit },
    //   { path: '/test', component: Test },
    //   { path: '/history', component: History },
    // ],
    // beforeEnter: (to, from, next) => {
    //   const username = sessionStorage.getItem('username');
    //   if (!username) {
    //     next({ path: '/login' });
    //   } else {
    //     next();
    //   }
    // },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    beforeEnter: (to, from, next) => {
      const username = sessionStorage.getItem('username');
      if (username) {
        next({ path: '/' });
      } else {
        next();
      }
    },
  },
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
});

export default router;
