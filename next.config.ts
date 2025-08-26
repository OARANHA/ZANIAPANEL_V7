import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 🚀 Performance optimizations */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Habilitando React Strict Mode para melhor desenvolvimento
  reactStrictMode: true,
  
  // ⚡ Experimental features para melhor performance
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // 🚀 Turbopack para desenvolvimento mais rápido (nova sintaxe)
  turbopack: {
    rules: {
      '*.svg': ['@svgr/webpack'],
    },
  },
  
  // 📦 External packages for server components (Nova sintaxe Next.js 15)
  serverExternalPackages: ['prisma', '@prisma/client', 'sharp'],
  
  // 📦 Bundle pages router dependencies (Nova sintaxe Next.js 15)
  bundlePagesRouterDependencies: true,
  
  // 📦 Otimização de build
  compress: true,
  poweredByHeader: false,
  
  // 🚀 Otimizações de output
  output: 'standalone',
  
  // 📷 Otimização de imagens
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    return [
      // Dashboard page rewrites for backward compatibility
      // {
      //   source: '/login',
      //   destination: '/admin/login',
      // },
      {
        source: '/admin/agents',
        destination: '/admin/agents-page-new',
      },
      {
        source: '/agents',
        destination: '/admin/agents',
      },
      {
        source: '/specialists',
        destination: '/admin/specialists',
      },
      {
        source: '/compositions',
        destination: '/admin/compositions',
      },
      {
        source: '/studio',
        destination: '/admin/studio',
      },
      {
        source: '/learning',
        destination: '/admin/learning',
      },
      {
        source: '/executions',
        destination: '/admin/executions',
      },
      {
        source: '/admin/companies',
        destination: '/admin/admin/companies',
      },
      {
        source: '/admin/clients',
        destination: '/admin/admin/clients',
      },
      {
        source: '/admin/reports',
        destination: '/admin/admin/reports',
      },
      
      // API rewrites for backward compatibility
      {
        source: '/api/agents',
        destination: '/admin/api/agents',
      },
      {
        source: '/api/agents/:path*',
        destination: '/admin/api/agents/:path*',
      },
      {
        source: '/api/specialists',
        destination: '/admin/api/specialists',
      },
      {
        source: '/api/specialists/:path*',
        destination: '/admin/api/specialists/:path*',
      },
      {
        source: '/api/compositions',
        destination: '/admin/api/compositions',
      },
      {
        source: '/api/compositions/:path*',
        destination: '/admin/api/compositions/:path*',
      },
      {
        source: '/api/workspaces',
        destination: '/admin/api/workspaces',
      },
      {
        source: '/api/executions',
        destination: '/admin/api/executions',
      },
      {
        source: '/api/execute',
        destination: '/admin/api/execute',
      },
      {
        source: '/api/auth/login',
        destination: '/admin/api/auth/login',
      },
      {
        source: '/api/analytics',
        destination: '/admin/api/analytics',
      },
      {
        source: '/api/learning',
        destination: '/admin/api/learning',
      },
      {
        source: '/api/code-analysis',
        destination: '/admin/api/code-analysis',
      },
      {
        source: '/api/context',
        destination: '/admin/api/context',
      },
      {
        source: '/api/test-zai',
        destination: '/admin/api/test-zai',
      },
      {
        source: '/api/vscode',
        destination: '/admin/api/vscode',
      },
      {
        source: '/api/debug/:path*',
        destination: '/admin/api/debug/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: '/admin/api/admin/:path*',
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    // 🚀 Otimizações de performance
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Separar componentes pesados
          heavy: {
            test: /[\\/](MCPManager|HybridWorkflowEditor|AgentCardWithFlowiseIntegration)[\\/]/,
            name: 'heavy-components',
            priority: 20,
            chunks: 'all',
          },
        },
      },
    };
    
    if (dev) {
      // ⚙️ Configuração otimizada para desenvolvimento
      config.watchOptions = {
        aggregateTimeout: 100, // Reduzido para 100ms
        poll: 300, // Reduzido para 300ms 
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/.next/**',
          '**/coverage/**',
          '**/.vscode/**',
        ],
      };
      
      // 🚀 Desabilitar otimizações pesadas em dev para velocidade
      config.optimization.minimize = false;
      config.optimization.splitChunks = {
        chunks: 'async',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      };
    } else {
      // 📦 Otimizações para produção
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    // 🚀 Cache para acelerar builds subsequentes
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };
    
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
