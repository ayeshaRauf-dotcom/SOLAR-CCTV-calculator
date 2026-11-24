// CCTV & networking quote logic. Every number comes from settings.cctv.

import { parseNumber } from './validation.js'
import { fillTemplate, findById, formatMoneyRange, formatNumber, roundTo } from './format.js'

export const STEP_FIELDS = {
  location: ['locationId'],
  cameras: ['cameras'],
  placement: ['placement'],
  nightVision: ['nightVision'],
  recording: ['recordingDays'],
  network: ['networkPoints'],
}

/**
 * answers = { locationId, cameras, placement, nightVision: 'yes'|'no', recordingDays, networkPoints }
 * fields limits the check to some answers (used step by step). Returns { errors, values }.
 */
export function validateCctv(answers, settings, fields) {
  const c = settings.cctv
  const all = ['locationId', 'cameras', 'placement', 'nightVision', 'recordingDays', 'networkPoints']
  const check = fields || all
  const errors = {}
  const values = {}

  if (check.includes('locationId')) {
    values.location = findById(c.locations, answers.locationId)
    if (!values.location) errors.locationId = 'Please choose where the cameras will go.'
  }
  if (check.includes('cameras')) {
    const p = parseNumber(answers.cameras, { label: 'the number of cameras', min: c.cameras.min, max: c.cameras.max, integer: true, settings })
    if (p.error) errors.cameras = p.error
    else values.cameras = p.value
  }
  if (check.includes('placement')) {
    values.placement = findById(c.placements, answers.placement)
    if (!values.placement) errors.placement = 'Please choose indoor, outdoor or both.'
  }
  if (check.includes('nightVision')) {
    if (answers.nightVision !== 'yes' && answers.nightVision !== 'no') errors.nightVision = 'Please choose yes or no for night vision.'
    else values.nightVision = answers.nightVision === 'yes'
  }
  if (check.includes('recordingDays')) {
    values.recording = c.recordingOptions.find((o) => String(o.days) === String(answers.recordingDays)) || null
    if (!values.recording) errors.recordingDays = 'Please choose how many days to record.'
  }
  if (check.includes('networkPoints')) {
    const np = c.networkPoints
    const raw = String(answers.networkPoints ?? '').trim()
    if (raw === '') errors.networkPoints = 'Please enter the number of network points. Enter 0 if you need none.'
    else {
      const p = np.min === 0 && /^0+$/.test(raw.replace(/[,\s]/g, ''))
        ? { value: 0, error: null }
        : parseNumber(raw, { label: 'the number of network points', min: Math.max(np.min, 1), max: np.max, integer: true, settings })
      if (p.error) errors.networkPoints = p.error
      else values.networkPoints = p.value
    }
  }

  // Cross-field rule: "both" needs at least one indoor and one outdoor camera.
  if (values.placement && values.placement.id === 'both' && values.cameras === 1) {
    errors.placement = 'Choose at least 2 cameras to mix indoor and outdoor, or pick one placement.'
  }

  if (Object.keys(errors).length) return { errors, values: null }
  return { errors, values }
}

export function splitCameras(count, placementId, share) {
  if (placementId === 'indoor') return { indoor: count, outdoor: 0 }
  if (placementId === 'outdoor') return { indoor: 0, outdoor: count }
  const outdoor = Math.min(Math.max(Math.round(count * share), 1), count - 1)
  return { indoor: count - outdoor, outdoor }
}

export function calculateCctv(values, settings) {
  const c = settings.cctv
  const { location, cameras, placement, nightVision, recording, networkPoints } = values

  const { indoor, outdoor } = splitCameras(cameras, placement.id, c.bothOutdoorShare)
  const cameraCost = indoor * c.cameraPrices.indoor + outdoor * c.cameraPrices.outdoor
  const nightCost = nightVision ? cameras * c.nightVision.addOnPerCamera : 0

  const recorder = [...c.recorders].sort((a, b) => a.maxCameras - b.maxCameras).find((r) => r.maxCameras >= cameras)

  const neededTb = (cameras * c.storage.gbPerCameraPerDay * recording.days) / c.storage.gbPerTb
  const drives = [...c.storage.drives].sort((a, b) => a.sizeTb - b.sizeTb)
  const single = drives.find((d) => d.sizeTb >= neededTb)
  const largest = drives[drives.length - 1]
  const drive = single || largest
  const driveCount = single ? 1 : Math.ceil(neededTb / largest.sizeTb)
  const storageCost = drive.price * driveCount
  const storageTb = drive.sizeTb * driveCount

  const labour = (c.installation.perCamera + c.installation.cablingPerCamera) * cameras * location.installMultiplier
  const installCost = Math.max(labour, c.installation.minimumCharge)

  const pointsCost = networkPoints * c.networkPoints.pricePerPoint
  let networkSwitch = null
  let switchCost = 0
  if (networkPoints > 0) {
    const ports = networkPoints + c.switchReservePorts
    networkSwitch = [...c.switches].sort((a, b) => a.maxPorts - b.maxPorts).find((x) => x.maxPorts >= ports) || null
    switchCost = networkSwitch ? networkSwitch.price : 0
  }

  const base = cameraCost + nightCost + recorder.price + storageCost + installCost + pointsCost + switchCost
  const min = roundTo(base * c.estimateRange.low, c.roundTo)
  const max = Math.max(roundTo(base * c.estimateRange.high, c.roundTo), min)

  const result = {
    location, cameras, placement, nightVision, recording, networkPoints,
    indoor, outdoor, recorder, drive, driveCount, storageTb, networkSwitch,
    estimate: { min, max },
  }
  result.included = cctvIncluded(result, settings)
  result.cameraTypeText = cameraTypeText(result)
  return result
}

export function cameraTypeText(r) {
  if (r.placement.id === 'both') return `Indoor and outdoor (${r.indoor} indoor, ${r.outdoor} outdoor)`
  return r.placement.label
}

export function cctvIncluded(r, settings) {
  const t = settings.cctv.included
  const list = []
  if (r.indoor > 0) list.push(fillTemplate(t.indoorCameras, { count: r.indoor }))
  if (r.outdoor > 0) list.push(fillTemplate(t.outdoorCameras, { count: r.outdoor }))
  if (r.nightVision) list.push(fillTemplate(t.nightVision, { count: r.cameras }))
  list.push(fillTemplate(t.recorder, { label: r.recorder.label }))
  list.push(fillTemplate(t.storage, { storage: `${formatNumber(r.storageTb, settings, 1)} TB`, days: r.recording.days }))
  list.push(fillTemplate(t.installation, { count: r.cameras }))
  if (r.networkPoints > 0) list.push(fillTemplate(t.networkPoints, { points: r.networkPoints }))
  if (r.networkSwitch) list.push(fillTemplate(t.networkSwitch, { label: r.networkSwitch.label }))
  if (t.phoneViewing) list.push(t.phoneViewing)
  if (t.survey) list.push(t.survey)
  return list
}

export function cctvSummary(r, settings) {
  return {
    inputs: [
      { label: 'Installation location', value: r.location.label },
      { label: 'Number of cameras', value: String(r.cameras) },
      { label: 'Camera type', value: r.cameraTypeText },
      { label: 'Night vision', value: r.nightVision ? 'Yes' : 'No' },
      { label: 'Recording duration', value: r.recording.label },
      { label: 'Network points', value: String(r.networkPoints) },
    ],
    results: [
      { label: 'Estimated quotation', value: formatMoneyRange(r.estimate.min, r.estimate.max, settings) },
      { label: 'Included', value: r.included.map((i) => `- ${i}`).join('\n') },
    ],
  }
}
