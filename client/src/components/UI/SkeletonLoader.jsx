export function SkeletonLoader({ width = '100%', height = '20px', borderRadius = '4px', shimmer = true }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        animation: shimmer ? 'skeleton-shimmer 2s infinite' : 'none',
      }}
      className="skeleton-loader"
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div style={s.card}>
      <div style={s.header}>
        <SkeletonLoader width="40px" height="40px" borderRadius="8px" />
        <div style={{ flex: 1 }}>
          <SkeletonLoader width="60%" height="18px" style={{ marginBottom: 8 }} />
          <SkeletonLoader width="80%" height="14px" />
        </div>
      </div>
      <div style={s.content}>
        <SkeletonLoader width="100%" height="14px" style={{ marginBottom: 8 }} />
        <SkeletonLoader width="100%" height="14px" style={{ marginBottom: 8 }} />
        <SkeletonLoader width="70%" height="14px" />
      </div>
      <div style={s.footer}>
        <SkeletonLoader width="60px" height="20px" borderRadius="4px" />
        <SkeletonLoader width="70px" height="20px" borderRadius="4px" />
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div style={s.boardContainer}>
      <SkeletonLoader width="100%" height="24px" style={{ marginBottom: 12 }} />
      <div style={s.cards}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={s.cardItem}>
            <SkeletonLoader width="100%" height="12px" style={{ marginBottom: 8 }} />
            <SkeletonLoader width="80%" height="12px" />
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    animation: 'skeleton-shimmer 2s infinite',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  content: {
    marginBottom: 16,
  },
  footer: {
    display: 'flex',
    gap: 8,
  },
  boardContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cards: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardItem: {
    padding: 12,
    background: 'var(--bg)',
    borderRadius: 8,
    border: '1px solid var(--border)',
  },
};
