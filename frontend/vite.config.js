import { rmSync } from 'node:fs'
import vue from '@vitejs/plugin-vue2'
import serverProxy from './build/proxy'
import { defineConfig, loadEnv } from 'vite'
import { pathResolve, wrapperEnv } from './build/utils'
import electron from 'vite-plugin-electron/simple'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default ({ mode }) => {
  //同步删除给定路径上的文件
  rmSync('dist-electron', { recursive: true, force: true })
  const root = process.cwd()

  // 在 vite 配置文件中使用环境变量，需要通过 loadEnv 来加载
  const env = loadEnv(mode, root)
  const isDev = mode === 'dev'

  const { VITE_OUTPUT_DIR, VITE_PORT, VITE_API_URL } = wrapperEnv(env)
  const plugins = [
    vue(),
    nodePolyfills({
      globals: {
        Buffer: true
      }
    }),
    electron({
      main: {
        entry: 'electron/main.js',
        vite: {
          build: {
            minify: !isDev
          }
        }
      },
      preload: {
        input: {
          preload: 'electron/preload.js',
          spinner: 'electron/spinner.js'
        },
        vite: {
          build: {
            minify: !isDev,
            // 多个input文件需要设置为false
            // https://rollupjs.org/configuration-options/#output-inlinedynamicimports
            rollupOptions: { output: { inlineDynamicImports: false } }
          }
        }
      }
    })
  ]

  return defineConfig({
    // test: {
    //   environment: 'happy-dom',
    //   coverage: {
    //     provider: 'v8', // or 'istanbul =>npm i -D @vitest/coverage-istanbul'
    //     reporter: ['text', 'json', 'html'],
    //     // 自定义覆盖率输出目录
    //     reportsDirectory: './tests/coverage'
    //   }
    // },
    root,
    plugins,
    resolve: {
      alias: {
        '@': pathResolve('./src')
      },
      extensions: ['.js', '.vue', '.json']
    },
    server: {
      host: true,
      port: VITE_PORT,
      proxy: serverProxy(VITE_API_URL)
    },
    build: {
      assetsDir: 'static', // 静态资源的存放目录
      commonjsOptions: {
        transformMixedEsModules: true
      },
      outDir: VITE_OUTPUT_DIR,
      brotliSize: false, // 关闭 brotli 压缩大小报告，可提升构建速度
      chunkSizeWarningLimit: 2000, // chunk 大小警告的限制（以 kbs 为单位）
      rollupOptions: {
        external: ['electron']
      },
      optimizeDeps: {
        exclude: ['electron'] // 告诉 Vite 排除预构建 electron，不然会出现 __diranme is not defined
      }
    },
    clearScreen: false,
  })
}
