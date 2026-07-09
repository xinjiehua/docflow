import { useState, useRef, useEffect, useCallback } from 'react'
import { Table as TableIcon, Download, Plus, Trash2, FileSpreadsheet, Undo, Redo, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

interface CellData {
  value: string
}

type SheetData = CellData[][]

interface Sheet {
  name: string
  data: SheetData
}

const DEFAULT_ROWS = 20
const DEFAULT_COLS = 10
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function colName(idx: number): string {
  let name = ''
  let i = idx
  while (i >= 0) {
    name = ALPHABET[i % 26] + name
    i = Math.floor(i / 26) - 1
  }
  return name
}

function createEmptySheet(rows: number, cols: number): SheetData {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ value: '' }))
  )
}

export default function OnlineSpreadsheet() {
  const { isPro, checkUsage } = useUserStore()
  const { used, limit } = useUsageStore()
  const [sheets, setSheets] = useState<Sheet[]>([
    { name: 'Sheet1', data: createEmptySheet(DEFAULT_ROWS, DEFAULT_COLS) }
  ])
  const [activeSheet, setActiveSheet] = useState(0)
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editing, setEditing] = useState(false)
  const [history, setHistory] = useState<SheetData[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const tableRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentSheet = sheets[activeSheet]
  const currentData = currentSheet?.data || []

  const pushHistory = useCallback((data: SheetData) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(data.map(row => row.map(cell => ({ ...cell }))))
      return newHistory.slice(-50) // Keep last 50 states
    })
    setHistoryIndex((prev) => Math.min(prev + 1, 49))
  }, [historyIndex])

  const handleUndo = () => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    const prevData = history[newIndex]
    if (prevData) {
      setSheets((prev) => {
        const newSheets = [...prev]
        newSheets[activeSheet] = { ...newSheets[activeSheet], data: prevData.map(row => row.map(cell => ({ ...cell }))) }
        return newSheets
      })
    }
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    const nextData = history[newIndex]
    if (nextData) {
      setSheets((prev) => {
        const newSheets = [...prev]
        newSheets[activeSheet] = { ...newSheets[activeSheet], data: nextData.map(row => row.map(cell => ({ ...cell }))) }
        return newSheets
      })
    }
  }

  const handleCellClick = (r: number, c: number) => {
    if (editing && selectedCell) {
      saveCell()
    }
    setSelectedCell({ r, c })
    setEditValue(currentData[r]?.[c]?.value || '')
    setEditing(false)
  }

  const handleCellDoubleClick = (r: number, c: number) => {
    setSelectedCell({ r, c })
    setEditValue(currentData[r]?.[c]?.value || '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const saveCell = () => {
    if (!selectedCell || !editing) return
    const { r, c } = selectedCell
    setSheets((prev) => {
      const newSheets = [...prev]
      const newData = newSheets[activeSheet].data.map(row => row.map(cell => ({ ...cell })))
      if (newData[r] && newData[r][c]) {
        newData[r][c].value = editValue
      }
      pushHistory(newSheets[activeSheet].data)
      newSheets[activeSheet] = { ...newSheets[activeSheet], data: newData }
      return newSheets
    })
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return
    const { r, c } = selectedCell

    if (editing) {
      if (e.key === 'Enter') {
        e.preventDefault()
        saveCell()
        setSelectedCell({ r: Math.min(r + 1, currentData.length - 1), c })
      } else if (e.key === 'Tab') {
        e.preventDefault()
        saveCell()
        const maxCol = (currentData[0]?.length || 1) - 1
        if (c >= maxCol) {
          setSelectedCell({ r: Math.min(r + 1, currentData.length - 1), c: 0 })
        } else {
          setSelectedCell({ r, c: c + 1 })
        }
      } else if (e.key === 'Escape') {
        setEditing(false)
        setEditValue(currentData[r]?.[c]?.value || '')
      }
    } else {
      if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault()
        setEditing(true)
        setTimeout(() => inputRef.current?.focus(), 0)
      } else if (e.key === 'Tab') {
        e.preventDefault()
        const maxCol = (currentData[0]?.length || 1) - 1
        if (c >= maxCol) {
          setSelectedCell({ r: Math.min(r + 1, currentData.length - 1), c: 0 })
        } else {
          setSelectedCell({ r, c: c + 1 })
        }
      } else if (e.key === 'ArrowUp' && r > 0) {
        setSelectedCell({ r: r - 1, c })
      } else if (e.key === 'ArrowDown') {
        setSelectedCell({ r: Math.min(r + 1, currentData.length - 1), c })
      } else if (e.key === 'ArrowLeft' && c > 0) {
        setSelectedCell({ r, c: c - 1 })
      } else if (e.key === 'ArrowRight') {
        const maxCol = (currentData[0]?.length || 1) - 1
        if (c < maxCol) setSelectedCell({ r, c: c + 1 })
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        setSheets((prev) => {
          const newSheets = [...prev]
          const newData = newSheets[activeSheet].data.map(row => row.map(cell => ({ ...cell })))
          if (newData[r] && newData[r][c]) {
            newData[r][c].value = ''
          }
          newSheets[activeSheet] = { ...newSheets[activeSheet], data: newData }
          return newSheets
        })
        setEditValue('')
      }
    }
  }

  const addRow = () => {
    if (!checkUsage()) return
    setSheets((prev) => {
      const newSheets = [...prev]
      const cols = newSheets[activeSheet].data[0]?.length || DEFAULT_COLS
      const newData = [...newSheets[activeSheet].data, Array.from({ length: cols }, () => ({ value: '' }))]
      pushHistory(newSheets[activeSheet].data)
      newSheets[activeSheet] = { ...newSheets[activeSheet], data: newData }
      return newSheets
    })
  }

  const addColumn = () => {
    if (!checkUsage()) return
    setSheets((prev) => {
      const newSheets = [...prev]
      const newData = newSheets[activeSheet].data.map(row => [...row, { value: '' }])
      pushHistory(newSheets[activeSheet].data)
      newSheets[activeSheet] = { ...newSheets[activeSheet], data: newData }
      return newSheets
    })
  }

  const deleteRow = () => {
    if (!selectedCell || currentData.length <= 1) return
    setSheets((prev) => {
      const newSheets = [...prev]
      const newData = newSheets[activeSheet].data.filter((_, i) => i !== selectedCell.r)
      pushHistory(newSheets[activeSheet].data)
      newSheets[activeSheet] = { ...newSheets[activeSheet], data: newData }
      return newSheets
    })
    setSelectedCell(null)
  }

  const deleteColumn = () => {
    if (!selectedCell || (currentData[0]?.length || 0) <= 1) return
    setSheets((prev) => {
      const newSheets = [...prev]
      const newData = newSheets[activeSheet].data.map(row => row.filter((_, i) => i !== selectedCell.c))
      pushHistory(newSheets[activeSheet].data)
      newSheets[activeSheet] = { ...newSheets[activeSheet], data: newData }
      return newSheets
    })
    setSelectedCell(null)
  }

  const addSheet = () => {
    const name = `Sheet${sheets.length + 1}`
    setSheets((prev) => [...prev, { name, data: createEmptySheet(DEFAULT_ROWS, DEFAULT_COLS) }])
    setActiveSheet(sheets.length)
  }

  const handleSheetNameChange = (index: number, newName: string) => {
    setSheets((prev) => {
      const newSheets = [...prev]
      newSheets[index] = { ...newSheets[index], name: newName }
      return newSheets
    })
  }

  const handleImportCsv = (files: File[]) => {
    if (!checkUsage() || files.length === 0) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = text.split('\n').filter(line => line.trim())
      const data = rows.map(row => {
        const cells = parseCsvLine(row)
        return cells.map(value => ({ value }))
      })
      setSheets((prev) => {
        const newSheets = [...prev]
        newSheets[activeSheet] = { ...newSheets[activeSheet], data }
        return newSheets
      })
    }
    reader.readAsText(file)
  }

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"'
          i++
        } else if (char === '"') {
          inQuotes = false
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          result.push(current)
          current = ''
        } else if (char === '\r') {
          // skip
        } else {
          current += char
        }
      }
    }
    result.push(current)
    return result
  }

  const handleExportCsv = () => {
    const csvContent = currentData.map(row =>
      row.map(cell => {
        const val = cell.value
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`
        }
        return val
      }).join(',')
    ).join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentSheet.name}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportHtml = () => {
    const tableHtml = `<table border="1" cellpadding="4" cellspacing="0">
<thead><tr>${currentData[0]?.map((_, i) => `<th>${colName(i)}</th>`).join('') || ''}</tr></thead>
<tbody>${currentData.map(row => `<tr>${row.map(cell => `<td>${cell.value}</td>`).join('')}</tr>`).join('')}</tbody>
</table>`

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>${currentSheet.name}</title>
<style>body{font-family:sans-serif;max-width:1200px;margin:20px auto;padding:0 20px}table{border-collapse:collapse;width:100%}th{background:#f5f5f5;font-weight:bold}td,th{border:1px solid #ddd;padding:8px;text-align:left}</style>
</head>
<body><h1>${currentSheet.name}</h1>${tableHtml}</body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentSheet.name}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Scroll selected cell into view
  useEffect(() => {
    if (selectedCell && tableRef.current) {
      const cellEl = tableRef.current.querySelector(`[data-r="${selectedCell.r}"][data-c="${selectedCell.c}"]`)
      cellEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [selectedCell])

  return (
    <ToolLayout
      title="在线表格编辑"
      description="在线创建和编辑表格，支持CSV导入导出、多Sheet、撤销重做"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="card !p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleUndo} className="btn-secondary !px-2 !py-1.5" title="撤销" disabled={historyIndex <= 0}>
              <Undo className="w-4 h-4" />
            </button>
            <button onClick={handleRedo} className="btn-secondary !px-2 !py-1.5" title="重做" disabled={historyIndex >= history.length - 1}>
              <Redo className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-navy-200 mx-1" />
            <button onClick={addRow} className="btn-secondary !px-2 !py-1.5 text-sm" title="添加行">
              <Plus className="w-4 h-4 mr-1" /> 行
            </button>
            <button onClick={addColumn} className="btn-secondary !px-2 !py-1.5 text-sm" title="添加列">
              <Plus className="w-4 h-4 mr-1" /> 列
            </button>
            <button onClick={deleteRow} className="btn-secondary !px-2 !py-1.5 text-sm text-red-600" title="删除选中行" disabled={!selectedCell}>
              <Trash2 className="w-4 h-4 mr-1" /> 行
            </button>
            <button onClick={deleteColumn} className="btn-secondary !px-2 !py-1.5 text-sm text-red-600" title="删除选中列" disabled={!selectedCell}>
              <Trash2 className="w-4 h-4 mr-1" /> 列
            </button>
            <div className="w-px h-6 bg-navy-200 mx-1" />
            <button onClick={handleExportCsv} className="btn-secondary !px-2 !py-1.5 text-sm">
              <Download className="w-4 h-4 mr-1" /> 导出 CSV
            </button>
            <button onClick={handleExportHtml} className="btn-secondary !px-2 !py-1.5 text-sm">
              <Download className="w-4 h-4 mr-1" /> 导出 HTML
            </button>
            <div className="flex-1" />
            <span className="text-xs text-navy-400">
              {currentData.length} 行 x {currentData[0]?.length || 0} 列
            </span>
          </div>
        </div>

        {/* Edit bar */}
        {selectedCell && (
          <div className="card !p-3 flex items-center gap-2">
            <span className="text-sm font-mono text-navy-500 bg-navy-50 px-2 py-1 rounded min-w-[60px] text-center">
              {colName(selectedCell.c)}{selectedCell.r + 1}
            </span>
            {editing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveCell}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    saveCell()
                    const nextR = Math.min(selectedCell.r + 1, currentData.length - 1)
                    setSelectedCell({ r: nextR, c: selectedCell.c })
                  }
                }}
                className="flex-1 input !py-1 text-sm"
                autoFocus
              />
            ) : (
              <div className="flex-1 text-sm text-navy-600 min-h-[28px] flex items-center">
                {currentData[selectedCell.r]?.[selectedCell.c]?.value || ''}
              </div>
            )}
          </div>
        )}

        {/* Spreadsheet */}
        <div className="card overflow-hidden !p-0">
          <div className="overflow-auto max-h-[500px]" ref={tableRef}>
            <table className="border-collapse min-w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-navy-100">
                  <th className="border border-navy-200 w-12 min-w-[48px] text-xs text-navy-400 bg-navy-200">#</th>
                  {currentData[0]?.map((_, c) => (
                    <th
                      key={c}
                      className={`border border-navy-200 min-w-[100px] text-xs font-medium select-none ${
                        selectedCell?.c === c ? 'bg-brand-100 text-brand-700' : 'bg-navy-100 text-navy-500'
                      }`}
                    >
                      {colName(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, r) => (
                  <tr key={r}>
                    <td className="border border-navy-200 text-xs text-navy-400 text-center bg-navy-50 select-none">
                      {r + 1}
                    </td>
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        data-r={r}
                        data-c={c}
                        onClick={() => handleCellClick(r, c)}
                        onDoubleClick={() => handleCellDoubleClick(r, c)}
                        className={`border border-navy-200 px-2 py-1 text-sm cursor-cell select-none ${
                          selectedCell?.r === r && selectedCell?.c === c
                            ? 'outline-2 outline-brand-500 outline z-10 relative'
                            : ''
                        } ${cell.value ? 'text-navy-700' : 'text-navy-300'}`}
                      >
                        {editing && selectedCell?.r === r && selectedCell?.c === c ? editValue : (cell.value || '\u00A0')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sheet tabs */}
        <div className="card !p-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {sheets.map((sheet, i) => (
              <button
                key={i}
                onClick={() => setActiveSheet(i)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  i === activeSheet
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'text-navy-500 hover:bg-navy-50'
                }`}
              >
                {sheet.name}
              </button>
            ))}
            <button
              onClick={addSheet}
              className="px-2 py-1.5 text-sm text-navy-400 hover:text-navy-600 ml-1"
              title="添加Sheet"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="flex-1" />
            <label className="flex items-center gap-2 text-sm text-navy-500 cursor-pointer">
              <FileSpreadsheet className="w-4 h-4" />
              导入 CSV
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={(e) => {
                  const files = e.target.files
                  if (files) handleImportCsv(Array.from(files))
                  e.target.value = ''
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
