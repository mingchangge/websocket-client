<template>
  <div>
    <h1>Welcome to the Home Page</h1>
    <p>This is the main content area of the application.</p>
    <PDFThumbnai :fileUrl="fileUrl" :width="400" :height="600" />
  </div>
</template>

<script>
import PDFThumbnai from '@/components/PDFThumbnai.vue'

export default {
  name: 'HomePage',
  components: {
    PDFThumbnai
  },
  data() {
    return {
      fileUrl: new URL(`@/assets/pdf/2022.pdf`, import.meta.url).href // Replace with your PDF file URL
    }
  }
}
</script>
