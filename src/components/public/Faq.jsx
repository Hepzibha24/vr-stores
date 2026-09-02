import { useState } from 'react'
import { FAQS } from '../../data/faqs'
import './Faq.css'

/**
 * Questions customers actually ask before calling.
 *
 * Not here for rich results — Google deprecated those in May 2026 — but
 * because the page previously said nothing about cost, speed, warranty or
 * whether we touch units bought elsewhere. Those are the questions that
 * decide whether someone calls, and they match how people phrase searches.
 *
 * The questions live in data/faqs.js, shared with the FAQPage markup the build
 * injects, so the visible text and the structured data cannot disagree.
 */

export default function Faq() {
  // One open at a time, and all closed to begin with, so the section reads as
  // a scannable list of questions rather than a wall of answers.
  const [open, setOpen] = useState(null)

  return (
    <section className="section" id="faq">
      <div className="container" data-reveal>
        <div className="eyebrow">Before You Call</div>
        <h2 className="section-heading">Common Questions</h2>
        <p className="section-sub">
          The things customers ask most often. Anything not covered here, just call — we would
          rather answer than have you guess.
        </p>

        <div className="faq-list">
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <div className={`faq-item${isOpen ? ' open' : ''}`} key={item.q}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <i className={isOpen ? 'ti ti-minus' : 'ti ti-plus'} aria-hidden="true" />
                </button>
                {/* Always rendered, hidden with CSS: a crawler and a
                    screen-reader user both get the answer either way. */}
                <div className="faq-a" id={`faq-a-${i}`} hidden={!isOpen}>
                  <p>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
