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
      {
        path: 'our-office-location',
        name: 'ClientOurOfficeLocation',
        component: () => import('./views/ClientOurOfficeLocation.vue'),
        meta: {
          requires: ['client']
        }
      },
    ]
  }
]

const headManagerRoutes = [
    {
    path: '/head-manager',
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
        path: 'certificate-releasers',
        name: 'HeadManagerCertificateReleasers',
        component: () => import('./views/HeadManagerCertificateReleasers.vue'),
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

const chemistRoutes = [
  {
    path: '/chemist',
    redirect: { name: 'ChemistAnalysisRequests' },
    component: () => import('./views/Dashboard.vue'),
    children: [
      {
        path: 'analysis-requests',
        name: 'ChemistAnalysisRequests',
        component: () => import('./views/ChemistAnalysisRequests.vue'),
        meta: {
          requires: ['chemist']
        }
      },
    ]
  }
]

const receiverRoutes = [
  {
    path: '/receiver',
    redirect: { name: 'ReceiverSamplesReceiving' },
    component: () => import('./views/Dashboard.vue'),
    children: [
      {
        path: 'samples-receiving',
        name: 'ReceiverSamplesReceiving',
        component: () => import('./views/ReceiverSamplesReceiving.vue'),
        meta: {
          requires: ['receiver']
        }
      },
    ]
  }
]

const certificateReleaserRoutes = [
  {
    path: '/certificate-releaser',
    redirect: { name: 'CertificateReleaserCertificateReleasing' },
    component: () => import('./views/Dashboard.vue'),
    children: [
      {
        path: 'certificate-releasing',
        name: 'CertificateReleaserCertificateReleasing',
        component: () => import('./views/CertificateReleaserCertificateReleasing.vue'),
        meta: {
          requires: ['certificate releaser']
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
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('./views/AdminLogin.vue'),
      meta: {
        requires: [null]
      }
    },
    ...clientRoutes,
    ...headManagerRoutes,
    ...chemistRoutes,
    ...receiverRoutes,
    ...certificateReleaserRoutes
  ]
})

router.beforeEach((to, from, next) => {
  if('requires' in to.meta) {
    if(to.meta.requires.includes(store.getters.loginType)) {
      next()
    } else {
      if(to.meta.requires.includes('client')) {
        next({ name: 'ClientLogin' })
      } else if(!to.meta.requires.includes(null)) {
        next({ name: 'AdminLogin' })
      } else if(to.meta.requires.includes(null)) {
        if(store.getters.loginType == 'client') {
          next({ name: 'ClientLaboratoryAnalysis' })
        } else if(store.getters.loginType == 'head manager') {
          next({ name: 'HeadManagerClients' })
        } else if(store.getters.loginType == 'chemist') {
          next({ name: 'ChemistAnalysisRequests' })
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