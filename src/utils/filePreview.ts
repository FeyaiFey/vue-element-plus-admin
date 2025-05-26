// 文件预览工具函数 - 按需导入
import { defineAsyncComponent } from 'vue'

// 按需导入预览组件
export const VuePdfEmbed = defineAsyncComponent(() => import('vue-pdf-embed'))
export const VueOfficeDocx = defineAsyncComponent(() => import('@vue-office/docx'))
export const VueOfficeExcel = defineAsyncComponent(() => import('@vue-office/excel'))
export const VueOfficePdf = defineAsyncComponent(() => import('@vue-office/pdf'))

// Monaco Editor 按需导入
export const loadMonacoEditor = async () => {
  const monaco = await import('monaco-editor')
  return monaco
}

// 文件类型检测
export const getFileType = (file: { mime_type?: string; extension?: string }) => {
  const mimeType = file.mime_type || ''
  const extension = file.extension?.toLowerCase() || ''

  if (mimeType.startsWith('image/')) {
    return 'image'
  } else if (mimeType.startsWith('video/')) {
    return 'video'
  } else if (mimeType.startsWith('audio/')) {
    return 'audio'
  } else if (mimeType === 'application/pdf') {
    return 'pdf'
  } else if (mimeType.startsWith('text/') || ['txt', 'json', 'xml', 'csv'].includes(extension)) {
    return 'text'
  } else if (['doc', 'docx'].includes(extension) || mimeType.includes('document')) {
    return 'word'
  } else if (
    ['xls', 'xlsx'].includes(extension) ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel')
  ) {
    return 'excel'
  } else if (['ppt', 'pptx'].includes(extension) || mimeType.includes('presentation')) {
    return 'powerpoint'
  } else if (
    [
      'js',
      'ts',
      'vue',
      'html',
      'css',
      'scss',
      'less',
      'java',
      'py',
      'cpp',
      'c',
      'php',
      'go',
      'rs',
      'swift'
    ].includes(extension)
  ) {
    return 'code'
  }
  return 'unknown'
}

// 获取代码语言
export const getCodeLanguage = (extension: string) => {
  const langMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    vue: 'vue',
    html: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    java: 'java',
    py: 'python',
    cpp: 'cpp',
    c: 'c',
    php: 'php',
    go: 'go',
    rs: 'rust',
    swift: 'swift',
    json: 'json',
    xml: 'xml'
  }
  return langMap[extension] || 'plaintext'
}

// 创建Blob URL
export const createBlobUrl = (data: ArrayBuffer, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType })
  return URL.createObjectURL(blob)
}

// 文本解码
export const decodeTextData = (data: ArrayBuffer, encoding = 'utf-8') => {
  const decoder = new TextDecoder(encoding)
  return decoder.decode(data)
}
