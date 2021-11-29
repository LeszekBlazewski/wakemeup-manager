import colors from 'vuetify/es5/util/colors'
export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - 229 Cluster Manager',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/composition-api/module',
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    'nuxt-socket-io',
    ['@pinia/nuxt', { disableVuex: false }],
  ],

  axios: {
    baseURL: process.env.BASE_URL || 'http://mgu.localhost/api/',
  },

  publicRuntimeConfig: {
    axios: {
      baseURL: process.env.BASE_URL || 'http://mgu.localhost/api/'
    },
    io: {  // will be available in this.$config.io (client-side)
      sockets: [
        {
          default:true,
          name: 'socket',
          url: process.env.BASE_URL_SOCKET || 'http://mgu.localhost/'
        }
      ]
    }
  },
  privateRuntimeConfig: {
    io: { // will be available in this.$config.io (server-side)
      sockets: [
        {
          default:true,
          name: 'socket',
          url: process.env.BASE_URL_SOCKET || 'http://mgu.localhost/'
        }
      ]
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    parallel: true
  },

  auth: {
    redirect: {
      login: '/',
      logout: '/',
      callback: '/',
      home: '/app',
    },
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'access_token',
          required: true,
          type: 'Bearer',
        },
        user: {
          property: '',
          autoFetch: true,
        },
        endpoints: {
          login: { url: 'auth/login', method: 'post' },
          logout: false,
          refresh: { url: 'auth/refresh', method: 'post' },
          user: { url: 'auth/me', method: 'get' },
        },
      },
    },
  },

  server: {
    port: 3002,
    host: '0.0.0.0'
  },

  router: {
    middleware: ['auth']
  }
}
