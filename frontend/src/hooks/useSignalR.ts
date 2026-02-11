import { useEffect, useRef, useState } from "react"
import * as signalR from "@microsoft/signalr"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5238"

type UseSignalROptions = {
  hubUrl: string
  enabled?: boolean
}

export function useSignalR({ hubUrl, enabled = true }: UseSignalROptions) {
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const accessToken = localStorage.getItem("accessToken")

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}${hubUrl}`, {
        accessTokenFactory: () => accessToken || "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.onreconnecting(() => {
      setIsConnected(false)
    })

    connection.onreconnected(() => {
      setIsConnected(true)
    })

    connection.onclose(() => {
      setIsConnected(false)
    })

    connection
      .start()
      .then(() => {
        setIsConnected(true)
      })
      .catch((err) => {
        console.error("SignalR connection error:", err)
      })

    connectionRef.current = connection

    return () => {
      connection.stop()
      connectionRef.current = null
    }
  }, [hubUrl, enabled])

  return { connection: connectionRef.current, isConnected }
}
