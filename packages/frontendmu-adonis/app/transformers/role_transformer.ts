import { BaseTransformer } from '@adonisjs/core/transformers'
import type Role from '#models/role'
import PermissionTransformer from '#transformers/permission_transformer'

export default class RoleTransformer extends BaseTransformer<Role> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      description: this.resource.description,
    }
  }

  forAdminEdit() {
    return {
      ...this.toObject(),
      permissions: PermissionTransformer.transform(this.resource.permissions ?? []),
    }
  }
}
