<template>
  <div>
    <h1>docx-preview</h1>
    <div class="article">
      <div class="article-content">
        <p>像素级还原，真·预览利器</p>
        <p>
          如果你正在开发一个在线文档预览器，或者希望用户可以在 Web 页面中“像在
          Word 里一样看文档”，那<code>docx-preview</code>就是你要找的神兵利器。
        </p>
        <p>
          这个库是轻量纯前端实现，不依赖服务端转换，适合所有现代浏览器，能极大简化你的开发流程。
        </p>
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
      <span class="divider"></span>
      <div class="article-content">
        <h2>安装方式：</h2>
        <code>npm install docx-preview</code>
        <h2 class="warning">⚠️ 注意事项：</h2>
        <p>1. 对复杂文档兼容性很好，但个别嵌入元素可能显示不完整</p>
        <p>2. 大文档加载时间略长（毕竟是还原每一个像素）</p>
        <p class="special-class">
          追求“所见即所得”？选 <code>docx-preview</code> 模式
        </p>
      </div>
    </div>

    <div class="docx-preview-container">
      <div ref="previewContainer"></div>
    </div>
  </div>
</template>

<script>
import { renderAsync } from 'docx-preview'

export default {
  name: 'DocxPreview',
  data() {
    return {
      fileUrl: new URL(`@/assets/word/preview2.docx`, import.meta.url).href
    }
  },
  mounted() {
    this.renderDocx()
  },
  methods: {
    async renderDocx() {
      if (!this.fileUrl) {
        return this.$message.error('请检查文件路径，文件不存在')
      }
      try {
        const docxFile = await fetch(this.fileUrl)
        const arrayBuffer = await docxFile.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        renderAsync(uint8Array, this.$refs.previewContainer, null, {
          breakPages: true, // 分页展示
          renderHeaders: true, // 页眉
          renderFooters: true, // 页脚
          //   className: 'docx-viewer',
          useBase64URL: false // 资源处理方式
        })
      } catch (error) {
        this.$message.error('文件加载失败')
        console.error('文件加载失败', error)
      }
    }
  }
}
</script>

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
      margin: 0 auto 10px;
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
.docx-preview-container {
  box-sizing: border-box;
  width: 100%;
  height: 300px;
  padding: 0;
  margin-top: 10px;
  overflow-y: auto;
  border: 1px solid #ccc;
}
::v-deep .docx-wrapper {
  background: white;
  padding: 20px 0;
  & > section.docx {
    width: 90% !important;
    padding: 0rem !important;
    min-height: auto !important;
    box-shadow: none;
    margin: 0 auto;
  }
}
</style>
