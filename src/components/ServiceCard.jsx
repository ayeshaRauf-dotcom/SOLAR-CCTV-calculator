import Icon from './Icon.jsx'

export default function ServiceCard({ icon, title, description }) {
  return (
    <article className="card service-card">
      <span className="service-card__icon"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
