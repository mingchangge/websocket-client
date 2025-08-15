<template>
  <div class="editor-container">
    <div class="custom-wangeditor-container">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editor"
        :default-config="toolbarConfig"
        :mode="mode"
      />
      <Editor
        v-model="htmlContent"
        style="height: 400px"
        :default-config="editorConfig"
        :mode="mode"
        @onCreated="onCreated"
      />
    </div>
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

export default {
  name: 'MammothPreview',
  components: { Editor, Toolbar },
  data() {
    return {
      editor: null,
      toolbarConfig: {},
      htmlContent: '',
      editorConfig: {
        placeholder: '请输入内容...',
        htmlFilterRules: {
          ul: { allowChildren: ['li', 'ul', 'ol'] },
          ol: { allowChildren: ['li', 'ul', 'ol'] },
          li: { allowChildren: ['ul', 'ol', '#text'] }
        },
        MENU_CONF: {
          'bulleted-list': { maxLevel: 3 },
          'numbered-list': { maxLevel: 3 }
        }
      },
      mode: 'default'
    }
  },
  beforeDestroy() {
    this.editor && this.editor.destroy()
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor)
      // 直接操作DOM确保列表渲染
      setTimeout(() => {
        this.editor.setHtml(`
          <ul style='padding-left: 2em; list-style-type: disc;'>
            <li>一级列表项 1</li>
            <li>一级列表项 2
              <ul style='padding-left: 3em; list-style-type: circle;'>
                <li>二级列表项 1</li>
                <li>二级列表项 2</li>
              </ul>
            </li>
            <li>一级列表项 3</li>
          </ul>
        `)
        // 强制刷新样式
        const container = this.editor.$textContainerElem[0]
        container.style.display = 'none'
        container.offsetHeight // 触发重排
        container.style.display = 'block'
      }, 0)
    }
  }
}
</script>

<style lang="less">
.editor-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 15px;
}

.custom-wangeditor-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

/* 直接应用列表样式（非scoped样式无需::v-deep） */
.custom-wangeditor-container .w-e-text-container ul,
.custom-wangeditor-container .w-e-text-container ol {
  padding-left: 2em !important;
  list-style-type: disc !important;
  margin: 1em 0 !important;
}

.custom-wangeditor-container .w-e-text-container ul ul,
.custom-wangeditor-container .w-e-text-container ol ol {
  padding-left: 4em !important;
  list-style-type: circle !important;
  display: block !important;
  visibility: visible !important;
  overflow: visible !important;
}

.custom-wangeditor-container .w-e-text-container li {
  display: list-item !important;
  color: #000 !important;
  background: transparent !important;
}
</style>
