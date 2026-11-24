import { useSettings } from '../hooks/useSettings.jsx'
import Icon from './Icon.jsx'

export default function Disclaimer() {
  const { content } = useSettings()
  return (
    <p className="disclaimer" role="note">
      <Icon name="info" size={20} />
      <span>{content.disclaimer}</span>
    </p>
  )
}
