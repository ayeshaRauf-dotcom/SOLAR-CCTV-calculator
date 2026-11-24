# ClientoraHQ – Solar Savings Calculator & CCTV Quick Quote

A mobile-first website for a solar, CCTV and networking installer in Pakistan. Visitors estimate solar savings or a CCTV installation price, then send the result to the installer on WhatsApp. It runs fully in the browser: no backend, no database, no accounts, no analytics.

> **Status:** sample prices only. Nothing should go live on a real domain until the founder approves the company name, prices, wording and WhatsApp number.

## Features

- Home page: hero, services, how it works, live calculator previews, FAQ, footer.
- **Solar Savings Calculator** (`/solar`): bill **or** units, city, roof type. Shows system size (kW), cost range, monthly savings range, payback range, and a "How We Worked This Out" explanation.
- **CCTV & Networking Quick Quote** (`/cctv`): six-step picker (location, cameras, placement, night vision, recording days, network points). Shows a price range and an "included" list built from the choices.
- One shared **enquiry form** (name, Pakistani mobile, city, optional note) that opens WhatsApp with a prefilled message containing the customer details, inputs and full result.
- **Iframe embeds** (`/embed/solar`, `/embed/cctv`) with a "Copy Embed Code" button and a safe auto-resize message.
- **One settings file** (`public/settings.json`) controls prices, formulas, colours, company details and wording. See `SETTINGS_GUIDE.md`.
- Input checks for empty, zero, negative, letters, huge numbers, bad phone numbers and missing selections. Customer text is only ever rendered as plain text.

## Technology

React 19, Vite, plain JavaScript, modern CSS. No other runtime dependencies: icons are inline SVG and routing is a small built-in History API router (`src/router.jsx`). `lucide-react` and `react-router-dom` were deliberately not used.

## Install and run

Requires Node.js 20.19 or newer (or 22.12+), which Vite 7 needs.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm test           # logic tests for calculators, validation and WhatsApp message
```

On Windows, run these in the VS Code terminal (PowerShell or Command Prompt) from the project folder.

## Folder structure

```
public/
  settings.json            All prices, rates, colours, company info, wording
  images/                  Logo placeholder and favicon
src/
  components/              Navbar, Footer, Hero, ServiceCard, EnquiryForm, FAQ, ...
  pages/                   Home, SolarPage, CCTVPage, EmbedPage, NotFound
  calculators/             SolarCalculator, CCTVCalculator, SolarResults, CCTVResults
  utils/                   solarCalculations, cctvCalculations, whatsapp, validation, format, settings
  hooks/                   useSettings (loads settings.json), usePageMeta, useEmbedResize
  router.jsx               Tiny client-side router
  App.jsx, main.jsx, index.css
tests/calculations.test.js Node tests for the logic (no browser needed)
index.html, vite.config.js, vercel.json, package.json
SETTINGS_GUIDE.md          Every setting explained
```

No price, rate, factor or colour is written in a component. Components read `settings.json` through `useSettings()`.

## How to change things

All changes below are in `public/settings.json`. Save, then refresh the browser. Details for every field are in `SETTINGS_GUIDE.md`.

| I want to change | Edit |
|---|---|
| Company name, description, logo, email, address | `company.*` (keep `[Company name]` until approved) |
| WhatsApp number | `company.whatsappNumber`, for example `"923001234567"` |
| Website colours | `colors.*` |
| Solar prices and factors | `solar.pricePerKw`, `solar.fixedCharges`, `solar.tariffPerUnit`, `solar.costRange`, roof types, `cities[].costMultiplier` |
| CCTV prices | `cctv.cameraPrices`, `cctv.nightVision`, `cctv.recorders`, `cctv.storage.drives`, `cctv.installation`, `cctv.networkPoints.pricePerPoint`, `cctv.switches` |
| Cities | `cities` |
| Wording, FAQ, hero, disclaimer | `content.*` |
| Hide the sample-price banner | `"showSampleBanner": false` |

The file must stay valid JSON (no comments, no trailing commas). If it is invalid or has an impossible value, the site shows an error screen that names the problem.

## Deploy on Vercel

1. Put the project in a **private** GitHub repository (never commit secrets; none are needed).
2. In Vercel choose **Add New → Project**, import the repository. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
3. Deploy. `vercel.json` already sends all routes to `index.html` (so `/solar`, `/cctv`, `/embed/...` work on refresh) and stops `settings.json` from being cached.
4. To change prices later, edit `public/settings.json`, commit and push. Vercel redeploys.
5. Do not attach a real domain until the founder approves.

## Iframe embedding

Open `/solar` or `/cctv` and press **Copy Embed Code**, or use this pattern (replace the address with your deployed site):

```html
<iframe id="clientorahq-solar" src="https://YOUR-SITE.vercel.app/embed/solar"
  title="Solar Savings Calculator"
  style="width:100%;min-height:640px;border:0;display:block" loading="lazy"></iframe>
<script>
  window.addEventListener('message', function (e) {
    var f = document.getElementById('clientorahq-solar');
    if (!f || e.source !== f.contentWindow) return;
    if (e.data && e.data.type === 'clientorahq:resize' && typeof e.data.height === 'number') {
      f.style.height = Math.ceil(e.data.height) + 'px';
    }
  });
</script>
```

The embedded page has no navbar or footer and sends only its height (a number) to the parent page with `postMessage`. The parent script checks that the message comes from its own iframe. Without the script the frame still works but scrolls inside its own box. Use `/embed/cctv` for the CCTV tool.

To limit which websites may embed the tools, add a `Content-Security-Policy: frame-ancestors https://installer-site.example` header in `vercel.json`.

## Testing checklist

Use this on a real phone and laptop before anything goes live.

- [ ] Home page loads; navbar links, both hero buttons, Contact link work.
- [ ] Solar: empty, `0`, `-5`, `abc`, `12k`, `99999999999` each show a clear message and no result.
- [ ] Solar: valid bill gives size, cost range, savings range, payback range, city, roof, disclaimer, "How We Worked This Out".
- [ ] Solar: "My units" tab works without a bill.
- [ ] CCTV: each of the six steps blocks Next until a valid answer; `0`, negative, letters, decimals and huge camera counts are rejected; "Both" with 1 camera is rejected.
- [ ] CCTV result shows location, cameras, camera type, night vision, recording, network points, range, included list, disclaimer.
- [ ] Change `solar.pricePerKw` and a CCTV camera price in `settings.json`; refresh; results change with no code change.
- [ ] Enquiry: empty name, empty/invalid phone (`12345`, `0200 1234567`) and no city are blocked with messages.
- [ ] Enquiry with a name of `<script>alert(1)</script>`: no alert appears, the name shows as text, and the WhatsApp message contains it as text.
- [ ] WhatsApp opens on a phone (app) and on desktop (WhatsApp Web) with the number from `settings.json` and the full result in the message.
- [ ] 360px and 390px phones, tablet and laptop: no sideways scrolling, forms usable with the phone keyboard.
- [ ] Both embeds inside a test page on a different domain, on phone and laptop: no cut-off content, no extra scrollbars.
- [ ] Keyboard only: Tab through forms, Enter submits, focus is always visible.

## What was tested while building this

Be aware of the difference between what ran and what did not:

- **Ran and passed:** `tests/calculations.test.js` (17 Node tests): settings.json validity, solar and CCTV calculations, invalid-input rejection (empty, zero, negative, letters, huge, missing), every camera count × placement × recording combination giving finite prices, price changes in settings changing results, phone and enquiry validation, WhatsApp message and URL contents (number from settings, script tag kept as plain text, URL-encoding).
- **Ran:** the whole app bundled successfully with esbuild (no missing files or broken imports).
- **Not run:** `npm install`, `npm run dev`, `npm run build` (package installs were blocked where this was built). Browser testing, 360px/laptop layout, iframe behaviour, real WhatsApp opening and visual design review were **not completed** and must be checked by you using the checklist above. Package version ranges in `package.json` were not verified against the registry.

## Known limitations

- Estimates use one blended electricity tariff and a simple sun-hours model. It ignores tariff slabs, net-metering rates, battery storage, shading, panel degradation and tariff changes.
- Sample prices, sample WhatsApp number and sample city sun-hours are placeholders and must be replaced with approved values.
- CCTV storage uses one average data rate per camera and ignores recorder disk-bay limits; very large systems (many cameras and long recording) need a site survey.
- The "Both" option splits cameras by a fixed share, not by the customer's real layout.
- WhatsApp opens in a new tab. A pop-up blocker may block it; the page then shows an "Open WhatsApp" link.
- Cross-origin embedding auto-resize needs the small script from the embed code on the parent page.
- `settings.json` is public by design (it is fetched by the browser). Never put secrets in it.
- Page titles and descriptions are set in JavaScript, so social-media link previews will not show per-page text.

## Next (ideas, not built)

- Tariff slabs and net-metering income in the solar estimate.
- Battery and hybrid inverter options.
- PDF quotation download.
- Optional privacy-safe analytics (counts only, no personal data).
- Urdu / Roman Urdu language switch.
- Settings editor page for the installer.
- Per-page social preview images and pre-rendered HTML for better sharing.
- Automated browser tests (Playwright) in the repository.
