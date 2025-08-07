<template>
  <div>
    <h1>mammoth-preview</h1>
    <p>mammoth：极简 HTML 转换器，适合内容提取</p>
    <p>
      与其说<span class="code-block">mammoth</span>
      是预览库，不如说它是一个“语义提取工具”。它的目标不是还原 Word
      的视觉样式，而是转换为<span class="clean-html">干净的 HTML 结构</span
      >，非常适合内容系统或富文本编辑器的输入源。
    </p>
    <p>安装方式：</p>
    <code>npm install mammoth</code>
    <div class="mammoth-preview-container">
      <div ref="previewContainer"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MammothPreview',
  data() {
    return {
      fileUrl: new URL(`@/assets/word/preview.docx`, import.meta.url).href
    }
  }
}
</script>

<style scoped lang="less">
.code-block {
  color: rgb(19, 148, 216);
  font-size: 14px;
  line-height: 1.8em;
  background-color: rgba(27, 31, 35, 0.05);
  padding: 4px;
  border-radius: 4px;
  margin-left: 4px;
}
.clean-html {
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
  border-top-style: none;
  border-bottom-style: none;
  border-left-style: none;
  border-right-style: none;
  border-top-width: 3px;
  border-bottom-width: 3px;
  border-left-width: 3px;
  border-right-width: 3px;
  border-top-color: rgba(0, 0, 0, 0.4);
  border-bottom-color: rgba(0, 0, 0, 0.4);
  border-left-color: rgba(0, 0, 0, 0.4);
  border-right-color: rgba(0, 0, 0, 0.4);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}
</style>
