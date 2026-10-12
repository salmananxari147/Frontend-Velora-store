import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="container prose-page">
      <p className="eyebrow">About</p>
      <h1>Move Different.</h1>
      <p>
        VELORA is a men&apos;s footwear house built around one idea: a shoe should disappear into the day and still be the
        sharpest thing in the room.
      </p>
      <p>
        We design sneakers, runners, loafers, boots, and tailored leather in small, considered runs. The palette stays
        quiet. The last does the talking.
      </p>
      <Link to="/shop" className="btn btn-dark">
        Explore the collection
      </Link>
    </div>
  );
}
