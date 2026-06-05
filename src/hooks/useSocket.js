import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { getWsUrl, hostReady, isServerOffline } from '../config/api'

function useSocket() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionInfo, setConnectionInfo] = useState(null)
  const [error, setError] = useState(null)
  const [serverOffline, setServerOffline] = useState(false)

  const handlersRef = useRef({
    onCacheData: null,
    onTematicData: null,
    onDataUpdated: null,
    onTematicUpdated: null,
    onError: null,
  })

  useEffect(() => {
    let socket = null
    let cancelled = false

    hostReady.then(({ offline }) => {
      if (cancelled) return

      if (offline) {
        setServerOffline(true)
        return
      }

      setServerOffline(false)

      socket = io(getWsUrl(), {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      })

      socket.on('connect', () => {
        setIsConnected(true)
        setError(null)
      })

      socket.on('connected', (data) => {
        setConnectionInfo(data)
      })

      socket.on('cache_data', (data) => {
        if (handlersRef.current.onCacheData) {
          handlersRef.current.onCacheData(data.data)
        }
      })

      socket.on('tematic_data', (data) => {
        if (handlersRef.current.onTematicData) {
          handlersRef.current.onTematicData(data.data)
        }
      })

      socket.on('data_updated', (info) => {
        setConnectionInfo((prev) => ({
          ...prev,
          roads: info,
        }))
        if (handlersRef.current.onDataUpdated) {
          handlersRef.current.onDataUpdated(info)
        }
      })

      socket.on('tematic_updated', (info) => {
        setConnectionInfo((prev) => ({
          ...prev,
          tematic: info,
        }))
        if (handlersRef.current.onTematicUpdated) {
          handlersRef.current.onTematicUpdated(info)
        }
      })

      socket.on('error', (data) => {
        setError(data.message)
        if (handlersRef.current.onError) {
          handlersRef.current.onError(data.message)
        }
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socketRef.current = socket
    })

    return () => {
      cancelled = true
      if (socket) {
        socket.disconnect()
      }
      socketRef.current = null
    }
  }, [])

  const requestCache = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('request_cache')
    }
  }, [])

  const requestTematicCache = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('request_tematic_cache')
    }
  }, [])

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  return {
    socket: socketRef,
    isConnected,
    connectionInfo,
    error,
    serverOffline,
    requestCache,
    requestTematicCache,
    emit,
    handlersRef,
  }
}

export default useSocket
