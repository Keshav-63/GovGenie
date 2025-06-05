"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const id = notification.id || uuidv4()
    const newNotification = {
      id,
      type: notification.type || "info",
      message: notification.message,
      duration: notification.duration || 5000,
      ...notification,
    }

    setNotifications((prev) => [...prev, newNotification])

 
    if (newNotification.duration !== Number.POSITIVE_INFINITY) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

