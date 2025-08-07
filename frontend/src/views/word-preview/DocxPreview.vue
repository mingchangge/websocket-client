<template>
  <div>
    <div ref="previewContainer"></div>
  </div>
</template>

<script>
import { renderAsync } from 'docx-preview'

export default {
  name: 'DocxPreview',
  props: {
    fileUrl: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      previewContainer: null
    }
  },
  async mounted() {
    const docxFile = await fetch(this.fileUrl)
    const arrayBuffer = await docxFile.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    renderAsync(uint8Array, this.$refs.previewContainer)
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

<style scoped lang="less"></style>
