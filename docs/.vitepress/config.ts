import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Velist',
  description: 'Features-first fullstack framework',
  ignoreDeadLinks: true,
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Reference', link: '/reference/' },
      { text: 'Examples', link: '/examples/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'AI Development',
          items: [
            { text: 'Workflow Overview', link: '/guide/workflow' },
            { text: 'Agent Reference', link: '/guide/agents' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Vertical Slicing', link: '/guide/vertical-slicing' },
            { text: 'Project Structure', link: '/guide/structure' },
            { text: 'Creating Features', link: '/guide/creating-features' }
          ]
        },
        {
          text: 'Fundamentals',
          items: [
            { text: 'Routing', link: '/guide/routing' },
            { text: 'Database', link: '/guide/database' },
            { text: 'Authentication', link: '/guide/authentication' },
            { text: 'Forms', link: '/guide/forms' }
          ]
        },
        {
          text: 'Deployment',
          items: [
            { text: 'Production Build', link: '/guide/production' },
            { text: 'Docker', link: '/guide/docker' }
          ]
        }
      ],
      
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'CLI Commands', link: '/reference/cli' },
            { text: 'Configuration', link: '/reference/config' },
            { text: 'TypeScript Types', link: '/reference/types' },
            { text: 'Brand Guidelines', link: '/reference/branding' }
          ]
        }
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Complete CRUD', link: '/examples/crud' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/velist-framework/velist' },
      { icon: 'discord', link: 'https://discord.gg/velistdev' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Velist Framework'
    },
    
    search: {
      provider: 'local'
    }
  },
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#6366F1' }]
  ]
})
