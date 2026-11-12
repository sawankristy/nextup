const STARS = [1, 2, 3, 4, 5];

// 5 buttons: the ones up to the rating are filled, clicking one sends that number up
export default function StarRating({ rating, onRate }) {
  const label = rating ? `Rated ${rating} out of 5` : 'Not rated yet';

  return (
    <div className="stars" role="group" aria-label={label}>
      {STARS.map(star => (
        <button
          key={star}
          type="button"
          className={star <= rating ? 'star filled' : 'star'}
          aria-label={star === 1 ? '1 star' : `${star} stars`}
          onClick={() => onRate(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
