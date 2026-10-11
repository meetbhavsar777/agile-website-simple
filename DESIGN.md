# Agile SciTech website — design guide

This is the design the site uses today. Follow it when adding or changing a page so every page looks like part of the same site.

Brand name: **Agile SciTech** (legal and old-site name: Agile Diagnostics). Ahmedabad, established 2013.

## 1. Principles

1. **Simple first.** A visitor should understand a page at a glance. One idea per section. If a section needs explaining, simplify it.
2. **Light and minimal.** White and very pale blue surfaces. Dark blue is for text, buttons and one or two accents, not for large blocks.
3. **Real content.** Use real logos, product photos and text from agilescitech.in and the redesign PDF. Stock photos only where no real photo exists.
4. **One place to contact.** Every "Contact us" and "Request a quote" leads to the contact form on the About page.
5. **Same header everywhere.** Every page has the same menu and the same button.

## 2. Colour

| Name | Value | Use |
|---|---|---|
| Brand blue | `#213A82` | Buttons, links, key numbers, solid accent blocks |
| Navy | `#14265C` | Headings and body headings |
| Bright blue | `#2F54B8` | Second half of two-tone headings, small labels, arrows |
| Royal (lightened dark) | `#1D3478` → `#2C4CA6` → `#4169D6` | Gradient on icon tiles only |
| Slate | `#4B5768` | Paragraph text |
| Muted | `#7A8698` | Captions, hints |
| Pale blue surface | `#F7F9FE` / `#F4F7FE` | Light cards, page-top background |
| Pale blue fill | `#EEF2FB` / `#E7EEFC` | Chips, icon backgrounds, hover |
| Hairline | `#E3E9F6` / `#D9E3F7` | Card borders, dividers |
| Orange accent | `#FFB04A` | Only the plus signs and the "8" in the home figures band |
| White | `#FFFFFF` | Page and card background |

Rules:
- Headline gradient (`--grad`): `#213A82 → #2F54B8 → #5B80E0`, used on the highlighted words of a page headline.
- Do not introduce new colours. Orange is the single accent and is used in one place.
- Text on brand blue is white; supporting text on brand blue is `#C9D6F7`.

## 3. Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Page headline (h1) | Plus Jakarta Sans | 800 | 34–60px, line height 1.05, letter spacing −0.045em |
| Section heading (h2) | Plus Jakarta Sans | 800 | 28–40px, two-tone: first part navy, second part bright blue |
| Card title | Outfit | 600 | 17–20px |
| Paragraph | Outfit | 400 | 15–18px, line height 1.6–1.7 |
| Small label | Outfit | 600 | 11–12px, uppercase, letter spacing 0.14–0.18em, bright blue |
| Button | Outfit | 500–600 | 14–15px |

Rules:
- Sentence case for headings and buttons.
- Keep paragraphs short and no wider than about 34–44 words per line block (`max-width` 31–42em).
- Two fonts only: Outfit for everything, Plus Jakarta Sans for big headings.

## 4. Shape, spacing and shadow

- **Corners:** cards 22–30px, buttons 12–13px, chips fully round, icon tiles 16–22px.
- **Page width:** content sits in a centred container with 48px side padding (less on phones).
- **Section spacing:** about 60px between sections inside a page; page top 54–76px padding.
- **Shadows:** soft and wide, blue-tinted, for example `0 24px 60px rgba(13, 26, 69, .10)`. Cards at rest have a border and little or no shadow; the shadow appears on hover.
- **Hover:** cards lift 3–6px; arrows slide 4–5px; icon tiles tilt about 5 degrees.

## 5. Header and menu

Same on every page.

- Logo on the left (links to the home page).
- Menu: **Home · Products · Partners · Applications · Services · About**.
  - Products: dropdown, "All products" plus the 12 categories, two columns.
  - Partners: dropdown, the 8 partner pages. There is no partners overview page.
  - Applications: plain link, no dropdown.
  - Services: dropdown, the 6 service pages. There is no services overview page.
  - About: dropdown, About us, Group companies, Awards, Events, Contact us.
- Button on the right: **Request a quote →**, opens the About contact form. When the visitor has products in the quote list it shows the count and opens the list.
- No dark strip above the header.
- On phones the menu opens from the three-line button and dropdown items show as indented lists.

## 6. Page templates

### Home (`index.html`)
Product hero with five products on plinths → client logo rail → six product cards → six category icon cards → About block with figures band → partner side-list with photo panel → contact section with glass form → white footer.

### Inner page top (partners, services, About)
A photo fills the whole top section as a background, faded to near-white on the left so text reads clearly.
- Left: small tag, headline with gradient words, one short paragraph, two or three buttons.
- Partner pages: the partner logo sits large on the right with no card behind it.
- Below, overlapping the photo edge: a white **facts strip** with three facts.

### Application page top
Text on the left, one clean photo on the right, then a facts strip with "Who uses it" and "Partners in this workflow".

### Partner page (`partner-*.html`)
Top → facts strip → product cards with category filter chips → three support cards → call-to-action card.

### Application page (`app-*.html`)
Top → facts strip → three challenge cards → workflow steps → recommended product cards → short quote form → related applications.

### Service page (`service-*.html`)
Top → facts strip → tick list beside an info card → six-step "concept to commissioning" band with the current service highlighted → call-to-action card.

### About (`about.html`)
Top → facts strip → who we are → group companies → awards with photos → certifications → events → contact section with form.

### Products (`products.html`, `cat-*.html`, `product.html`)
Catalogue with search → 12 icon category cards → partner links → quote list. Category pages have filters and product cards. One product template filled from the catalogue data.

## 7. Components

| Component | Look |
|---|---|
| Primary button | Brand blue fill, white text, arrow at the right |
| Secondary button | White fill, thin blue-grey border, navy text |
| Light card | White or `#F7F9FE`, 1px `#E3E9F6` border, 22–30px corners |
| Icon tile | Royal blue gradient square with a white line icon; one drawn icon set for services and categories |
| Product card | Photo on a pale panel, type chip, name, one line, "Details" and "+ Quote" |
| Quick view | Clicking a product photo flips the card into a large panel with zoom, specs and "Add to quote list" |
| Facts strip | White bar, three or four facts divided by hairlines, big blue number plus short label |
| Tick list | Pale rows with a filled blue tick |
| Step card | White card with icon, name, one line and a faint number; current step filled brand blue |
| Call-to-action card | Pale blue card with two faint rings, heading, one line, "Contact us" and "Call" |
| Quote form (short) | Pale blue card, two fields and a blue button |
| Contact section | Lab photo under a blue wash, glass form on the right |
| Filter chips | Round pills; the active one is filled brand blue |

## 8. Motion

- Library: Motion (the plain-JavaScript version of Framer Motion), loaded as a module.
- Everything is visible without it; it only adds movement.
- Headlines rise word by word; groups of cards fade and slide in one after another as they scroll into view.
- A thin progress line at the top shows scroll position.
- Cards tilt slightly toward the pointer on desktop.
- All movement is switched off for visitors who ask their device for reduced motion.

## 9. Images

- Partner logos: `images/partners/`. Product photos: `images/catalog/`. Scene photos: `images/hero/`, `images/workflow/`, `images/applications/`, `images/services/`. About: `images/about/`.
- Product photos sit on a pale panel and blend into it.
- Products without a photo show the partner logo instead.
- Stock photos are from Unsplash under its free licence. Avoid photos that show another company's name.

## 10. Words

- Plain and short. Say what the thing does.
- Buttons start with a verb: "Send inquiry", "See the products", "Contact us".
- Use the old site's text and the PDF's text. Leave out anything the PDF marked as a placeholder until the real value is known.
