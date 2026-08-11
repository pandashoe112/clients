// One query fetches the whole homepage plus the shared lists it renders.
export const HOME_QUERY = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl,
    announcementText, announcementCtaLabel
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
  "services": *[_type == "service"] | order(order asc){
    _id, title, slug, summary, icon, hasPage
  },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){ _id, name, postcode, "slug": slug.current },
  "suburbs": *[_type == "suburb"] | order(order asc, name asc){
    _id, name, postcode
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
    ratingValue, reviewCount, instagramUrl, facebookUrl
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
    ratingValue, reviewCount, instagramUrl, facebookUrl
  },
  "area": *[_type == "suburb" && slug.current == $slug][0]{
    name, postcode, "slug": slug.current,
    seoTitle, seoDescription,
    heroHeading, heroIntro, heroTicks,
    localHeading, localBody, localImage,
    servicesHeading, servicesIntro,
    nearbyHeading, nearby[]->{ name, "slug": slug.current, postcode, hasPage },
    ctaEyebrow, ctaHeading, ctaText,
    faqHeading, faqs[]{ question, answer }
  },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "reviews": *[_type == "review"] | order(reviewedAt desc)[0...3]{ _id, authorName, reviewedAt, rating, body, photo },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){ _id, name, postcode, "slug": slug.current }
}`;


// The service areas index page.
export const AREAS_INDEX_QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, phone, phoneHref, email, licence, established,
    ratingValue, reviewCount, instagramUrl, facebookUrl
  },
  "services": *[_type == "service"] | order(order asc){ _id, title, slug, summary, icon, hasPage },
  "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)] | order(order asc, name asc){
    _id, name, postcode, "slug": slug.current, heroIntro
  },
  "suburbs": *[_type == "suburb"] | order(name asc){ _id, name, postcode, hasPage, "slug": slug.current }
}`;
