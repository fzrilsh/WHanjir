import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { WS_URL } from '../config/api'

function useSocket() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionInfo, setConnectionInfo] = useState(null)
  const [error, setError] = useState(null)

  const handlersRef = useRef({
    onCacheData: null,
    onTematicData: null,
    onDataUpdated: null,
    onTematicUpdated: null,
    onError: null,
  })

  useEffect(() => {
    const socket = io(WS_URL, {
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
      // Auto re-fetch fresh road data after backend signals update
      setTimeout(() => {
        if (socket.connected) socket.emit('request_cache')
      }, 300)
    })

    socket.on('tematic_updated', (info) => {
      setConnectionInfo((prev) => ({
        ...prev,
        tematic: info,
      }))
      if (handlersRef.current.onTematicUpdated) {
        handlersRef.current.onTematicUpdated(info)
      }
      // Auto re-fetch fresh tematic data after backend signals update
      setTimeout(() => {
        if (socket.connected) socket.emit('request_tematic_cache')
      }, 300)
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

    return () => {
      socket.disconnect()
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
    requestCache,
    requestTematicCache,
    emit,
    handlersRef,
  }
}

export default useSocket
