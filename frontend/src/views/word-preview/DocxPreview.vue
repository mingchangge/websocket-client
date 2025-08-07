<template>
  <div>
    <h1>docx-preview</h1>
    <div class="article">
      <div class="article-content">
        <p>像素级还原，真·预览利器</p>
        <p>
          如果你正在开发一个在线文档预览器，或者希望用户可以在 Web 页面中“像在
          Word 里一样看文档”，那 docx-preview 就是你要找的神兵利器。
        </p>
      </div>
      <span class="divider"></span>
      <div class="article-content">
        <h2>安装方式：</h2>
        <code>npm install docx-preview</code>
        <h2 class="warning">⚠️ 注意事项：</h2>
        <p>1. 对复杂文档兼容性很好，但个别嵌入元素可能显示不完整</p>
        <p>2. 大文档加载时间略长（毕竟是还原每一个像素）</p>
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
      fileUrl: new URL(`@/assets/word/preview.docx`, import.meta.url).href
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
    margin: 0 12px; /* 左右留白，可按需调整 */
    flex-shrink: 0; /* 防止被压缩 */
    align-self: stretch; /* 拉伸到父容器高度 */
  }
  .article-content {
    width: 100%;
    height: 100%;
    flex: 1;
    h2 {
      font-size: 18px;
      color: rgb(19, 92, 224);
      line-height: 1.5em;
    }
    .warning {
      color: rgb(19, 92, 224);
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
  padding: 0;
  & > section.docx {
    width: 90% !important;
    padding: 0rem !important;
    min-height: auto !important;
    box-shadow: none;
    margin: 0 auto;
  }
}
</style>
