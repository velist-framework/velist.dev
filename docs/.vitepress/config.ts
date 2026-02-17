import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

export default withMermaid({
  title: 'Velist',
  description: 'Features-first fullstack framework',
  ignoreDeadLinks: true,
  
  markdown: {
    config(md) {
      md.use(tabsMarkdownPlugin)
    }
  },
  
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
            { text: 'Project Structure', link: '/guide/structure' }
          ]
        },
        {
          text: 'Building Features',
          items: [
            { text: 'Creating Features', link: '/guide/creating-features' },
            { text: 'Complete CRUD Example', link: '/examples/crud' }
          ]
        },
        {
          text: 'Fundamentals',
          items: [
            { text: 'Routing', link: '/guide/routing' },
            { text: 'Database', link: '/guide/database' },
            { text: 'Storage', link: '/guide/storage' },
            { text: 'Authentication', link: '/guide/authentication' },
            { text: 'Google OAuth', link: '/guide/google-auth' },
            { text: 'Forms', link: '/guide/forms' },
            { text: 'Testing', link: '/guide/testing' }
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
            { text: 'Complete CRUD', link: '/examples/crud' },
            { text: 'Authentication', link: '/examples/auth' },
            { text: 'File Upload', link: '/examples/file-upload' },
            { text: 'Real-time', link: '/examples/realtime' }
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
  ],
  
  // Mermaid configuration
  mermaid: {
    theme: 'dark',
    themeVariables: {
      primaryColor: '#6366F1',
      primaryTextColor: '#fff',
      primaryBorderColor: '#4F46E5',
      lineColor: '#6366F1',
      secondaryColor: '#14B8A6',
      tertiaryColor: '#fff'
    }
  }
})
