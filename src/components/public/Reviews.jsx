import { useReviews } from '../../data/StoreContext'
import './Reviews.css'

function Stars({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={n <= rating ? 'ti ti-star-filled' : 'ti ti-star'} aria-hidden="true" />
      ))}
    </span>
  )
}

export default function Reviews() {
  const reviews = useReviews()

  // Nothing to show until real reviews are entered in the admin. An empty
  // testimonials strip looks worse than no testimonials strip.
  if (!reviews.length) return null

  const average = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length

  return (
    <section className="section bg-gray" id="reviews">
      <div className="container">
        <div className="eyebrow">What Customers Say</div>
        <h2 className="section-heading">Reviews</h2>
        <p className="section-sub">
          {reviews.length} review{reviews.length === 1 ? '' : 's'} from customers across Urapakkam
          and nearby — average {average.toFixed(1)} out of 5.
        </p>

        <div className="reviews-grid">
          {reviews.map((r) => (
            <figure className="review-card" key={r.id}>
              <Stars rating={Number(r.rating) || 5} />
              <blockquote>{r.text}</blockquote>
              <figcaption>
                <span className="review-name">{r.name}</span>
                {r.source && <span className="review-source">via {r.source}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
