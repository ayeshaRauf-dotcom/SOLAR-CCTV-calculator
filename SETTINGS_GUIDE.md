# SETTINGS_GUIDE

Everything the website shows or calculates is controlled by one file: **`public/settings.json`**.
You never need to edit a React file to change a price, a colour, the company name or any wording.

- The app loads the file in the visitor's browser every time the page opens (it is not cached). Save the file and refresh the page to see the change. While `npm run dev` is running, a refresh is enough.
- The file must stay **valid JSON**: double quotes around names and text, no trailing commas, no comments. Because JSON has no comments, this guide explains every setting.
- If a value is missing or impossible (for example a negative price), the site shows a clear "settings.json needs fixing" screen that names the problem instead of showing wrong numbers.
- All prices in the shipped file are **"Sample prices – replace before launch"**.

Money values are plain numbers in PKR (no commas, no quotes). Multipliers are plain numbers where `1.0` means "no change", `1.1` means "10% more".

---

## 1. Top level

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `settingsNotice` | Text of the sample-price banner | `"Sample prices – replace before launch"` | Shown in the yellow bar at the top of every page while the banner is on. |
| `showSampleBanner` | Turn the banner on or off | `true` | Set to `false` before launch to hide the banner. |

## 2. `company`

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `name` | Company name | `"[Company name]"` | Navbar, footer, page titles, WhatsApp greeting. Keep `[Company name]` until the founder approves a name. |
| `tagline` | Short line about the business | `"Solar, CCTV and networking installers across Pakistan"` | Available for future use. |
| `description` | Paragraph in the footer | `"…"` | Shown under the logo in the footer. |
| `whatsappNumber` | Installer's WhatsApp number, with country code | `"923001234567"` | Every enquiry opens `wa.me/<this number>`. `+92 300 1234567` and `0300 1234567` also work; they are converted to digits. The shipped number is a **sample**. |
| `logoUrl` | Logo image | `"/images/logo-placeholder.svg"` | Put the file in `public/images/` and use `/images/your-logo.png`, or use a full `https://…` link. If the image fails to load, a simple sun mark is shown. Leave `""` for the mark. |
| `email` | Contact email | `"info@example.com"` | Shown in the footer. Empty `""` hides it. |
| `address` | Business address | `"Office 1, Example Road, Rawalpindi"` | Shown in the footer. Empty hides it. |
| `workingHours` | Opening hours | `"Mon–Sat, 9am–6pm"` | Shown in the footer. Empty hides it. |
| `serviceAreaText` | Coverage line | `"Serving customers across Pakistan"` | Shown in the footer. Empty hides it. |

## 3. `colors`

Any CSS colour (hex is easiest). They become CSS variables (`--c-ink`, `--c-accent`, …).

| Setting | Used for |
|---|---|
| `ink` | Navbar, hero, footer, result headline panel (dark navy). |
| `panel` | Second dark tone in gradients (deep green). |
| `accent` | Main buttons, disclaimer bar, highlights (solar yellow). |
| `onAccent` | Text on top of `accent`. Keep it dark enough to read. |
| `signal` | Progress bar, stat borders (green). |
| `signalStrong` | Green text, links and the WhatsApp button (darker green, readable on white). |
| `surface` | Cards and inputs (white). |
| `surfaceAlt` | Page background and soft panels (light grey). |
| `text`, `textMuted` | Main and secondary text. |
| `onInk`, `onInkMuted` | Text on dark backgrounds. |
| `border` | Lines around cards and inputs. |
| `danger`, `dangerBg` | Error text and error field background. |

Tip: change `accent` and `onAccent` together so button text stays readable.

## 4. `format`

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `currencyLabel` | Text before every amount | `"PKR"` | `PKR 1,250,000`. |
| `locale` | Number grouping style | `"en-US"` | `en-US` gives `1,250,000`. `en-IN` gives lakh grouping `12,50,000`. |

## 5. `cities`

A list. Each city appears in the Solar city dropdown and in the enquiry form's city dropdown.

| Field | Purpose | Example | Effect |
|---|---|---|---|
| `id` | Unique short name | `"lahore"` | Internal key. No spaces. |
| `name` | Shown to visitors and in WhatsApp | `"Lahore"` | |
| `peakSunHours` | Average full-sun hours per day | `5.0` | More sun means each kW makes more units, so a **smaller** system is suggested and savings per kW rise. |
| `costMultiplier` | Local price adjustment | `1.05` | Multiplies the solar system cost for that city (transport, labour). `1.0` = no change. |

To add a city, copy one block, give it a new `id`, `name` and values. To remove one, delete its block (keep at least one).

## 6. `solar`

### 6.1 Inputs and limits (`solar.input`)

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `defaultMode` | Which tab opens first | `"bill"` | `"bill"` or `"units"`. |
| `minBill`, `maxBill` | Allowed monthly bill | `1000`, `500000` | Outside this range the visitor sees a clear message. Above the max they are asked to contact you. |
| `minUnits`, `maxUnits` | Allowed monthly units (kWh) | `50`, `10000` | Same as above for units. |
| `exampleBill`, `exampleUnits` | Placeholder examples | `30000`, `600` | Hints under the input. |

### 6.2 Core factors

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `tariffPerUnit` | Average price of one unit (kWh) of grid electricity | `50` | Converts bill to units (`bill ÷ tariff`) and units to bill. Also values the units solar saves. Higher tariff means higher savings and shorter payback. |
| `daysPerMonth` | Days used for monthly maths | `30` | Rarely changed. |
| `systemEfficiency` | Share of ideal output a real system delivers (0 to 1) | `0.78` | Lower value means a larger system is needed and savings per kW drop. |
| `targetOffset` | Share of usage the system is sized to cover (0 to 1) | `0.9` | `0.9` sizes the system to cover about 90% of usage. `1` covers all of it. |
| `pricePerKw` | Base installed price per kW | `160000` | Main driver of the cost range. |
| `fixedCharges` | Fixed extras added once | `35000` | For example approvals or mounting work that do not depend on size. |

### 6.3 Size limits (`solar.sizing`)

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `stepKw` | Standard size step | `0.5` | Required size is rounded **up** to the next step. |
| `minKw` | Smallest size estimated online | `3` | Smaller needs are raised to this and the visitor is told. |
| `maxKw` | Largest size estimated online | `100` | Larger needs are capped and the visitor is told to send an enquiry. |

### 6.4 Ranges and rounding

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `costRange.low`, `costRange.high` | Cost range around the base cost | `0.92`, `1.12` | Minimum cost = base × low; maximum = base × high. |
| `savingsRange.low`, `savingsRange.high` | Savings range around the calculated saving | `0.8`, `0.98` | Keeps savings an honest range, never a promise. Keep `high` at or below `1`. |
| `rounding.costTo` | Round costs to nearest | `5000` | Cleaner numbers. |
| `rounding.savingsTo` | Round savings to nearest | `100` | |
| `rounding.paybackDecimals` | Decimals for payback years | `1` | |

Payback is calculated as: **minimum** = lowest cost ÷ (highest monthly saving × 12); **maximum** = highest cost ÷ (lowest monthly saving × 12).

### 6.5 Roof types (`solar.roofTypes`)

| Field | Purpose | Example | Effect |
|---|---|---|---|
| `id` | Unique key | `"tile"` | |
| `label` | Shown in the dropdown | `"Sloped or tiled roof"` | |
| `costMultiplier` | Installation difficulty | `1.08` | Multiplies the system cost. |
| `yieldMultiplier` | Output compared with a flat roof | `0.97` | Lower value means less output per kW, so a larger system is suggested. |

### 6.6 Home page preview and wording

| Setting | Purpose |
|---|---|
| `previewExample` | Inputs for the home page example (`mode`, `amount`, `cityId`, `roofId`). The real calculator runs on these, so the preview always follows current prices. `cityId` and `roofId` must exist. |
| `explanation` | The six lines of "How We Worked This Out". Placeholders in `{braces}` are filled in automatically: `{monthlyUnits} {monthlyBill} {tariff} {city} {roof} {yieldPerKw} {sunHours} {efficiency} {offset} {rawKw} {sizeKw} {pricePerKw} {fixedCharges} {costLow} {costHigh} {generatedUnits} {savingsLow} {savingsHigh}`. Use only these names. |
| `label` | Reminder text: "Sample prices – replace before launch". |

## 7. `cctv`

### 7.1 Quantities

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `cameras.min`, `max`, `default` | Camera count limits and starting value | `1`, `64`, `4` | `max` must not exceed the largest recorder (`recorders`). |
| `networkPoints.min`, `max`, `default` | Network point limits | `0`, `50`, `0` | `max` plus `switchReservePorts` must fit the largest switch. |
| `networkPoints.pricePerPoint` | Price per network point (socket and cabling) | `3500` | Points × price. |

### 7.2 Choices

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `locations` | Home, Office, Shop, Building (`id`, `label`, `icon`, `description`) | | `icon` is one of `home`, `office`, `shop`, `building`. |
| `locations[].installMultiplier` | Installation difficulty for that place | `1.2` | Multiplies installation and cabling labour. |
| `placements` | Indoor, outdoor, both | | Keep the three ids `indoor`, `outdoor`, `both`. You can change labels and descriptions. |
| `bothOutdoorShare` | Share of cameras that are outdoor when "Both" is chosen | `0.5` | With 8 cameras this gives 4 outdoor and 4 indoor. At least one of each. |
| `recordingOptions` | Recording days offered (`days`, `label`) | `{ "days": 30, "label": "30 days" }` | Add or remove choices. More days need bigger storage. |

### 7.3 Prices

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `cameraPrices.indoor`, `outdoor` | Price per camera | `6500`, `9500` | Cameras × price. |
| `nightVision.addOnPerCamera` | Extra per camera for night vision | `2500` | Added for every camera when the visitor says Yes. |
| `storage.gbPerCameraPerDay` | Video data one camera makes per day | `20` | Total storage = cameras × this × recording days. |
| `storage.gbPerTb` | GB in 1 TB | `1000` | Rarely changed. |
| `storage.drives` | Hard disks (`sizeTb`, `label`, `price`) | `{ "sizeTb": 4, "price": 24000 }` | The smallest single disk that fits is chosen. If none is big enough, the largest disk is used several times. |
| `recorders` | Recorders (`maxCameras`, `label`, `price`) | `{ "maxCameras": 8, "price": 18000 }` | The smallest recorder with enough channels is chosen. |
| `installation.perCamera` | Mounting and setup per camera | `2500` | |
| `installation.cablingPerCamera` | Cabling per camera | `2000` | |
| `installation.minimumCharge` | Lowest installation charge | `8000` | Installation is never below this. |
| `switchReservePorts` | Spare ports on the network switch | `2` | A switch is added only when network points are above 0. Ports needed = points + this. |
| `switches` | Switches (`maxPorts`, `label`, `price`) | `{ "maxPorts": 16, "price": 12000 }` | Smallest switch with enough ports is chosen. |

### 7.4 Range, rounding, steps, wording

| Setting | Purpose | Example | Effect |
|---|---|---|---|
| `estimateRange.low`, `high` | Range around the calculated total | `0.92`, `1.12` | Minimum = total × low; maximum = total × high. |
| `roundTo` | Round quotation to nearest | `500` | |
| `steps` | Titles and help text of the six steps | | Keep six steps and keep the `id` values. |
| `previewExample` | Inputs for the home page example | | Values must be valid choices (`locationId`, `cameras`, `placement`, `nightVision` `"yes"` or `"no"`, `recordingDays`, `networkPoints`). |
| `included` | Wording of the "What is included" list | `"{count} × indoor camera"` | Placeholders in `{braces}`: `{count}`, `{label}`, `{storage}`, `{days}`, `{points}`. Delete a line's text (use `""`) to hide a fixed item such as `phoneViewing` or `survey`. Only list services you really include. |

CCTV total = cameras + night vision + recorder + storage + installation + network points + switch, then the range is applied.

## 8. `content` (wording)

| Setting | Purpose |
|---|---|
| `seo.home/solar/cctv` | Browser tab title and search description for each page. |
| `hero` | Headline, description and the two button labels. |
| `services` | The three service cards (`icon` is `sun`, `camera` or `network`). |
| `howItWorks` | The four steps. |
| `faq` | Questions and answers. Keep them general: no invented numbers or customers. |
| `disclaimer` | Shown on every result and added to every WhatsApp message. Keep the legal meaning: estimate only, confirmed after a free site survey. |
| `privacyNotice` | The "not stored" notice above the enquiry button. |
| `enquiryTitle`, `enquiryButton` | Form heading and button text. |
| `whatsapp.greeting` | First line of the WhatsApp message. `{company}` becomes the company name. |
| `whatsapp.solarServiceName`, `cctvServiceName` | Service name in the message. |
| `whatsapp.headings` | Section headings inside the message. |

---

## Quick recipes

- **Change the WhatsApp number:** `company.whatsappNumber`.
- **Make solar 10% dearer:** raise `solar.pricePerKw` by 10%, or set `costRange` to `1.0` / `1.2`.
- **Add a 90-day recording choice:** add `{ "days": 90, "label": "90 days" }` to `cctv.recordingOptions`.
- **Allow more than 64 cameras:** raise `cctv.cameras.max` and add a larger recorder to `cctv.recorders`.
- **Go live:** replace sample prices, set `showSampleBanner` to `false`, set the real company name, logo and WhatsApp number (after founder approval).
