import { BaseTransformer } from '@adonisjs/core/transformers'
import type Permission from '#models/permission'

export default class PermissionTransformer extends BaseTransformer<Permission> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      description: this.resource.description,
    }
  }
}
