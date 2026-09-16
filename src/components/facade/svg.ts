import { buildFacade, FACADES, ROTATION, VIEW, type FacadeName, type TowerPaths } from './geometry'

/**
 * The facade as one self-contained SVG string, for places that cannot run the
 * page stylesheet: the Open Graph image, which Satori renders through resvg.
 *
 * Colours are inlined as attributes because there is no CSS here. They mirror
 * the facade rules in globals.css; keep the two in step.
 */
export function facadeSvg(name: FacadeName, width: number, height: number): string {
  const g = buildFacade(FACADES[name])
  const rotate = `rotate(${ROTATION} ${VIEW.w / 2} ${VIEW.h / 2})`
  const mid = (g.band.from + g.band.to) / 2

  const glass = (id: string, p: TowerPaths) =>
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${p.edgeFrom}" y1="0" x2="${p.edgeTo}" y2="0">` +
    `<stop offset="0" stop-color="#082358"/><stop offset="0.45" stop-color="#061538"/><stop offset="1" stop-color="#050f28"/>` +
    `</linearGradient>`

  const tower = (id: string, p: TowerPaths) =>
    `<g transform="${rotate}">` +
    `<path d="${p.body}" fill="url(#${id})"/>` +
    `<path d="${p.panes[0]}" fill="#e3edfe" fill-opacity="0.035"/>` +
    `<path d="${p.panes[1]}" fill="#e3edfe" fill-opacity="0.075"/>` +
    `<path d="${p.panes[2]}" fill="#649dfe" fill-opacity="0.16"/>` +
    `<path d="${p.panes[3]}" fill="#649dfe" fill-opacity="0.3"/>` +
    (p.spandrels ? `<path d="${p.spandrels}" fill="#031435" fill-opacity="0.55"/>` : '') +
    `<path d="${p.floors}" fill="none" stroke="#e3edfe" stroke-opacity="0.13" stroke-width="1"/>` +
    `<path d="${p.mullions}" fill="none" stroke="#e3edfe" stroke-opacity="0.15" stroke-width="1"/>` +
    `<path d="${p.majors}" fill="none" stroke="#e3edfe" stroke-opacity="0.3" stroke-width="1.4"/>` +
    `<path d="${p.edge}" fill="none" stroke="#e3edfe" stroke-opacity="0.6" stroke-width="2"/>` +
    `</g>`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${VIEW.w} ${VIEW.h}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>` +
    `<linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#050f28"/><stop offset="1" stop-color="#031435"/></linearGradient>` +
    `<linearGradient id="band" gradientUnits="userSpaceOnUse" x1="${g.band.from - 120}" y1="0" x2="${g.band.to + 120}" y2="0">` +
    `<stop offset="0" stop-color="#082358" stop-opacity="0"/><stop offset="0.5" stop-color="#034cbe" stop-opacity="0.78"/><stop offset="1" stop-color="#082358" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<linearGradient id="fall" gradientUnits="userSpaceOnUse" x1="0" y1="-300" x2="0" y2="1300">` +
    `<stop offset="0" stop-color="#0065ea" stop-opacity="0.3"/><stop offset="1" stop-color="#050f28" stop-opacity="0.35"/>` +
    `</linearGradient>` +
    glass('near-glass', g.near) +
    glass('far-glass', g.far) +
    `</defs>` +
    `<rect width="${VIEW.w}" height="${VIEW.h}" fill="url(#sky)"/>` +
    `<g transform="${rotate}">` +
    `<rect x="${g.band.from - 120}" y="-700" width="${g.band.to - g.band.from + 240}" height="2400" fill="url(#band)"/>` +
    `<rect x="${mid - 700}" y="-700" width="1400" height="2400" fill="url(#fall)"/>` +
    `</g>` +
    tower('near-glass', g.near) +
    tower('far-glass', g.far) +
    `</svg>`
  )
}
