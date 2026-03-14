export default function BuildARoverPage() {
  return (
    <iframe
      src="/build-a-rover.html"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        zIndex: 100,
      }}
    />
  )
}
