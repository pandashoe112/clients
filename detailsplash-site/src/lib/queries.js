// One query fetches the whole homepage plus every list it renders.
export const HOME_QUERY = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, logo, phone, phoneHref, email, contactName,
    ratingValue, reviewCount, announcementText, serviceAreaLabel,
    footerBlurb, copyrightLine, footerNote, siteUrl
  },
  "page": *[_type == "homePage"][0]{
    seoTitle, seoDescription, ogTitle, ogDescription,
    heroHeading, heroLede, heroTicks, heroPrimaryCta, heroSecondaryCta, heroImage, heroImageAlt,
    introHeading, introLead, introImage, introImageAlt, introStatLabel,
    introFeatures[]{ icon, title, text },
    includedHeading, includedText, includedItems,
    servicesHeading, servicesIntro,
    compareEyebrow, compareHeading, compareIntro, vehicleSizes,
    comparePackages[]->{ _id, title, duration, priceFrom, vehiclePrices[]{ label, price }, ctaLabel, variant },
    compareGroups[]{ title, rows[]{ label, inFirst, inSecond } },
    ceramicNote,
    packagesEyebrow, packagesHeading, packagesIntro,
    helperHeading, helperText, helperCtaLabel,
    addonsEyebrow, addonsHeading, addonsIntro,
    customHeading, customText, customCtaLabel,
    clubHeading, clubIntro, clubCtaLabel, clubLead, clubLeadBold,
    cadences[]{ title, unit, text, featured }, clubPoints,
    howEyebrow, howHeading, howSteps[]{ kicker, title, text },
    whyHeading, whyText, whyPoints, whyImage, whyImageAlt, whyPrimaryCta, whySecondaryCta,
    snapEyebrow, snapHeading, snapText, snapCtaLabel, snapImage, snapImageAlt,
    galleryEyebrow, galleryHeading, galleryIntro,
    reviewsHeading, reviewsNote, reviewsCtaLabel, reviewsFootNote,
    areasHeading, areasText, areasNote, areasImage,
    faqEyebrow, faqHeading, faqIntro,
    bookHeading, bookLede, bookPoints, bookImage,
    formHeading, formText,
    formServiceLabel, formServiceOptions[]{ label, price },
    formVehicleLabel, formVehicleOptions,
    formDetailsLabel, formSubmitLabel, formFootNote,
    trustStrip
  },
  "services": *[_type == "service"] | order(order asc){ _id, title, text, icon },
  "packages": *[_type == "package"] | order(order asc){
    _id, title, subtitle, priceFrom, priceNote, shortText, plainEnglish, duration,
    vehiclePrices[]{ label, price }, features, ctaLabel, variant
  },
  "addons": *[_type == "addon"] | order(order asc){ _id, title, text, price, icon },
  "gallery": *[_type == "galleryItem"] | order(order asc){ _id, image, caption, alt },
  "reviews": *[_type == "review"] | order(order asc){ _id, authorName, rating, body, meta, photo },
  "areas": *[_type == "areaGroup"] | order(order asc){ _id, title, suburbs },
  "faqs": *[_type == "faq"] | order(order asc){ _id, question, answer }
}`;
