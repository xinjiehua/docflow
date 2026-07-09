import { saveAs } from 'file-saver'
import JSZip from 'jszip'

export function downloadBlob(blob: Blob, fileName: string) {
  saveAs(blob, fileName)
}

export function downloadUint8Array(data: Uint8Array, fileName: string, mimeType: string = 'application/pdf') {
  const blob = new Blob([data], { type: mimeType })
  downloadBlob(blob, fileName)
}

export async function downloadAsZip(
  files: { data: Uint8Array; name: string }[],
  zipName: string
) {
  const zip = new JSZip()
  for (const file of files) {
    zip.file(file.name, file.data)
  }
  const content = await zip.generateAsync({ type: 'blob' })
  downloadBlob(content, zipName)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}
