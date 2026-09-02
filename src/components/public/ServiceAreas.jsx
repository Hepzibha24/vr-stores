import './ServiceAreas.css'

/**
 * The towns covered, as visible text.
 *
 * They were declared in the page's structured data but appeared nowhere a
 * reader — or a crawler reading the body — could see them, so the page only
 * ever argued for Urapakkam. Someone searching "AC service Guduvanchery" had
 * nothing to match against.
 *
 * Keep this list honest: it should say where a technician will actually
 * travel, and it must agree with the areaServed block in index.html.
 */
const AREAS = [
  'Urapakkam',
  'Guduvanchery',
  'Vandalur',
  'Chengalpattu',
  'Maraimalai Nagar',
  'Singaperumal Koil',
  'Potheri',
  'Tambaram',
]

export default function ServiceAreas() {
  return (
    <section className="section bg-gray" id="areas">
      <div className="container" data-reveal>
        <div className="eyebrow">Where We Work</div>
        <h2 className="section-heading">Areas We Serve</h2>
        <p className="section-sub">
          AC sales, installation, repair and annual maintenance across Urapakkam and the wider
          Chengalpattu district. Not on the list? Call us — we cover most of the southern Chennai
          corridor.
        </p>

        <ul className="areas-list">
          {AREAS.map((a) => (
            <li key={a}>
              <i className="ti ti-map-pin" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
