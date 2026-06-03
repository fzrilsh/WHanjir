import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import useSocket from './useSocket'

const SocketContext = createContext(null)

function SocketProvider({ children }) {
  const socket = useSocket()
  const [roads, setRoads] = useState(null)
  const [tematic, setTematic] = useState(null)

  const handlersRef = socket.handlersRef

  useEffect(() => {
    handlersRef.current.onCacheData = (data) => {
      setRoads(data)
    }
    handlersRef.current.onTematicData = (data) => {
      setTematic(data)
    }

    return () => {
      handlersRef.current.onCacheData = null
      handlersRef.current.onTematicData = null
    }
  }, [handlersRef])

  useEffect(() => {
    if (socket.isConnected) {
      socket.requestCache()
      socket.requestTematicCache()
    }
  }, [socket.isConnected, socket.requestCache, socket.requestTematicCache])

  const value = {
    ...socket,
    roads,
    tematic,
    setRoads,
    setTematic,
    serverOffline: socket.serverOffline,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

function useSocketContext() {
  const ctx = useContext(SocketContext)
  if (!ctx) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return ctx
}

function useRoadData() {
  const { roads, isConnected, connectionInfo, requestCache } = useSocketContext()

  const roadsReady = isConnected && roads !== null

  return {
    roads,
    roadsReady,
    roadsInfo: connectionInfo?.roads || null,
    requestCache,
  }
}

function useTematicData() {
  const { tematic, isConnected, connectionInfo, requestTematicCache } = useSocketContext()

  const tematicReady = isConnected && tematic !== null

  return {
    tematic,
    tematicReady,
    tematicInfo: connectionInfo?.tematic || null,
    requestTematicCache,
  }
}

function useDataUpdated({ onRoadsUpdated, onTematicUpdated } = {}) {
  const { handlersRef } = useSocketContext()

  useEffect(() => {
    handlersRef.current.onDataUpdated = onRoadsUpdated || null
    return () => {
      handlersRef.current.onDataUpdated = null
    }
  }, [onRoadsUpdated, handlersRef])

  useEffect(() => {
    handlersRef.current.onTematicUpdated = onTematicUpdated || null
    return () => {
      handlersRef.current.onTematicUpdated = null
    }
  }, [onTematicUpdated, handlersRef])
}

export {
  SocketProvider,
  useSocketContext,
  useRoadData,
  useTematicData,
  useDataUpdated,
}
