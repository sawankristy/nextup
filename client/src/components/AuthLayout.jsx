// the frame of the home, log in and sign up pages
// (composition: each page puts its own content inside, as children)
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <main className="auth-main">
        <div className="covers covers-book covers-big" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="logo logo-big">NextUp</p>
        <p className="tagline">Everything you want to read or watch next, in your own lists.</p>
        {children}
      </main>
      <footer className="auth-footer">
        <p>Books from Open Library · Movies from TMDB</p>
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </footer>
    </div>
  );
}
