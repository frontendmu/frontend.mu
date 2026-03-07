import type { ApplicationService } from '@adonisjs/core/types'
import { renderDebugBarShell } from '#debug_bar/assets'
import { registerDebugBarRoutes } from '#debug_bar/routes'
import { setupDebugBar } from '#debug_bar/setup'

export default class DebugBarProvider {
  constructor(protected app: ApplicationService) {}

  register() {}

  async boot() {
    if (this.app.getEnvironment() !== 'web') {
      return
    }

    const emitter = await this.app.container.make('emitter')
    const router = await this.app.container.make('router')
    registerDebugBarRoutes(router)
    setupDebugBar(emitter)

    if (this.app.usingEdgeJS) {
      const edge = await import('edge.js')

      edge.default.global(
        'renderDebugBar',
        (debugBarId?: string | null, previousDebugBarId?: string | null) => {
          if (!debugBarId) {
            return ''
          }

          return renderDebugBarShell(debugBarId, previousDebugBarId)
        }
      )

      edge.default.registerTag({
        tagName: 'debugbar',
        block: false,
        seekable: true,
        noNewLine: true,
        compile(_parser, buffer, token) {
          buffer.outputExpression(
            'state.renderDebugBar(state.debugBarId, state.debugBarPrevId)',
            token.filename,
            token.loc.start.line,
            false
          )
        },
      })
    }
  }
}
