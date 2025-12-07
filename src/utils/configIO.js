import { getFile, setFile } from './fileCache'

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function exportConfig(state) {
  const {
    shortcuts,
    dockItems,
    bgConfig,
    gridConfig,
    dockConfig,
    searchConfig,
    clockConfig,
    uiConfig,
    layoutConfig,
    simpleConfig,
    nekoConfig,
    pageTitle,
    todos,
    focusMode
  } = state

  async function normalizeIcon(icon) {
    if (!icon) return icon
    if (typeof icon === 'string' && icon.startsWith('data:')) return icon
    if (typeof icon === 'string' && icon.startsWith('blob:')) {
      try {
        const res = await fetch(icon)
        const blob = await res.blob()
        return await blobToBase64(blob)
      } catch (_) { return icon }
    }
    return icon
  }

  const normalizedShortcuts = await Promise.all((shortcuts || []).map(async s => ({ ...s, icon: await normalizeIcon(s.icon) })))
  const normalizedDockItems = await Promise.all((dockItems || []).map(async d => ({ ...d, iconUrl: await normalizeIcon(d.iconUrl) })))

  const exportObj = {
    shortcuts: normalizedShortcuts,
    dockItems: normalizedDockItems,
    bgConfig: { ...bgConfig },
    gridConfig,
    dockConfig,
    searchConfig,
    clockConfig,
    uiConfig,
    layoutConfig,
    simpleConfig,
    nekoConfig,
    pageTitle,
    todos,
    focusMode
  }

  if (bgConfig.customFile && bgConfig.fileKey) {
    try {
      const blob = await getFile(bgConfig.fileKey)
      if (blob) {
        exportObj.bgFileBase64 = await blobToBase64(blob)
      }
    } catch (_) {}
  }

  const json = JSON.stringify(exportObj, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const timeStr = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`

  const a = document.createElement('a')
  a.href = url
  a.download = `DokiTab-config-${timeStr}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function importConfig(data, setters) {
  const {
    setShortcuts,
    setDockItems,
    setBgConfig,
    setGridConfig,
    setDockConfig,
    setSearchConfig,
    setClockConfig,
    setUiConfig,
    setLayoutConfig,
    setSimpleConfig,
    setNekoConfig,
    setPageTitle,
    setTodos,
    setFocusMode
  } = setters

  if (data.shortcuts) setShortcuts(data.shortcuts)
  if (data.dockItems) setDockItems(data.dockItems)

  if (data.bgFileBase64) {
    const res = await fetch(data.bgFileBase64)
    const blob = await res.blob()
    const fileKey = `bg-${Date.now()}`
    await setFile(fileKey, blob)
    const url = URL.createObjectURL(blob)
    setBgConfig({ type: data.bgConfig?.type || 'image', url, blur: data.bgConfig?.blur || 0, overlayOpacity: data.bgConfig?.overlayOpacity || 20, customFile: true, fileKey })
  } else if (data.bgConfig) {
    setBgConfig({ ...data.bgConfig })
  }

  if (data.gridConfig) setGridConfig(data.gridConfig)
  if (data.dockConfig) setDockConfig(data.dockConfig)
  if (data.searchConfig) setSearchConfig(data.searchConfig)
  if (data.clockConfig) setClockConfig(data.clockConfig)
  if (data.uiConfig) setUiConfig(data.uiConfig)
  if (data.layoutConfig) setLayoutConfig(data.layoutConfig)
  if (data.simpleConfig) setSimpleConfig(data.simpleConfig)
  if (data.nekoConfig) setNekoConfig(data.nekoConfig)
  if (data.pageTitle) setPageTitle(data.pageTitle)
  if (data.todos && setTodos) setTodos(data.todos)
  if (data.focusMode !== undefined && setFocusMode) setFocusMode(data.focusMode)
}
