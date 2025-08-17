export const isOccurenceAFrequence = (label) => {
  const normalized = label?.toLowerCase();
  return !['1 fois', '2 fois', '3 fois'].includes(normalized);
};

export function StarRating({ rating, maxRating = 5 }) {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const fillPercentage = Math.min(Math.max(rating - i + 1, 0), 1) * 100; // % de remplissage pour cette étoile (0 à 100)

    stars.push(
      <span
        key={i}
        style={{
          position: 'relative',
          display: 'inline-block',
          fontSize: '20px',
          color: '#ccc',
          width: '20px',
          height: '20px',
          marginRight: '2px',
        }}
        aria-hidden="true"
      >
        {/* Étoile grise en fond */}
        <span style={{ position: 'absolute', top: 0, left: 0 }}>★</span>

        {/* Étoile jaune partiellement visible selon fillPercentage */}
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${fillPercentage}%`,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: '#FFD700',
          }}
        >
          ★
        </span>
      </span>
    );
  }

  return <div>{stars}</div>;
}