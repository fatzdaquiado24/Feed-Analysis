import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

Vue.use(Router)

const clientRoutes = [
  {
    path: '/client/login',
    name: 'ClientLogin',
    component: () => import('./views/ClientLogin.vue'),
    meta: {
      requires: [null]
    }
  },
  {
    path: '/client/register',
    name: 'ClientRegister',
    component: () => import('./views/ClientRegister.vue'),
    meta: {
      requires: [null]
    }
  },
  {
    path: '/client',
    redirect: { name: 'ClientLaboratoryAnalysis' },
    component: () => import('./views/Dashboard.vue'),
    children: [
      {
        path: 'laboratory-analysis',
        name: 'ClientLaboratoryAnalysis',
        component: () => import('./views/ClientLaboratoryAnalysis.vue'),
        meta: {
          requires: ['client']
        }
      },
    ]
  }
]

const adminRoutes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('./views/AdminLogin.vue'),
    meta: {
      requires: [null]
    }
  },
  {
    path: '/admin',
    redirect: { name: 'HeadManagerClients' },
    component: () => import('./views/Dashboard.vue'),
    children: [
      {
        path: 'clients',
        name: 'HeadManagerClients',
        component: () => import('./views/HeadManagerClients.vue'),
        meta: {
          requires: ['head manager']
        }
      },
      {
        path: 'receivers',
        name: 'HeadManagerReceivers',
        component: () => import('./views/HeadManagerReceivers.vue'),
        meta: {
          requires: ['head manager']
        }
      },
      {
        path: 'chemists',
        name: 'HeadManagerChemists',
        component: () => import('./views/HeadManagerChemists.vue'),
        meta: {
          requires: ['head manager']
        }
      },
      {
        path: 'appointment-dates',
        name: 'HeadManagerAppointmentDates',
        component: () => import('./views/HeadManagerAppointmentDates.vue'),
        meta: {
          requires: ['head manager']
        }
      },
      {
        path: 'chemical-tests',
        name: 'HeadManagerChemicalTests',
        component: () => import('./views/HeadManagerChemicalTests.vue'),
        meta: {
          requires: ['head manager']
        }
      },
    ]
  }
]

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
    },
    ...clientRoutes,
    ...adminRoutes
  ]
})

router.beforeEach((to, from, next) => {
  if('requires' in to.meta) {
    if(to.meta.requires.includes(store.getters.loginType)) {
      next()
    } else {
      if(to.meta.requires.includes('client')) {
        next({ name: 'ClientLogin' })
      } else if(to.meta.requires.includes('head manager')) {
        next({ name: 'AdminLogin' })
      } else if(to.meta.requires.includes(null)) {
        if(store.getters.loginType == 'client') {
          next({ name: 'ClientLaboratoryAnalysis' })
        } else if(store.getters.loginType == 'head manager') {
          next({ name: 'HeadManagerClients' })
        } 
      }
    }
  } else {
    if(to.matched.length > 0) {
      next()
    } else {
      next({ name: 'Home' })
    }
  }
})

export default router