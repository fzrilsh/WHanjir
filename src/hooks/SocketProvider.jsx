import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import useSocket from './useSocket'
import { ENDPOINTS } from '../config/api'

const SocketContext = createContext(null)

function SocketProvider({ children }) {
  const socket = useSocket()
  const [roads, setRoads] = useState(null)
  const [tematic, setTematic] = useState(null)

  const handlersRef = socket.handlersRef
  const lastRoadsTimestampRef = useRef(null)
  const lastTematicTimestampRef = useRef(null)
  const isFetchingRoadsRef = useRef(false)
  const isFetchingTematicRef = useRef(false)

  const onRoadsUpdatedRef = useRef(null)
  const onTematicUpdatedRef = useRef(null)

  const roadsRef = useRef(null)
  useEffect(() => {
    roadsRef.current = roads
  }, [roads])

  const fetchFullRoads = useCallback(async () => {
    if (isFetchingRoadsRef.current) return
    isFetchingRoadsRef.current = true
    try {
      console.log('[SocketProvider] Fetching full roads cache...')
      const response = await fetch(ENDPOINTS.roads(), {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
      if (!response.ok) throw new Error('Failed to fetch roads')
      const data = await response.json()
      
      const etag = response.headers.get('ETag')
      if (etag) {
        lastRoadsTimestampRef.current = etag.replace(/"/g, '')
      }
      
      setRoads(data)
      console.log('[SocketProvider] Full roads cache loaded successfully')
    } catch (err) {
      console.error('[SocketProvider] Error fetching roads:', err)
    } finally {
      isFetchingRoadsRef.current = false
    }
  }, [])

  const fetchTematic = useCallback(async () => {
    if (isFetchingTematicRef.current) return
    isFetchingTematicRef.current = true
    try {
      console.log('[SocketProvider] Fetching thematic cache...')
      const response = await fetch(ENDPOINTS.tematic(), {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
      if (!response.ok) throw new Error('Failed to fetch thematic')
      const data = await response.json()
      
      const etag = response.headers.get('ETag')
      if (etag) {
        lastTematicTimestampRef.current = etag.replace(/"/g, '')
      }
      
      setTematic(data)
      console.log('[SocketProvider] Thematic cache loaded successfully')
    } catch (err) {
      console.error('[SocketProvider] Error fetching thematic:', err)
    } finally {
      isFetchingTematicRef.current = false
    }
  }, [])

  const fetchScoresOnly = useCallback(async () => {
    if (!roadsRef.current) {
      return fetchFullRoads()
    }
    if (isFetchingRoadsRef.current) return
    isFetchingRoadsRef.current = true
    try {
      console.log('[SocketProvider] Fetching updated scores...')
      const response = await fetch(ENDPOINTS.scores(), {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
      if (!response.ok) throw new Error('Failed to fetch scores')
      const scores = await response.json()
      
      const etag = response.headers.get('ETag')
      if (etag) {
        lastRoadsTimestampRef.current = etag.replace(/"/g, '')
      }

      // Merge scores into roads state
      const scoresMap = new Map(scores.map(s => [s.id, s]))
      setRoads(prevRoads => {
        if (!prevRoads) return null
        return prevRoads.map(road => {
          const updated = scoresMap.get(road.id)
          if (updated) {
            return {
              ...road,
              ...updated
            }
          }
          return road
        })
      })
      console.log('[SocketProvider] Merged updated scores successfully')
    } catch (err) {
      console.error('[SocketProvider] Error updating scores:', err)
    } finally {
      isFetchingRoadsRef.current = false
    }
  }, [fetchFullRoads])

  // Trigger initial fetch on mount
  useEffect(() => {
    fetchFullRoads()
    fetchTematic()
  }, [fetchFullRoads, fetchTematic])

  // Set up socket event handlers
  useEffect(() => {
    handlersRef.current.onDataUpdated = (info) => {
      console.log('[WS] Roads data updated event received:', info)
      const newTs = info?.timestamp ? String(Math.floor(info.timestamp)) : null
      if (!newTs || newTs !== lastRoadsTimestampRef.current) {
        fetchScoresOnly()
      } else {
        console.log('[SocketProvider] Roads timestamp matches, skipping fetch')
      }
      if (onRoadsUpdatedRef.current) {
        onRoadsUpdatedRef.current(info)
      }
    }

    handlersRef.current.onTematicUpdated = (info) => {
      console.log('[WS] Tematic data updated event received:', info)
      const newTs = info?.timestamp ? String(Math.floor(info.timestamp)) : null
      if (!newTs || newTs !== lastTematicTimestampRef.current) {
        fetchTematic()
      } else {
        console.log('[SocketProvider] Tematic timestamp matches, skipping fetch')
      }
      if (onTematicUpdatedRef.current) {
        onTematicUpdatedRef.current(info)
      }
    }

    return () => {
      handlersRef.current.onDataUpdated = null
      handlersRef.current.onTematicUpdated = null
    }
  }, [handlersRef, fetchScoresOnly, fetchTematic])

  // Watch connectionInfo for updates while we were disconnected or during initial handshake
  useEffect(() => {
    if (!socket.isConnected || !socket.connectionInfo) return

    const socketRoadsTs = socket.connectionInfo.roads?.timestamp
      ? String(Math.floor(socket.connectionInfo.roads.timestamp))
      : null
    
    if (socketRoadsTs && socketRoadsTs !== lastRoadsTimestampRef.current) {
      console.log('[SocketProvider] Connection info indicates new roads data, updating...')
      fetchScoresOnly()
    }

    const socketTematicTs = socket.connectionInfo.tematic?.timestamp
      ? String(Math.floor(socket.connectionInfo.tematic.timestamp))
      : null

    if (socketTematicTs && socketTematicTs !== lastTematicTimestampRef.current) {
      console.log('[SocketProvider] Connection info indicates new thematic data, updating...')
      fetchTematic()
    }
  }, [socket.isConnected, socket.connectionInfo, fetchScoresOnly, fetchTematic])

  const value = {
    ...socket,
    roads,
    tematic,
    setRoads,
    setTematic,
    serverOffline: socket.serverOffline,
    onRoadsUpdatedRef,
    onTematicUpdatedRef,
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
  const { roads, connectionInfo, requestCache } = useSocketContext()

  const roadsReady = roads !== null

  return {
    roads,
    roadsReady,
    roadsInfo: connectionInfo?.roads || null,
    requestCache,
  }
}

function useTematicData() {
  const { tematic, connectionInfo, requestTematicCache } = useSocketContext()

  const tematicReady = tematic !== null

  return {
    tematic,
    tematicReady,
    tematicInfo: connectionInfo?.tematic || null,
    requestTematicCache,
  }
}

function useDataUpdated({ onRoadsUpdated, onTematicUpdated } = {}) {
  const { onRoadsUpdatedRef, onTematicUpdatedRef } = useSocketContext()

  useEffect(() => {
    onRoadsUpdatedRef.current = onRoadsUpdated || null
    return () => {
      onRoadsUpdatedRef.current = null
    }
  }, [onRoadsUpdated, onRoadsUpdatedRef])

  useEffect(() => {
    onTematicUpdatedRef.current = onTematicUpdated || null
    return () => {
      onTematicUpdatedRef.current = null
    }
  }, [onTematicUpdated, onTematicUpdatedRef])
}

export {
  SocketProvider,
  useSocketContext,
  useRoadData,
  useTematicData,
  useDataUpdated,
}
