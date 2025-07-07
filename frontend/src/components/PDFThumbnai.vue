<template>
  <div>
    <div class="row">
      <h2>pdf预览</h2>
      <div class="col-sm-4">
        <button @click="setScal('big')">放大</button>
        <button style="margin-left: 8px" @click="setScal('small')">缩小</button>
        <p>页码：{{ `${pageNo}/${totals.length}` }}</p>
        <div class="wrapper" id="pdf-container">
          <div
            v-for="item in totals"
            :id="'page-' + item"
            :key="item"
            class="pdf-box"
          >
            <canvas :id="'canvas-pdf-' + item" class="canvas-pdf"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// npm install pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.js?url'
import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default {
  name: 'PdfThumbnail',
  props: {
    fileUrl: {
      type: String
    },
    width: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      _uid: 'canvas',
      pageNo: 1,
      totals: [],
      scale: 1
    }
  },
  mounted() {
    this.renderThumbnails()
  },
  methods: {
    async renderThumbnails(scale = this.scale) {
      const worker = new pdfjsLib.PDFWorker()
      let pdf = await pdfjsLib.getDocument({
        url: this.fileUrl,
        worker: worker
      }).promise
      const totalPage = pdf.numPages
      const idName = 'canvas-pdf-'
      this.createCanvas(totalPage)
      for (let i = 1; i <= totalPage; i++) {
        pdf.getPage(i).then(page => {
          const viewport = page.getViewport({ scale })
          const canvas = document.getElementById(idName + i)
          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width
          this.viewHeight = viewport.height
          const renderContext = { canvasContext: context, viewport }
          page.render(renderContext)
        })
      }
    },
    createCanvas(totalPages) {
      for (let i = 1; i <= totalPages; i++) {
        this.totals.push(i)
      }
    },
    setScal(type) {
      if (type === 'big') {
        this.scale += 0.2
      } else if (type === 'small') {
        this.scale -= 0.2
      }
      this.totals = []
      this.renderThumbnails()
    }
  }
}
</script>

<style></style>
