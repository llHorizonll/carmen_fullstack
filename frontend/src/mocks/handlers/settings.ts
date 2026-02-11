import { http, HttpResponse } from 'msw'
import { paginate } from '../data/common'
import { mockTenantSettings, mockLicense } from '../data/settings'
import { mockRoles, mockPermissionGroups, mockUsers } from '../data/users'

const mockRoleList = mockRoles.map((r) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  isSystem: r.isSystem,
  permissionCount: r.permissions.length,
  userCount: r.userCount,
}))

const mockRoleLookup = mockRoles.map((r) => ({
  id: r.id,
  name: r.name,
}))

const allPermissions = mockPermissionGroups.flatMap((g) => g.permissions)

const mockUserList = mockUsers.map((u) => ({
  id: u.id,
  email: u.email,
  fullName: u.fullName,
  isActive: u.isActive,
  roleCount: u.roles.length,
  lastLoginAt: u.lastLoginAt,
  createdAt: u.createdAt,
}))

export const settingsHandlers = [
  // ── Tenant Settings ─────────────────────────────────────────

  // GET tenant settings
  http.get('*/v1/settings/tenant', () => {
    return HttpResponse.json(mockTenantSettings)
  }),

  // PUT tenant settings
  http.put('*/v1/settings/tenant', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...mockTenantSettings, ...body, updatedAt: new Date().toISOString() })
  }),

  // ── License ─────────────────────────────────────────────────

  // GET license info
  http.get('*/v1/settings/license', () => {
    return HttpResponse.json(mockLicense)
  }),

  // ── Roles ───────────────────────────────────────────────────

  // GET roles list (paginated)
  http.get('*/v1/roles', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    return HttpResponse.json(paginate(mockRoleList, page, pageSize))
  }),

  // GET role lookup
  http.get('*/v1/roles/lookup', () => {
    return HttpResponse.json(mockRoleLookup)
  }),

  // GET check role name
  http.get('*/v1/roles/check-name/:name', () => {
    return HttpResponse.json({ exists: false })
  }),

  // GET role permissions
  http.get('*/v1/roles/:id/permissions', ({ params }) => {
    const role = mockRoles.find((r) => r.id === params.id)
    if (!role) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(role.permissions)
  }),

  // PUT role permissions
  http.put('*/v1/roles/:id/permissions', ({ params }) => {
    const role = mockRoles.find((r) => r.id === params.id)
    if (!role) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(role)
  }),

  // GET role by id
  http.get('*/v1/roles/:id', ({ params }) => {
    const role = mockRoles.find((r) => r.id === params.id)
    if (!role) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(role)
  }),

  // POST create role
  http.post('*/v1/roles', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 'new-role-id',
      ...body,
      isSystem: false,
      permissions: [],
      userCount: 0,
      createdAt: new Date().toISOString(),
    }, { status: 201 })
  }),

  // PUT update role
  http.put('*/v1/roles/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const existing = mockRoles.find((r) => r.id === params.id)
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() })
  }),

  // DELETE role
  http.delete('*/v1/roles/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ── Users ───────────────────────────────────────────────────

  // GET users list (paginated)
  http.get('*/v1/users', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    return HttpResponse.json(paginate(mockUserList, page, pageSize))
  }),

  // GET user roles
  http.get('*/v1/users/:userId/roles', ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.userId)
    if (!user) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
    })
  }),

  // PUT user roles
  http.put('*/v1/users/:userId/roles', ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.userId)
    if (!user) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
    })
  }),

  // GET user by id
  http.get('*/v1/users/:userId', ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.userId)
    if (!user) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(user)
  }),

  // ── Permissions ─────────────────────────────────────────────

  // GET all permissions
  http.get('*/v1/permissions/grouped', () => {
    return HttpResponse.json(mockPermissionGroups)
  }),

  // GET permissions (flat list)
  http.get('*/v1/permissions', () => {
    return HttpResponse.json(allPermissions)
  }),
]
