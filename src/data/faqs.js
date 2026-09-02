/**
 * Questions customers actually ask before calling.
 *
 * Single source for both the rendered section and the FAQPage structured data
 * injected into index.html at build time — Google requires the markup to match
 * the visible text, and two hand-maintained copies would drift apart.
 *
 * Every answer is a fact the shop confirmed. Nothing here invents a price or a
 * warranty period; where an amount depends on the job it says so rather than
 * guessing, because a number on a website is a promise.
 */
export const FAQS = [
  {
    q: 'Do you charge for a service visit?',
    a: 'Yes. A visit charge applies for diagnosis and service calls. We will tell you the amount when you call, before the technician is sent, so there is no surprise at the door.',
  },
  {
    q: 'How quickly can you attend a breakdown?',
    a: 'Same day, in most cases. Call 9940291467 and we will confirm a slot for that day wherever our technicians can reach you in time.',
  },
  {
    q: 'Do you give a warranty on repairs?',
    a: 'Yes, repairs carry a warranty. The period depends on the work done and the parts used, and we confirm it with you before starting the job.',
  },
  {
    q: 'Will you install an AC I bought somewhere else?',
    a: 'Yes. We install units bought elsewhere, with an installation charge that depends on the piping, mounting and site conditions.',
  },
  {
    q: 'Do you charge extra to travel to Guduvanchery, Chengalpattu or Tambaram?',
    a: 'No. Our rates are the same across the whole service area, with no travel surcharge for the outlying towns.',
  },
  {
    q: 'Which AC brands do you service?',
    a: 'All major brands, including Daikin, Voltas, LG, Samsung, Hitachi, Blue Star, Carrier and Whirlpool. We are the exclusive authorised dealer for O General.',
  },
  {
    q: 'Are you open on Sunday?',
    a: 'The showroom is closed on Sunday. We are open Monday to Saturday, 9:00 AM to 8:00 PM, and emergency breakdown service is available on Sundays by phone.',
  },
]

/** The same questions as schema.org FAQPage, for the build to inject. */
export const faqSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
})
