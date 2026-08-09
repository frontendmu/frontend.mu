import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/**
 * SiteSetting
 *
 * A single-row table (id = 1) holding admin-editable, global feature
 * configuration that isn't tied to the build/deploy environment (unlike
 * config/*.ts files, which are env-driven).
 */
export default class SiteSetting extends BaseModel {
  static table = 'site_settings'

  @column({ isPrimary: true })
  declare id: number

  @column({ consume: (v: unknown): boolean => Boolean(v) })
  declare calendarFeedEnabled: boolean

  @column({ consume: (v: unknown): boolean => Boolean(v) })
  declare calendarAutoIncludeNewEvents: boolean

  @column({ consume: (v: unknown): boolean => Boolean(v) })
  declare calendarIncludePastEvents: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /**
   * Returns the single settings row, creating it with defaults on first use.
   */
  static async current(): Promise<SiteSetting> {
    return SiteSetting.firstOrCreate(
      { id: 1 },
      {
        id: 1,
        calendarFeedEnabled: true,
        calendarAutoIncludeNewEvents: true,
        calendarIncludePastEvents: false,
      }
    )
  }
}
