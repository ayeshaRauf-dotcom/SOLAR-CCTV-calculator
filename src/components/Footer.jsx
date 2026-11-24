import { useSettings } from '../hooks/useSettings.jsx'
import { Link } from '../router.jsx'
import { normalizeWhatsAppNumber } from '../utils/whatsapp.js'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'

export default function Footer() {
  const { company } = useSettings()
  const number = normalizeWhatsAppNumber(company.whatsappNumber)
  const chat = `https://wa.me/${number}`
  return (
    <footer className="footer" id="contact">
      <div className="container footer__grid">
        <div>
          <Logo />
          <p className="footer__text">{company.description}</p>
        </div>
        <div>
          <h2 className="footer__title">Contact</h2>
          <ul className="footer__list">
            <li><Icon name="whatsapp" size={18} /> <a href={chat} target="_blank" rel="noopener noreferrer">WhatsApp +{number}</a></li>
            {company.email && <li><Icon name="mail" size={18} /> <a href={`mailto:${company.email}`}>{company.email}</a></li>}
            {company.address && <li><Icon name="pin" size={18} /> <span>{company.address}</span></li>}
            {company.workingHours && <li><Icon name="info" size={18} /> <span>{company.workingHours}</span></li>}
            {company.serviceAreaText && <li><Icon name="shield" size={18} /> <span>{company.serviceAreaText}</span></li>}
          </ul>
        </div>
        <div>
          <h2 className="footer__title">Tools</h2>
          <ul className="footer__list footer__list--plain">
            <li><Link to="/solar">Solar Calculator</Link></li>
            <li><Link to="/cctv">CCTV Quote</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} {company.name}. All estimates are indicative only.</p>
      </div>
    </footer>
  )
}
