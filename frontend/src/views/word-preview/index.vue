<template>
  <div>
    <h1>Word Preview</h1>
    <section>
      <h2>docx-preview</h2>
      <p>像素级还原，真·预览利器</p>
      <p>
        如果你正在开发一个在线文档预览器，或者希望用户可以在 Web 页面中“像在
        Word 里一样看文档”，那 docx-preview 就是你要找的神兵利器。
      </p>
      <code>npm install docx-preview</code>
      <div class="docx-preview-container">
        <DocxPreview :fileUrl="fileUrl" />
      </div>
    </section>
  </div>
</template>

<script>
import DocxPreview from '@/views/word-preview/DocxPreview.vue'

export default {
  name: 'WordPreview',
  components: {
    DocxPreview
  },
  data() {
    return {
      fileUrl: new URL(`@/assets/word/preview.docx`, import.meta.url).href
    }
  }
}
</script>

<style scoped lang="less">
.docx-preview-container {
  box-sizing: border-box;
  width: 100%;
  height: 600px;
  padding: 10px;
  overflow-y: auto;
  border: 1px solid #ccc;
}
</style>
