export function EventCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="event-grid loading-grid" role="status" aria-label="Loading events" aria-busy="true">
      <span className="sr-only">Loading events...</span>
      {Array.from({ length: count }, (_, index) => (
        <div className="event-card" key={index} aria-hidden="true">
          <div className="skeleton skeleton-image" />
          <div className="skeleton-body"><div className="skeleton skeleton-line skeleton-short" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line skeleton-short" /></div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ label = "Loading page..." }: { label?: string }) {
  return (
    <main className="form-page">
      <section className="form-panel" role="status" aria-label={label} aria-busy="true">
        <span className="sr-only">{label}</span>
        <div className="skeleton-page" aria-hidden="true"><div className="skeleton skeleton-line skeleton-short" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-field" /><div className="skeleton skeleton-field" /><div className="skeleton skeleton-field" /></div>
      </section>
    </main>
  );
}

export function EventDetailsSkeleton() {
  return (
    <main className="form-page event-detail-page" role="status" aria-label="Loading event details" aria-busy="true">
      <span className="sr-only">Loading event details...</span>
      <div className="detail-panel" aria-hidden="true"><div className="skeleton detail-image" /><div className="detail-copy skeleton-page"><div className="skeleton skeleton-line skeleton-short" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-field" /></div></div>
    </main>
  );
}
