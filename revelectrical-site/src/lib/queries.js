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
    _id, title, slug, summary, icon
  },
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
  "brands": *[_type == "homePage"][0].brands,
  "gallery": *[_type == "galleryItem"] | order(order asc)[0...3]{ _id, caption, image }
}`;
