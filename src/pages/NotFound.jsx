import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container success">
      <p className="eyebrow">404</p>
      <h1>This page walked off.</h1>
      <p className="lede">The link may be old, or the pair may have moved.</p>
      <Link to="/" className="btn btn-dark">
        Back home
      </Link>
    </div>
  );
}
