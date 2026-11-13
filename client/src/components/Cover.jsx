// the book cover or movie poster, or an empty colored box if there's no picture
// alt="" because the title is already written right next to it
export default function Cover({ src, small = false }) {
  const className = small ? 'cover cover-small' : 'cover';
  // same size as in the CSS, so the browser keeps the space before the picture arrives (no jump)
  const width = small ? 46 : 52;
  const height = small ? 68 : 76;
  if (!src) return <div className={`${className} cover-empty`} aria-hidden="true"></div>;
  return <img className={className} src={src} alt="" width={width} height={height} loading="lazy" />;
}
