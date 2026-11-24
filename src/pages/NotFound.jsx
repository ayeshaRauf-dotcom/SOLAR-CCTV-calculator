import { Link } from '../router.jsx'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container container--narrow notfound">
        <h1>We could not find that page.</h1>
        <p>The link may be old or mistyped. Start from the home page or open one of the calculators.</p>
        <p className="notfound__links">
          <Link to="/" className="btn btn--primary">Home</Link>
          <Link to="/solar" className="btn btn--ghost">Solar Calculator</Link>
          <Link to="/cctv" className="btn btn--ghost">CCTV Quote</Link>
        </p>
      </div>
    </section>
  )
}
