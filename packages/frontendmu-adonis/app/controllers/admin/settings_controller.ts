import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'
import SiteSettingPolicy from '#policies/site_setting_policy'
import { updateSiteSettingValidator } from '#validators/site_setting_validator'
import { canonicalUrl } from '#utils/site_url'

export default class SettingsController {
  async edit({ inertia, bouncer }: HttpContext) {
    await bouncer.with(SiteSettingPolicy).authorize('edit')
    const settings = await SiteSetting.current()

    return inertia.render('admin/settings/edit', {
      settings: settings.serialize(),
      calendarFeedUrl: canonicalUrl('/api/public/meetups.ics'),
    })
  }

  async update({ request, bouncer, response, session }: HttpContext) {
    await bouncer.with(SiteSettingPolicy).authorize('update')
    const data = await request.validateUsing(updateSiteSettingValidator)

    const settings = await SiteSetting.current()
    settings.merge(data)
    await settings.save()

    session.flash('success', 'Settings updated successfully!')
    return response.redirect().back()
  }
}
