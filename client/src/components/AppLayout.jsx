import Header from './Header.jsx';

// the frame of every logged-in page: the header on top, the page inside
export default function AppLayout({ children }) {
  return (
    <>
      <Header />
      <main className="page">{children}</main>
    </>
  );
}
