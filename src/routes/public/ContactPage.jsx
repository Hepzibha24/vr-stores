import Contact from '../../components/public/Contact'

/**
 * The dedicated contact route. It reuses the home page's Contact section
 * wholesale — same cards, same enquiry form, same map — so there is exactly one
 * copy of that logic to maintain.
 */
export default function ContactPage() {
  return <Contact />
}
