// The whole site is two documents: the home page and the site settings.
// Everything the page renders lives inside the home page document.
export const HOME_QUERY = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    businessName, logo, phone, phoneHref, email, contactName,
    ratingValue, reviewCount, announcementText, serviceAreaLabel,
    footerBlurb, copyrightLine, footerNote, siteUrl
  },
  "page": *[_type == "homePage"][0]{
    seoTitle, seoDescription, ogTitle, ogDescription,

    heroHeading, heroLede, heroTicks, heroPrimaryCta, heroSecondaryCta,
    heroImage, heroImageAlt,

    introHeading, introLead, introImage, introImageAlt, introStatLabel,
    introFeatures[]{ icon, title, text },
    includedHeading, includedText, includedItems,

    servicesHeading, servicesIntro,
    services[]{ title, text, icon },

    packagesEyebrow, packagesHeading, packagesIntro,
    packages[]{
      title, subtitle, priceFrom, shortText, plainEnglish, duration,
      vehiclePrices[]{ label, price },
      inclusions[]{ title, items },
      ctaLabel
    },

    addonsEyebrow, addonsHeading, addonsIntro,
    addons[]{ title, text, price, icon },
    customHeading, customText, customCtaLabel,

    clubHeading, clubIntro, clubCtaLabel, clubLead, clubLeadBold,
    cadences[]{ title, unit, text, featured }, clubPoints,

    howEyebrow, howHeading, howSteps[]{ kicker, title, text },

    whyHeading, whyText, whyPoints, whyImage, whyImageAlt,
    whyPrimaryCta, whySecondaryCta,

    snapEyebrow, snapHeading, snapText, snapCtaLabel, snapImage, snapImageAlt,
    galleryEyebrow, galleryHeading, galleryIntro,
    gallery[]{ image, caption, alt },
    reviewsHeading, reviewsNote, reviewsCtaLabel, reviewsFootNote,
    reviews[]{ authorName, rating, body, meta, photo },

    areasHeading, areasText, areasNote, areasImage,
    areas[]{ title, suburbs },

    faqEyebrow, faqHeading, faqIntro,
    faqs[]{ question, answer },

    bookHeading, bookLede, bookPoints, bookImage,
    formHeading, formText,
    formServiceLabel, formServiceOptions[]{ label, price },
    formVehicleLabel, formVehicleOptions,
    formDetailsLabel, formSubmitLabel, formFootNote,
    trustStrip
  }
}`;
