interface FooterProps {
  isConnected: boolean
  lastUpdated: string
}

function Footer({ isConnected, lastUpdated }: FooterProps) {
  return (
    <footer>
      <p>Last updated: <span>{lastUpdated}</span></p>
      <p className="status-indicator">
        Status: <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}>●</span>
      </p>
    </footer>
  )
}

export default Footer

