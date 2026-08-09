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
    _id, authorName, reviewedAt, rating, body
  },
  "gallery": *[_type == "galleryItem"] | order(order asc){
    _id, caption, image
  }
}`;
