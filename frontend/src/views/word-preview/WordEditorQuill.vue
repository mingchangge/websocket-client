<template>
  <div>
    <h1>wordEditor-quill</h1>
    <div class="article">
      <div class="article-content">
        <p>
          <span class="gradient-bg">Quill</span>
          是一款免费、开源的所见即所得（WYSIWYG）富文本编辑器，专为现代 Web
          场景设计。它采用模块化架构，提供丰富的
          API，可以像拼积木一样按需增删功能，既能保持轻量，又具备高度可扩展性
        </p>
        <p>
          安装方式：
          <code>npm install vue-quill-editor@3 quill-delta --save</code>
        </p>
        <div class="introduce">
          <h2>常用进阶玩法:</h2>
          <ul>
            <li>
              自定义 Blot：扩展新的行内或块级格式（如提及 @用户、公式、3D 模型）
            </li>
            <li>协同编辑：搭配 Yjs + WebRTC 实现 Google Docs 级别的实时协作</li>
            <li>
              服务端渲染：利用 Quill Delta（JSON 格式）在 Node 端生成静态
              HTML，提升 SEO
            </li>
            <li>
              移动端体验：利用 bubble 主题 +
              自定义工具栏，实现在手机上的轻量编辑
            </li>
          </ul>
        </div>
        <p>
          总结：<span class="gradient-bg"
            >当前安装的 Quill 的文档模型是「 可嵌套行内 blot 的块 blot
            」，</span
          ><span class="special-class2"
            >行级 blot（bold、link …）可以层层嵌套；块级 blot
            绝不允许再包含另一个块 blot。</span
          >
        </p>
      </div>
      <span class="divider"></span>
      <div class="article-content">
        <div class="introduce">
          <h2>核心特性:</h2>
          <ol>
            <li>
              模块化与可定制
              <ul>
                <li>
                  工具栏、剪贴板、历史记录、键盘快捷键等均以模块形式存在，可按需加载。
                </li>
                <li>
                  支持自定义主题、格式、按钮和快捷键，满足品牌或业务个性化需求
                  。
                </li>
              </ul>
            </li>
            <li>
              API 驱动
              <ul>
                <li>提供丰富的 API，方便开发者自定义功能和扩展</li>
                <li>支持事件监听和回调，实现与其他组件的交互</li>
              </ul>
            </li>
            <li>
              跨平台一致性
              <ul>
                <li>
                  在 Web、桌面端（如 Electron）和移动端（如 React
                  Native）等平台上运行一致
                </li>
                <li>支持自定义渲染器，可根据需求定制显示效果</li>
              </ul>
            </li>
            <li>
              场景丰富
              <ul>
                <li>支持 Web 场景设计，如在线文档编辑、博客写作等</li>
                <li>支持桌面端场景设计，如 Office 插件、本地应用等</li>
                <li>支持移动端场景设计，如 React Native 应用、移动端网站等</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <div class="editor-wrapper">
      <div class="quill-toolbar">
        <quill-editor
          v-loading="loading"
          v-model="editorContent"
          ref="quill"
          :options="quillOptions"
          @ready="onEditorReady"
        ></quill-editor>
      </div>
    </div>
  </div>
</template>

<script>
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import mammoth from 'mammoth'
import { HtmlProcessor } from './custom_quill' // 导入自定义内容

export default {
  name: 'WordEditorQuill',
  components: { quillEditor },
  data() {
    return {
      loading: false,
      editorContent: '',
      fileUrl: new URL(`@/assets/word/preview.docx`, import.meta.url).href,
      error: '',
      quill: null,
      // Quill 配置
      quillOptions: {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }], // 确保标题选项完整
            ['bold', 'italic', 'underline', 'strike'], // 切换按钮
            [{ size: ['small', false, 'large', 'huge'] }],
            ['blockquote', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ color: [] }, { background: [] }], // 主题默认下拉，使用主题提供的值
            [{ font: [] }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean'] // 清除格式
          ],
          clipboard: true
        }
      }
    }
  },

  methods: {
    onEditorReady(editor) {
      this.quill = editor
      this.edit()
    },
    handleContentChange() {
      console.log('编辑器内容：', this.editorContent)
    },
    async edit() {
      try {
        const { value: html } = await this.renderWord()
        const processedHtml = HtmlProcessor.convertForQuill(html)
        this.loading = false

        if (this.quill) {
          // 先清空内容
          this.quill.setText('')

          // 确保标题正确保留的关键：使用原生API插入HTML
          this.quill.clipboard.dangerouslyPasteHTML(0, processedHtml)
        }
      } catch (error) {
        console.error('编辑失败:', error)
        this.loading = false
      }
    },
    async renderWord() {
      this.loading = true
      try {
        const response = await fetch(this.fileUrl)
        const arrayBuffer = await response.arrayBuffer()
        const options = {
          styleMap: [
            // 确保标题正确映射到h1标签
            "p[style-name='Title'] => h1.titleStyle",
            "p[style-name='Heading 1'] => h1",
            "p[style-name='Heading 2'] => h2",
            "p[style-name='Heading 3'] => h3",
            // 代码块样式
            "p[style-name='代码样式'] => div.code-block > p.code-content:fresh",
            "p[style-name='接口代码样式'] => div.code-block > p.code-content:fresh",
            // 列表样式
            "p[style-name='接口列表样式'] => ul:fresh > li[style]:fresh",
            "p[style-name='接口二级列表样式'] => ul:fresh > li[style]:fresh",
            // 文本样式
            "r[style-name='Strong'] => strong",
            // 保留段落样式
            'p => p[style]'
          ].join('\n'),
          transformDocument: mammoth.transforms.paragraph(
            this.transformElement
          ),
          convertImage: mammoth.images.imgElement(function (image) {
            return image.readAsArrayBuffer().then(function (arrayBuffer) {
              const blob = new Blob([arrayBuffer], {
                type: image.type || 'image/png'
              })
              return {
                src: URL.createObjectURL(blob),
                alt: image.altText
              }
            })
          }),
          includeEmbeddedStyleMap: true,
          includeDefaultStyleMap: true
        }

        const result = await mammoth.convertToHtml({ arrayBuffer }, options)
        return result
      } catch (error) {
        console.error('Word渲染失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    transformElement(element) {
      if (element.type === 'paragraph') {
        const style = []
        const spacing = element.spacing
        if (spacing && spacing.after)
          style.push(`margin-bottom:${spacing.after}pt`)
        if (element.alignment) style.push(`text-align:${element.alignment}`)

        return {
          ...element,
          style: style.join(';')
        }
      }
      return element
    }
  }
}
</script>

<style lang="less">
.editor-wrapper {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  li,
  p {
    text-align: left;
  }
  .titleStyle {
    font-size: 3.4em;
    margin: 20px 0;
    color: rgb(0, 0, 0);
    line-height: 1.5em;
  }
  pre,
  .code-block {
    padding: 10px;
    background-color: #f4f4f4;
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow-x: auto;
    code,
    .code-content {
      font-family: 'Operator Mono', Consolas, Monaco, Menlo, monospace;
      font-size: 14px;
      color: rgb(14, 138, 235);
      line-height: 1.8em;
      letter-spacing: 0em;
      padding-left: 20px;
      &:first-of-type,
      &:last-of-type {
        padding-left: 0;
      }
    }
  }
}
</style>

<style scoped lang="less">
h1 {
  margin: 20px 0;
}
.article {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  .divider {
    width: 1px;
    background: #ccc;
    margin: 0;
    flex-shrink: 0;
    align-self: stretch;
  }
  .article-content {
    width: 100%;
    height: 100%;
    padding: 20px;
    flex: 1;
    text-align: left;
    h2 {
      font-size: 18px;
      color: rgb(19, 92, 224);
      line-height: 1.5em;
    }
    .warning {
      color: rgb(19, 92, 224);
    }
    .gradient-bg {
      padding: 4px;
      margin: 0 2px;
      color: rgb(255, 255, 255);
      font-family: Optima, 'Microsoft YaHei', PingFang SC, 'Hiragino Sans GB',
        'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif;
      font-weight: 700;
      background-image: linear-gradient(
          90deg,
          rgba(50, 153, 210, 0.7) 0%,
          rgba(239, 189, 181, 0.7) 97.3%
        ),
        none;
      border: 3px none rgba(0, 0, 0, 0.4);
      border-radius: 4px;
    }
    .special-class {
      color: rgb(19, 92, 224);
      font-weight: bold;
    }
    .special-class2 {
      color: red;
      font-weight: bold;
    }
    code {
      box-sizing: border-box;
      font-family: 'Operator Mono', Consolas, Monaco, Menlo, monospace;
      font-size: 14px;
      color: rgb(14, 138, 235);
      line-height: 1.8em;
      letter-spacing: 0em;
      background: none 0% 0% / auto no-repeat scroll padding-box border-box
        rgba(27, 31, 35, 0.05);
      width: auto;
      margin: 0px 2px;
      padding: 2px 4px;
      border-style: none;
      border-width: 3px;
      border-color: rgb(0, 0, 0) rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.4);
      border-radius: 4px;
      overflow-wrap: break-word;
      word-break: break-all;
    }
    table {
      margin: 10px auto;
      font-family: Optima, 'Microsoft YaHei', PingFangSC-regular, serif;
      font-size: 16px;
      color: rgb(0, 0, 0);
      line-height: 1.5em;
      word-spacing: 0em;
      letter-spacing: 0em;
      word-break: break-word;
      overflow-wrap: break-word;
      border: 1px solid #ddd;
      border-spacing: 0;
      text-align: left;
      visibility: visible;
      tr {
        &:nth-of-type(odd) {
          background-color: rgb(248, 248, 248);
        }
        th,
        td {
          min-width: 130px;
          padding: 5px 10px;
          border: none;
          border-right: 1px solid #ddd;
          border-top: 1px solid #ddd;
          border-radius: 0px;
          &:last-child {
            border-right: none;
          }
        }
        th {
          color: rgb(0, 0, 0);
          font-size: 16px;
          line-height: 1.5em;
          letter-spacing: 0em;
          text-align: left;
          font-weight: bold;
          border-top: none;
          background: none 0% 0% / auto no-repeat scroll padding-box border-box
            rgb(212, 241, 255);
        }
      }
    }
    .introduce {
      text-align: left;
    }
  }
}
.editor-wrapper {
  border: 1px solid #ccc;
  border-radius: 2px;
  height: 500px;
  text-align: left;
  overflow: hidden;
  margin-top: 20px;
}
.quill-toolbar {
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
/* 工具栏固定在顶部 */
::v-deep .ql-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #e5e7eb !important;
  &.ql-snow {
    border: none;
  }
}

/* 内容区域可滚动 */
::v-deep .ql-container {
  flex: 1;
  height: auto !important;
  overflow-y: auto;
  &.ql-snow {
    border: none;
  }
}
</style>
