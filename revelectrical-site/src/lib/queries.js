// One query fetches the whole homepage plus the shared lists it renders.
export const HOME_QUERY = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    announcementText, announcementCtaLabel,
    accreditations[]{ name, url, logo }
  },
  "page": *[_type == "homePage"][0]{
    seoTitle, seoDescription,
    heroHeadingStart, heroHeadingHighlight, heroHeadingEnd,
    heroIntro, heroTicks, heroImage,
    featureItems[]{ icon, title, text },
    servicesHeading, servicesIntro, servicesNote,
    promptHeading, promptText, promptCtaLabel, promptImage,
    processHeading, processSteps[]{ icon, title, text },
    areasHeading, areasText,
    whyHeading, whyParagraphs, whyPoints, whyImage,
    galleryHeading, galleryIntro,
    brandsHeading, brandsText, brands,
    contactHeading, contactIntro, contactImage
  },
  "navBrands": *[_type == "brand"] | order(order asc, name asc){ _id, name, kind, hasPage, "slug": slug.current },
  "services": *[_type == "service"] | order(order asc){
    _id, title, slug, summary, icon, hasPage
  },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){ _id, name, postcode, "slug": slug.current },
  "suburbs": *[_type == "suburb"] | order(order asc, name asc){
    _id, name, postcode, hasPage, "slug": slug.current
  },
  "reviews": *[_type == "review"] | order(reviewedAt desc){
    _id, authorName, reviewedAt, rating, body, photo
  },
  "gallery": *[_type == "galleryItem"] | order(order asc){
    _id, caption, image
  }
}`;

// Every service that has its landing page switched on. Drives getStaticPaths.
export const SERVICE_PATHS_QUERY = /* groq */ `
  *[_type == "service" && hasPage == true && defined(slug.current)]{ "slug": slug.current }
`;

// One service landing page plus the shared lists it renders.
export const SERVICE_QUERY = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    accreditations[]{ name, url, logo }
  },
  "service": *[_type == "service" && slug.current == $slug][0]{
    title, "slug": slug.current, summary, icon,
    seoTitle, seoDescription,
    heroHeading, heroIntro, heroTicks, quoteHeading, quoteText,
    guaranteeEyebrow, guaranteeHeading, guaranteeText, guaranteeImage,
    processEyebrow, processHeading, processSteps[]{ title, text },
    diffEyebrow, diffHeading, diffIntro, diffItems[]{ title, text },
    workEyebrow, workHeading,
    brandsHeading, brandsText,
    relatedHeading, relatedServices[]->{ title, "slug": slug.current, summary, icon },
    ctaEyebrow, ctaHeading, ctaText,
    faqEyebrow, faqHeading, faqNote, faqs[]{ question, answer }
  },
  "rebates": *[_type == "rebatePage"][0]{
    bandText, lastVerified,
    "programs": programs[status == "open" && $slug in services[]->slug.current]{
      name, "anchor": anchor.current
    }
  },
  "navBrands": *[_type == "brand"] | order(order asc, name asc){ _id, name, kind, hasPage, "slug": slug.current },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "suburbs": *[_type == "suburb"] | order(order asc, name asc){ _id, name, postcode },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){ _id, name, postcode, "slug": slug.current },
  "brands": *[_type == "homePage"][0].brands,
  "gallery": *[_type == "galleryItem"] | order(order asc)[0...3]{ _id, caption, image }
}`;

// Every suburb with its landing page switched on. Drives getStaticPaths.
export const AREA_PATHS_QUERY = `
  *[_type == "suburb" && hasPage == true && defined(slug.current)]{ "slug": slug.current }
`;

// One suburb landing page plus the shared lists it renders.
export const AREA_QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    accreditations[]{ name, url, logo }
  },
  "area": *[_type == "suburb" && slug.current == $slug][0]{
    name, postcode, "slug": slug.current,
    seoTitle, seoDescription,
    heroImage,
    heroHeading, heroIntro, heroTicks,
    localHeading, localBody, localImage,
    servicesHeading, servicesIntro,
    jobsHeading, jobsIntro, jobsImage,
    commonJobs[]{ title, text, service->{ title, "slug": slug.current, hasPage } },
    nearbyHeading, nearby[]->{ name, "slug": slug.current, postcode, hasPage },
    ctaEyebrow, ctaHeading, ctaText,
    faqHeading, faqs[]{ question, answer }
  },
  "rebates": *[_type == "rebatePage"][0]{
    bandText, lastVerified,
    "programs": programs[status == "open"]{ name, "anchor": anchor.current }
  },
  "navBrands": *[_type == "brand"] | order(order asc, name asc){ _id, name, kind, hasPage, "slug": slug.current },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "reviews": *[_type == "review"] | order(reviewedAt desc){ _id, authorName, reviewedAt, rating, body, photo },
  "suburbs": *[_type == "suburb"] | order(order asc, name asc){ _id, name, postcode, hasPage, "slug": slug.current },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){ _id, name, postcode, "slug": slug.current },
  "contactImage": *[_type == "homePage"][0].contactImage
}`;


// The service areas index page.
export const AREAS_INDEX_QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    accreditations[]{ name, url, logo }
  },
  "navBrands": *[_type == "brand"] | order(order asc, name asc){ _id, name, kind, hasPage, "slug": slug.current },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){
    _id, name, postcode, "slug": slug.current, heroIntro
  },
  "suburbs": *[_type == "suburb"] | order(name asc){ _id, name, postcode, hasPage, "slug": slug.current }
}`;

// The about page plus the shared lists the header and footer render.
export const ABOUT_QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    accreditations[]{ name, url, logo }
  },
  "page": *[_type == "aboutPage"][0]{
    seoTitle, seoDescription,
    heroEyebrow, heroHeading, heroIntro,
    storyHeading, storyParagraphs, storyImage,
    businessEyebrow, businessHeading, businessBody, businessRows[]{ label, value }, businessPoints,
    contactEyebrow, contactHeading, contactIntro
  },
  "navBrands": *[_type == "brand"] | order(order asc, name asc){ _id, name, kind, hasPage, "slug": slug.current },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){
    _id, name, postcode, "slug": slug.current
  },
  "reviews": *[_type == "review"] | order(reviewedAt desc){ _id, authorName, reviewedAt, rating, body, photo },
  "contactImage": *[_type == "homePage"][0].contactImage
}`;

// Every brand with its page switched on. Drives getStaticPaths.
export const BRAND_PATHS_QUERY = `
  *[_type == "brand" && hasPage == true && defined(slug.current)]{ "slug": slug.current }
`;

// One brand page. The page is half product reference and half our own pitch,
// so it pulls the brand's own content plus the shared lists the chrome needs.
export const BRAND_QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    accreditations[]{ name, url, logo }
  },
  "brand": *[_type == "brand" && slug.current == $slug][0]{
    name, "slug": slug.current, kind, logo, summary,
    seoTitle, seoDescription,
    heroHeading, heroIntro, heroTicks, heroImage, quoteHeading, quoteText,
    certifiedHeading, certifiedText, certifiedBadge, certifiedPoints,
    installHeading, installIntro, installPoints[]{ title, text },
    productsHeading, productsIntro,
    products[]{ name, tagline, overview, bestFor, weInstall, image, power, rangePerHour, cableLength, connectivity, colours, warranty },
    specsHeading, specRows[]{ label, values },
    aboutHeading, aboutText, aboutPoints[]{ title, text },
    workHeading,
    relatedHeading, relatedServices[]->{ title, "slug": slug.current, summary, icon },
    faqHeading, faqs[]{ question, answer },
    ctaEyebrow, ctaHeading, ctaText
  },
  "navBrands": *[_type == "brand"] | order(order asc, name asc){ _id, name, kind, hasPage, "slug": slug.current },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "suburbs": *[_type == "suburb"] | order(order asc, name asc){ _id, name, postcode, hasPage, "slug": slug.current },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){ _id, name, postcode, "slug": slug.current }
}`;

// The brands index.
export const BRANDS_INDEX_QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    accreditations[]{ name, url, logo }
  },
  "navBrands": *[_type == "brand"] | order(order asc, name asc){ _id, name, kind, hasPage, "slug": slug.current },
  "brands": *[_type == "brand"] | order(order asc, name asc){
    _id, name, kind, hasPage, summary, logo, "slug": slug.current
  },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){ _id, name, postcode, "slug": slug.current },
  "contactImage": *[_type == "homePage"][0].contactImage
}`;

// The quote builder: the price list plus the boilerplate that wraps it.
export const QUOTE_BUILDER_QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    accreditations[]{ name, url, logo }
  },
  "quote": *[_type == "quoteSettings"][0]{
    introHeading, introText, validDays, gstRate,
    inclusions, exclusions, terms, closingNote
  },
  "items": *[_type == "quoteItem" && active == true] | order(order asc){
    _id, name, category, blurb, image, price, unit, allowQty, maxQty, priceNote, popular
  },
  "navBrands": *[_type == "brand"] | order(order asc, name asc){ _id, name, kind, hasPage, "slug": slug.current },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){ _id, name, postcode, "slug": slug.current }
}`;

// The rebates page. Programs carry references to the services they apply to,
// which is also what makes the band appear on those service pages - one list,
// linked from both ends.
export const REBATES_QUERY = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    accreditations[]{ name, url, logo }
  },
  "page": *[_type == "rebatePage"][0]{
    lastVerified, heroEyebrow, heroHeading, heroIntro,
    seoTitle, seoDescription,
    programs[]{
      name, "anchor": anchor.current, status, summary, amount, amountNote,
      eligibility, claimedBy, whatWeDo, officialName, officialUrl,
      "services": services[]->{ title, "slug": slug.current, icon, hasPage }
    },
    processEyebrow, processHeading, processSteps[]{ title, text },
    faqHeading, faqs[]{ question, answer },
    ctaHeading, ctaText
  },
  "navBrands": *[_type == "brand"] | order(order asc, name asc){ _id, name, kind, hasPage, "slug": slug.current },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){ _id, name, postcode, "slug": slug.current }
}`;

// Whether the rebates page is publishable. Used by the sitemap and the suburb
// pages, which only link to it once a human has checked the figures.
export const REBATES_STATUS_QUERY = /* groq */ `
  *[_type == "rebatePage"][0]{ lastVerified, bandText }
`;
