<template>
  <div>
    <h1>mammoth-preview</h1>
    <div class="article">
      <div class="article-content">
        <p>mammoth：极简 HTML 转换器，适合内容提取</p>
        <p>
          与其说
          <code>mammoth</code>
          是预览库，不如说它是一个“语义提取工具”。它的目标不是还原 Word
          的视觉样式，而是转换为<span class="gradient-bg">干净的 HTML 结构</span
          >，非常适合内容系统或富文本编辑器的输入源。
        </p>
        <p class="special-class">
          只想获取内容做二次处理？用 <code>mammoth</code>
        </p>
      </div>
      <span class="divider"></span>
      <div class="article-content">
        <p>安装方式：</p>
        <code>npm install mammoth</code>
        <table>
          <tr>
            <th>目标场景</th>
            <th>推荐方案</th>
            <th>理由说明</th>
          </tr>
          <tr>
            <td><span class="gradient-bg">做在线预览器</span></td>
            <td>docx-preview</td>
            <td>高度还原 Word 格式，支持分页、样式、页眉页脚</td>
          </tr>
          <tr>
            <td><span class="gradient-bg">做内容管理系统</span></td>
            <td>mammoth</td>
            <td>生成结构化 HTML，利于编辑和再加工</td>
          </tr>
        </table>
      </div>
    </div>

    <div class="mammoth-preview-container">
      <div ref="previewContainer"></div>
      <div class="wangeditor">
        <Toolbar
          style="border-bottom: 1px solid #ccc"
          :editor="editor"
          :default-config="toolbarConfig"
          :mode="mode"
        />
        <Editor
          v-loading="loading"
          v-model="htmlContent"
          style="height: 500px; overflow-y: hidden"
          :default-config="editorConfig"
          :mode="mode"
          @onCreated="onEditCreated"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import mammoth from 'mammoth'

export default {
  name: 'MammothPreview',
  components: { Editor, Toolbar },
  data() {
    return {
      loading: false,
      htmlContent: '',
      editor: null,
      toolbarConfig: {
        excludeKeys: ['group-image', 'group-video'] // 排除某个菜单组--此功能需要开发
      },
      editorConfig: {
        placeholder: '请输入内容...'
      },
      mode: 'default', // or 'simple'
      fileUrl: new URL(`@/assets/word/preview.docx`, import.meta.url).href
    }
  },

  mounted() {
    this.preview()
  },
  beforeDestroy() {
    if (this.editor) this.editor.destroy()
  },
  methods: {
    onEditCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
      console.log('onCreated', this.editor.getAllMenuKeys())
    },
    async preview() {
      this.loading = true
      const response = await fetch(this.fileUrl)
      const arrayBuffer = await response.arrayBuffer()
      const options = {
        styleMap: [
          "p[style-name='Title'] => h1.title",
          // "p[style-name='代码样式'] => pre > code:fresh",
          // "p[style-name='接口代码样式'] => pre > code:fresh",
          "p[style-name='代码样式'] => div.code-block > p.code-content:fresh",
          "p[style-name='接口代码样式'] => div.code-block > p.code-content:fresh",
          "p[style-name='接口列表样式'] => ul > li"
        ],
        convertImage: mammoth.images.imgElement(function (image) {
          // 图片处理，可自定义为Blob URL
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
        includeEmbeddedStyleMap: true
      }
      const result = await mammoth.convertToHtml({ arrayBuffer }, options)
      // this.$refs.previewContainer.innerHTML = result.value
      console.log('result:', result)
      let html = result.value
      this.loading = false
      this.htmlContent = html
      // this.editor.setHtml(html)
    }
  }
}
</script>

<style lang="less">
.mammoth-preview-container {
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
  .title {
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
    margin: 0; /* 左右不留白，可按需调整 */
    flex-shrink: 0; /* 防止被压缩 */
    align-self: stretch; /* 拉伸到父容器高度 */
  }
  .article-content {
    width: 100%;
    height: 100%;
    padding: 20px;
    flex: 1;
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
  }
}
.mammoth-preview-container {
  box-sizing: border-box;
  width: 100%;
  height: 300px;
  padding: 0 20px;
  margin-top: 10px;
  overflow-y: auto;
  border: 1px solid #ccc;
}
</style>
