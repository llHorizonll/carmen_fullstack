import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationStore } from '../notification-store'

beforeEach(() => {
  useNotificationStore.setState({ unreadCount: 0 })
})

describe('notification-store', () => {
  it('defaults to 0 unread count', () => {
    expect(useNotificationStore.getState().unreadCount).toBe(0)
  })

  it('setUnreadCount sets the count', () => {
    useNotificationStore.getState().setUnreadCount(5)
    expect(useNotificationStore.getState().unreadCount).toBe(5)
  })

  it('incrementUnreadCount increments by 1', () => {
    useNotificationStore.getState().setUnreadCount(3)
    useNotificationStore.getState().incrementUnreadCount()
    expect(useNotificationStore.getState().unreadCount).toBe(4)
  })

  it('incrementUnreadCount from zero', () => {
    useNotificationStore.getState().incrementUnreadCount()
    expect(useNotificationStore.getState().unreadCount).toBe(1)
  })
})
