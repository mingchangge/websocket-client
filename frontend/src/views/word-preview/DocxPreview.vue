<template>
  <div>
    <h1>docx-preview</h1>
    <p>像素级还原，真·预览利器</p>
    <p>
      如果你正在开发一个在线文档预览器，或者希望用户可以在 Web 页面中“像在 Word
      里一样看文档”，那 docx-preview 就是你要找的神兵利器。
    </p>
    <p>安装方式：</p>
    <code>npm install docx-preview</code>
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
