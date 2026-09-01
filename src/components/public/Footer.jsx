import { Link } from 'react-router-dom'
import { useServices } from '../../data/StoreContext'
import './Footer.css'

export default function Footer() {
  const services = useServices()

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/admin" title="Open the admin portal">
            <img src="/logo.jpg" alt="VR Store logo" />
          </Link>
          <p>
            O General Exclusive Authorised AC Showroom. Trusted sales, installation &amp; service in
            Urapakkam, Tamil Nadu.
          </p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            {services.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li>
              <a href="tel:9940291467">9940291467</a>
            </li>
            <li>
              <a href="tel:71200817516">71200817516</a>
            </li>
            <li>
              <a href="mailto:vrstores.airconditioner@gmail.com">
                vrstores.airconditioner
                <br />
                @gmail.com
              </a>
            </li>
            <li>Mon–Sat: 9AM–8PM</li>
            <li>Sun: Closed</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © 2026 VR Store · O General Exclusive Authorised Dealer · Urapakkam West, Chengalpat, TN
          603 211
        </p>
        <p>
          Designed with ❤ for VR Store ·{' '}
          <Link to="/admin" className="footer-admin">
            Admin
          </Link>
        </p>
      </div>
    </footer>
  )
}
