// the book cover or movie poster, or an empty colored box if there's no picture
// alt="" because the title is already written right next to it
export default function Cover({ src, small = false }) {
  const className = small ? 'cover cover-small' : 'cover';
  if (!src) return <div className={`${className} cover-empty`} aria-hidden="true"></div>;
  return <img className={className} src={src} alt="" loading="lazy" />;
}
