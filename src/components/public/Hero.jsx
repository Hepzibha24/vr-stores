import { asset } from '../../lib/asset'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${asset('hero-bg.jpg')})` }} />
      <div className="hero-accent" />
      <div className="hero-content">
        <div className="hero-tag">
          <i className="ti ti-shield-check" style={{ fontSize: 14 }} />
          O General Exclusive Authorised Dealer
        </div>
        {/* The visible headline is the brand line; the H1 a crawler reads
            names the service and the town, which is what people search for. */}
        <h1 className="sr-only">
          Air Conditioner Sales, Installation and Service in Urapakkam, Chengalpattu — VR Store,
          O General Exclusive Authorised Dealer
        </h1>
        <div className="hero-headline" aria-hidden="true">
          Cool Your
          <br />
          <span>World</span>
          <br />
          With Us
        </div>
        <p>
          Premium AC sales, installation, and service at your doorstep. Urapakkam's most trusted air
          conditioning partner.
        </p>
        <div className="hero-btns">
          <a className="btn-hero-primary" href="tel:9940291467">
            <i className="ti ti-phone" style={{ fontSize: 18 }} /> Call Now
          </a>
          <a
            className="btn-hero-secondary"
            href="https://wa.me/919940291467"
            target="_blank"
            rel="noreferrer"
          >
            <i className="ti ti-brand-whatsapp" style={{ fontSize: 18 }} /> WhatsApp
          </a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="num">500+</div>
            <div className="lbl">Happy Customers</div>
          </div>
          <div className="hero-stat">
            <div className="num">10+</div>
            <div className="lbl">Years Experience</div>
          </div>
          <div className="hero-stat">
            <div className="num">9</div>
            <div className="lbl">Brands Serviced</div>
          </div>
        </div>
      </div>
      <div className="scroll-down">
        <span>Scroll</span>
        <i className="ti ti-chevron-down" style={{ fontSize: 16 }} />
      </div>
    </section>
  )
}
