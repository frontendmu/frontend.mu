;(() => {
  const root = document.getElementById('_debug')
  if (!root) return

  const originalXhrOpen = XMLHttpRequest.prototype.open
  const originalXhrSend = XMLHttpRequest.prototype.send
  const storageKey = 'debugbar.display-mode'
  const sessionStorageKey = 'debugbar.session-state'
  const bootRequestId = root.dataset.debugId || null
  const bootPreviousRequestId = root.dataset.debugPrevId || null

  function readPersistedState() {
    try {
      const raw = sessionStorage.getItem(sessionStorageKey)
      if (!raw) {
        return null
      }

      const parsed = JSON.parse(raw)
      const history = Array.isArray(parsed?.history)
        ? parsed.history.filter((entry) => entry?.id && entry?.snapshot)
        : []

      return {
        history,
        activeRequestId:
          typeof parsed?.activeRequestId === 'string' ? parsed.activeRequestId : null,
        collapsedQueries:
          parsed?.collapsedQueries && typeof parsed.collapsedQueries === 'object'
            ? parsed.collapsedQueries
            : {},
      }
    } catch {
      return null
    }
  }

  function persistState(nextState) {
    try {
      sessionStorage.setItem(
        sessionStorageKey,
        JSON.stringify({
          history: nextState.history.slice(0, 15),
          activeRequestId: nextState.activeRequestId,
          collapsedQueries: nextState.collapsedQueries,
        })
      )
    } catch {
      /* silent */
    }
  }

  const persistedState = readPersistedState()

  const state = window.__debugBarState || {
    activeTab: 'requests',
    data: null,
    displayMode: localStorage.getItem(storageKey) || 'dock',
    history: persistedState?.history ?? [],
    collapsedQueries: persistedState?.collapsedQueries ?? {},
    animatePanel: false,
    activeRequestId: persistedState?.activeRequestId ?? null,
    requestId: bootRequestId,
  }

  window.__debugBarState = state
  state.requestId = bootRequestId || state.requestId
  state.activeRequestId = state.activeRequestId || state.requestId || state.history[0]?.id || null
  if (!state.data && state.activeRequestId) {
    state.data = state.history.find((entry) => entry.id === state.activeRequestId)?.snapshot ?? null
  }

  /* ── Utilities ───────────────────────────────────────── */

  function esc(v) {
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function fmt(v) {
    return JSON.stringify(v, null, 2)
  }

  function hasEntries(v) {
    return Boolean(v && Object.keys(v).length)
  }

  function isDebugRequest(input) {
    const url = input instanceof Request ? input.url : String(input)
    return url.includes('/_debug/')
  }

  function createClientRequestId() {
    return window.crypto?.randomUUID?.() ?? `debug-${Date.now()}-${Math.random()}`
  }

  /* ── Status pill classifier ──────────────────────────── */

  function statusClass(code) {
    const n = parseInt(code, 10)
    if (n >= 500) return 'dbg-pill--err'
    if (n >= 400) return 'dbg-pill--warn'
    if (n >= 200 && n < 300) return 'dbg-pill--ok'
    return ''
  }

  /* ── Waterfall helpers ───────────────────────────────── */

  function scaleTicks(total) {
    return [0, 0.25, 0.5, 0.75, 1].map((r) => ({
      label: `${Math.round(total * r * 100) / 100}ms`,
      offset: r * 100,
    }))
  }

  function layoutRows(data) {
    const total = Math.max(data.requestMs || 1, 1)
    const laneEnds = []

    return (data.timeline || []).map((entry) => {
      const duration = entry.durationMs || 0
      const end = entry.startMs + Math.max(duration, 0.8)
      let lane = laneEnds.findIndex((le) => le <= entry.startMs)
      if (lane === -1) {
        lane = laneEnds.length
        laneEnds.push(end)
      } else {
        laneEnds[lane] = end
      }

      return {
        ...entry,
        lane,
        width: Math.max((duration / total) * 100, 1.5),
        offset: (entry.startMs / total) * 100,
      }
    })
  }

  function barModifier(type) {
    return type === 'request'
      ? 'dbg-bar--request'
      : type === 'render'
        ? 'dbg-bar--render'
        : 'dbg-bar--query'
  }

  /* ── Logo mark ───────────────────────────────────────── */

  function logoSvg(size = 16) {
    return `<svg viewBox="0 0 33 33" width="${size}" height="${size}" aria-hidden="true">
      <path fill-rule="evenodd" clip-rule="evenodd"
        d="M0 16.3331C0 29.506 3.16017 32.6662 16.3331 32.6662C29.506 32.6662 32.6662 29.506
           32.6662 16.3331C32.6662 3.16017 29.506 0 16.3331 0C3.16017 0 0 3.16017 0
           16.3331ZM6.58646 19.7261L11.7093 8.08338C12.5742 6.12075 14.2374 5.05627 16.3331
           5.05627C18.4288 5.05627 20.092 6.12075 20.9569 8.08338L26.0797 19.7261C26.3126
           20.2916 26.5122 21.0235 26.5122 21.6555C26.5122 24.5495 24.483 26.5787 21.589
           26.5787C20.6032 26.5787 19.8203 26.3271 19.0278 26.0725C18.2158 25.8116 17.3937
           25.5475 16.3331 25.5475C15.2847 25.5475 14.4426 25.814 13.6145 26.076C12.8136
           26.3294 12.0258 26.5787 11.0772 26.5787C8.18318 26.5787 6.15402 24.5495 6.15402
           21.6555C6.15402 21.0235 6.35361 20.2916 6.58646 19.7261ZM16.3331
           10.1125L11.2768 21.5557C12.7737 20.8571 14.5035 20.5245 16.3331
           20.5245C18.0961 20.5245 19.8924 20.8571 21.3228 21.5557L16.3331 10.1125Z"
        fill="currentColor"/>
    </svg>`
  }

  /* ── Key-value table ─────────────────────────────────── */

  function kvTable(obj) {
    if (!hasEntries(obj)) return '<div class="dbg-empty">—</div>'
    const rows = Object.entries(obj)
      .map(
        ([k, v]) =>
          `<tr>
        <td>${esc(k)}</td>
        <td>${esc(typeof v === 'string' ? v : JSON.stringify(v))}</td>
      </tr>`
      )
      .join('')
    return `<table class="dbg-kv">${rows}</table>`
  }

  /* ── Section block ───────────────────────────────────── */

  function section(label, content, extra = '') {
    return `<div class="dbg-section">
      <div class="dbg-section-head">
        <span class="dbg-label">${esc(label)}</span>
        ${extra}
      </div>
      <div class="dbg-section-body">${content}</div>
    </div>`
  }

  /* ── Views ───────────────────────────────────────────── */

  function requestsView(data) {
    const req = data.requests
    const sc = esc(req.statusCode)
    const pill = `<span class="dbg-pill ${statusClass(req.statusCode)}">${sc}</span>`

    return `<div class="dbg-stack">
      <div class="dbg-summary">
        <span class="dbg-summary-method">${esc(req.method)}</span>
        <span class="dbg-summary-url">${esc(req.url)}</span>
        ${pill}
        <span class="dbg-summary-route">${esc(req.route || 'No named route')}</span>
      </div>
      ${hasEntries(req.query) ? section('Query Params', kvTable(req.query)) : ''}
      ${hasEntries(req.params) ? section('Route Params', kvTable(req.params)) : ''}
      ${hasEntries(req.body) ? section('Request Body', `<pre class="dbg-pre">${esc(fmt(req.body))}</pre>`) : ''}
      ${req.session ? section('Session', `<pre class="dbg-pre">${esc(fmt(req.session))}</pre>`) : ''}
      ${section('Request Headers', kvTable(req.requestHeaders))}
      ${section('Response Headers', kvTable(req.responseHeaders))}
    </div>`
  }

  function timelineView(data) {
    const scale = scaleTicks(data.requestMs || 1)
    const entries = layoutRows(data)

    return `<div class="dbg-waterfall">
      <div class="dbg-wf-legend">
        <span><i class="dbg-wf-dot dbg-wf-dot--request"></i>Request</span>
        <span><i class="dbg-wf-dot dbg-wf-dot--render"></i>Render</span>
        <span><i class="dbg-wf-dot dbg-wf-dot--query"></i>Query</span>
        <span style="margin-left:auto;color:var(--c-faint)">${esc(data.requestMs)}ms total</span>
      </div>
      <div class="dbg-wf-scale">
        ${scale.map((t) => `<span style="left:${t.offset}%">${esc(t.label)}</span>`).join('')}
      </div>
      ${entries
        .map(
          (entry) => `
        <div class="dbg-wf-row">
          <div class="dbg-wf-label">
            <strong title="${esc(entry.label)}">${esc(entry.label)}</strong>
            <span>${esc(entry.startMs)}ms + ${esc(entry.durationMs || 0)}ms</span>
          </div>
          <div class="dbg-track">
            ${scale.map((t) => `<span class="dbg-tick" style="left:${t.offset}%"></span>`).join('')}
            <div class="dbg-bar ${barModifier(entry.type)}"
                 style="left:${Math.min(entry.offset, 98.5)}%;width:${Math.max(Math.min(entry.width, 100 - entry.offset), 1.5)}%">
              ${entry.width > 12 ? `<span>${esc(entry.label)}</span>` : ''}
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>`
  }

  function queriesView(data) {
    if (!data.queryCount) {
      return '<div class="dbg-empty">No SQL queries ran for this request.</div>'
    }

    function queryCollapseKey(index) {
      const requestKey = state.activeRequestId || state.requestId || 'latest'
      return `${requestKey}:${index}`
    }

    return `<div class="dbg-stack">
      ${data.queries
        .map((q, index) => {
          const key = queryCollapseKey(index)
          const isCollapsed = state.collapsedQueries[key] === true

          return `
        <div class="dbg-query-row ${isCollapsed ? 'is-collapsed' : ''}">
          <button class="dbg-query-head" type="button" data-action="toggle-query" data-query-index="${index}" aria-expanded="${isCollapsed ? 'false' : 'true'}">
            <span class="dbg-query-conn">${esc(q.method)} &middot; ${esc(q.connection)}</span>
            <span class="dbg-query-meta">
              <span class="dbg-query-dur">${esc(q.durationMs ?? 'n/a')}ms</span>
              <span class="dbg-query-toggle" aria-hidden="true">${isCollapsed ? '+' : '-'}</span>
            </span>
          </button>
          <div class="dbg-query-details">
            <div class="dbg-query-sql">${esc(q.sql)}</div>
            ${q.bindings?.length ? `<div class="dbg-query-sql" style="color:var(--c-muted)">${esc(fmt(q.bindings))}</div>` : ''}
            <div class="dbg-query-source">${esc(q.source || 'Source unavailable')}</div>
          </div>
        </div>
      `
        })
        .join('')}
    </div>`
  }

  function bodyView() {
    if (!state.data) {
      return '<div class="dbg-empty">Loading debug snapshot…</div>'
    }
    if (state.activeTab === 'timeline') return timelineView(state.data)
    if (state.activeTab === 'queries') return queriesView(state.data)
    return requestsView(state.data)
  }

  /* ── Header assembly ─────────────────────────────────── */

  function requestPickerHtml() {
    if (!state.history.length) return ''
    const options = state.history
      .map(
        (e) =>
          `<option value="${esc(e.id)}" ${e.id === state.activeRequestId ? 'selected' : ''}>
        ${esc(`${e.snapshot.requests.method} ${e.snapshot.requests.path} — ${e.snapshot.requestMs}ms`)}
      </option>`
      )
      .join('')

    return `<select class="dbg-select" data-action="select-request">
      <option value="">Latest</option>
      ${options}
    </select>`
  }

  function modeControls() {
    const isExpanded = state.displayMode === 'expanded'
    return `<div class="dbg-controls">
      ${requestPickerHtml()}
      <button class="dbg-btn" type="button" data-action="mode" data-mode="${isExpanded ? 'collapsed' : 'expanded'}"
              aria-expanded="${isExpanded ? 'true' : 'false'}"
              title="${isExpanded ? 'Collapse' : 'Expand'}">
        ${isExpanded ? '↓' : '↑'}
      </button>
      <button class="dbg-btn" type="button" data-action="mode" data-mode="dock" aria-expanded="false" title="Close">✕</button>
    </div>`
  }

  function headerHtml() {
    const d = state.data
    return `<div class="dbg-head">
      <div class="dbg-title">
        <span class="dbg-badge">${logoSvg(14)}</span>
        <span class="dbg-path">${d ? `${esc(d.requests.method)} ${esc(d.requests.path)}` : 'Debug'}</span>
        ${d ? `<span class="dbg-pill ${statusClass(d.requests.statusCode)}">${esc(d.requests.statusCode)}</span>` : ''}
      </div>
      <div class="dbg-meta">
        ${d ? `<span>${esc(d.queryTimeMs)}ms db</span><span>${esc(d.requestMs)}ms</span><div class="dbg-divider"></div>` : ''}
        ${modeControls()}
      </div>
    </div>`
  }

  function tabsHtml() {
    const qc = state.data?.queryCount ?? 0
    const tabs = [
      { id: 'requests', label: 'Request' },
      { id: 'timeline', label: 'Timeline' },
      { id: 'queries', label: 'Queries', count: qc },
    ]

    return `<div class="dbg-tabs">
      ${tabs
        .map(
          (t) => `
        <button class="dbg-tab ${state.activeTab === t.id ? 'is-active' : ''}"
                data-tab="${t.id}" type="button">
          ${esc(t.label)}
          ${t.count != null ? `<span class="dbg-tab-count">${t.count}</span>` : ''}
        </button>
      `
        )
        .join('')}
    </div>`
  }

  /* ── Render ──────────────────────────────────────────── */

  function render() {
    localStorage.setItem(storageKey, state.displayMode)
    persistState(state)

    if (state.displayMode === 'dock') {
      root.innerHTML = `<button type="button" class="dbg-launcher" data-action="mode" data-mode="collapsed"
                                 aria-expanded="false"
                                 aria-label="Open debug bar">
        ${logoSvg(14)}<span>Debug</span>
      </button>`
      state.animatePanel = false
      return
    }

    const panelClass = `dbg-panel${state.displayMode === 'expanded' ? ' dbg-panel--expanded' : ''}${state.animatePanel ? ' dbg-panel--animate' : ''}`

    if (state.displayMode === 'collapsed') {
      root.innerHTML = `<div class="${panelClass}">${headerHtml()}</div>`
      state.animatePanel = false
      return
    }

    root.innerHTML = `<div class="${panelClass}">
      ${headerHtml()}
      ${tabsHtml()}
      <div class="dbg-body">${bodyView()}</div>
    </div>`

    state.animatePanel = false
  }

  /* ── State transitions ───────────────────────────────── */

  function setDisplayMode(mode) {
    const previousMode = state.displayMode
    state.displayMode = mode
    state.animatePanel = previousMode !== mode && mode !== 'dock'
    render()
    if ((mode === 'open' || mode === 'expanded') && !state.data) load(state.requestId)
  }

  function setActiveSnapshot(id) {
    const entry = state.history.find((e) => e.id === id)
    if (!entry) return
    state.activeRequestId = id
    state.data = entry.snapshot
    render()
  }

  function storeSnapshot(id, snapshot, activate = true) {
    const next = state.history.filter((e) => e.id !== id)
    next.unshift({ id, snapshot })
    state.history = next.slice(0, 15)
    if (activate) {
      state.activeRequestId = id
      state.data = snapshot
    }
  }

  function storeSnapshots(entries, activate = true) {
    if (!entries.length) return
    entries
      .slice()
      .reverse()
      .forEach((e, i) => {
        storeSnapshot(e.id, e.snapshot, activate && i === entries.length - 1)
      })
  }

  async function load(id, activate = true) {
    if (!id) {
      if (activate) {
        state.activeRequestId = null
        state.data = state.history[0]?.snapshot ?? null
      }
      render()
      return
    }

    if (activate) {
      state.requestId = id
      state.activeRequestId = id
    } else if (!state.requestId) {
      state.requestId = id
    }
    render()

    try {
      const res = await fetch(`/_debug/${encodeURIComponent(id)}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      if (!res.ok) throw new Error('fetch failed')
      storeSnapshot(id, await res.json(), activate)
    } catch {
      if (activate) state.data = state.history.find((e) => e.id === id)?.snapshot ?? null
    }
    render()
  }

  async function syncRequestHistory(clientRequestId) {
    if (!clientRequestId) return
    try {
      const res = await fetch(`/_debug/request/${encodeURIComponent(clientRequestId)}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      if (!res.ok) throw new Error()
      storeSnapshots(await res.json())
      render()
    } catch {
      /* silent */
    }
  }

  /* ── Public API ──────────────────────────────────────── */

  window.__debugBarOpen = () => setDisplayMode('open')

  window.__debugBarSetRequestId = (id) => {
    if (!id || id === state.requestId) return
    load(id)
  }

  /* ── Fetch / XHR patching ────────────────────────────── */

  if (!window.__debugBarPatched) {
    const originalFetch = window.fetch.bind(window)

    window.fetch = async (...args) => {
      if (isDebugRequest(args[0])) return originalFetch(...args)

      const cid = createClientRequestId()
      const [input, init] = args
      let response

      if (input instanceof Request) {
        const headers = new Headers(input.headers)
        headers.set('x-debug-request-id', cid)
        response = await originalFetch(new Request(input, { headers }), init)
      } else {
        const headers = new Headers(init?.headers || {})
        headers.set('x-debug-request-id', cid)
        response = await originalFetch(input, { ...init, headers })
      }

      window.__debugBarSetRequestId(response.headers.get('x-debug-bar-id'))
      await syncRequestHistory(cid)
      return response
    }

    XMLHttpRequest.prototype.open = function (...args) {
      this.__debugRequestUrl = typeof args[1] === 'string' ? args[1] : null
      this.addEventListener(
        'loadend',
        () => {
          window.__debugBarSetRequestId(this.getResponseHeader('x-debug-bar-id'))
        },
        { once: true }
      )
      return originalXhrOpen.apply(this, args)
    }

    XMLHttpRequest.prototype.send = function (...args) {
      if (this.__debugRequestUrl && !this.__debugRequestUrl.includes('/_debug/')) {
        const cid = createClientRequestId()
        this.setRequestHeader('x-debug-request-id', cid)
        this.addEventListener(
          'loadend',
          () => {
            void syncRequestHistory(cid)
          },
          { once: true }
        )
      }
      return originalXhrSend.apply(this, args)
    }

    /* ── Event delegation ──────────────────────────────── */
    root.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action],[data-tab]')
      if (!target) return
      if (target.dataset.action === 'mode') {
        setDisplayMode(target.dataset.mode)
        return
      }
      if (target.dataset.action === 'toggle-query') {
        const index = Number.parseInt(target.dataset.queryIndex, 10)
        if (Number.isNaN(index)) return
        const requestKey = state.activeRequestId || state.requestId || 'latest'
        const key = `${requestKey}:${index}`
        state.collapsedQueries[key] = !(state.collapsedQueries[key] === true)
        render()
        return
      }
      if (target.dataset.tab) {
        state.activeTab = target.dataset.tab
        render()
      }
    })

    root.addEventListener('change', (e) => {
      const target = e.target.closest('[data-action="select-request"]')
      if (!target) return
      const id = target.value
      if (!id) {
        const latest = state.history[0]
        if (latest) setActiveSnapshot(latest.id)
        return
      }
      setActiveSnapshot(id)
    })

    window.__debugBarPatched = true
  }

  if (state.displayMode === 'collapsed' && !state.data) state.displayMode = 'dock'

  if (state.requestId && !state.history.some((entry) => entry.id === state.requestId)) {
    void load(state.requestId, !state.data)
  }

  if (
    bootPreviousRequestId &&
    bootPreviousRequestId !== state.requestId &&
    !state.history.some((entry) => entry.id === bootPreviousRequestId)
  ) {
    void load(bootPreviousRequestId, false)
  }

  render()
})()
