import Link from "next/link";
import { cache } from "react";
import InquiryForm from "./InquiryForm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80";

const AMENITY_ICONS = {
  wifi: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  ),
  gym: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4M6 12h12" />
    </svg>
  ),
  security: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  meals: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    </svg>
  ),
  laundry: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <circle cx="12" cy="13" r="5" />
    </svg>
  ),
  ac: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    </svg>
  ),
};

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;

const getAmenityIconKey = (amenity) => {
  const normalized = String(amenity || "").toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("wifi") || normalized.includes("internet")) return "wifi";
  if (normalized.includes("gym")) return "gym";
  if (normalized.includes("security")) return "security";
  if (normalized.includes("meal") || normalized.includes("food")) return "meals";
  if (normalized.includes("laundry")) return "laundry";
  if (normalized.includes("ac") || normalized.includes("aircondition")) return "ac";
  return null;
};

const getPropertyById = cache(async (id) => {
  const response = await fetch(`${API_URL}/api/properties/${id}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data?.property || null;
});

const buildPropertyDescription = (property) => {
  const city = property?.location?.city || "India";
  const price = Number(property?.startingPrice || 0).toLocaleString("en-IN");
  const available = property?.availableBeds ?? 0;
  const tagline = property?.tagline || "Verified PG with detailed amenities and room information.";

  return `${tagline} Located in ${city}. Starting from INR ${price} per month with ${available} beds currently available.`;
};

const buildStructuredData = (property, propertyId, images) => {
  const url = `${SITE_URL}/property/${propertyId}`;
  const aggregateRating = property?.totalRatings > 0
    ? {
      "@type": "AggregateRating",
      ratingValue: property.rating || 0,
      ratingCount: property.totalRatings,
    }
    : undefined;

  const roomOffers = (property?.rooms || []).map((room) => ({
    "@type": "Offer",
    priceCurrency: "INR",
    price: room.price || 0,
    availability: room.availableBeds > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemOffered: {
      "@type": "Accommodation",
      name: `${property.name} - ${room.type}`,
      description: room.description || `${room.type} room option`,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property?.name || "PG Property",
    description: buildPropertyDescription(property),
    url,
    image: images,
    address: {
      "@type": "PostalAddress",
      streetAddress: property?.location?.address || "",
      addressLocality: property?.location?.city || "",
      addressRegion: property?.location?.landmark || "",
      addressCountry: "IN",
    },
    telephone: property?.manager?.phone || property?.owner?.phone || "",
    amenityFeature: (property?.amenities || []).map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
    aggregateRating,
    makesOffer: roomOffers,
  };
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return {
      title: "Property Not Found",
      description: "This property could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const image = property?.images?.[0] || FALLBACK_IMAGE;
  const title = `${property.name} in ${property?.location?.city || "India"}`;
  const description = buildPropertyDescription(property);
  const canonical = `/property/${id}`;

  return {
    title,
    description,
    keywords: [
      property.name,
      property?.location?.city,
      property?.location?.address,
      `${property?.gender || "co-ed"} pg`,
      "verified pg",
      "co-living",
      "pg near me",
    ].filter(Boolean),
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "PG Connect",
      images: [
        {
          url: image,
          alt: `${property.name} cover image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-slate-600">
        <div>
          <p className="text-lg font-semibold text-slate-800">Property not found</p>
          <p className="mt-2 text-sm">The listing may have been removed or the URL is invalid.</p>
          <Link href="/propertys" className="mt-5 inline-block rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600">
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const images = property?.images?.length ? property.images : [FALLBACK_IMAGE];
  const rooms = Array.isArray(property?.rooms) ? property.rooms : [];
  const amenities = Array.isArray(property?.amenities) ? property.amenities : [];
  const schema = buildStructuredData(property, id, images);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-bold text-blue-600">PG Connect</Link>
          <Link href="/propertys" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600">
            Back to Listings
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="bg-slate-100">
                <img src={images[0]} alt={property.name} className="h-[320px] w-full object-cover sm:h-[420px]" />
                {images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-5">
                    {images.slice(0, 10).map((image, index) => (
                      <img key={`${image}-${index}`} src={image} alt={`${property.name} image ${index + 1}`} className="h-20 w-full rounded-xl object-cover" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                    <span className="rounded-full bg-blue-50 px-3 py-1">{property.status || "verified"}</span>
                    {property.isVerified && <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">Verified</span>}
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{property.name}</h1>
                  <p className="mt-2 text-base text-slate-600">{property.tagline}</p>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">Location:</span> {property.location?.address || "-"}, {property.location?.city || "-"}</p>
                    <p><span className="font-semibold text-slate-900">Landmark:</span> {property.location?.landmark || "-"}</p>
                    <p><span className="font-semibold text-slate-900">Manager:</span> {property.manager?.name || "-"} {property.manager?.phone ? `(${property.manager.phone})` : ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Starting price</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(property.startingPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Beds available</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{property.availableBeds ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Rating</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{property.rating || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Views</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{property.views || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Amenities</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {amenities.map((amenity) => {
                  const iconKey = getAmenityIconKey(amenity);
                  return (
                    <span key={amenity} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {iconKey ? AMENITY_ICONS[iconKey] : null}
                      {amenity}
                    </span>
                  );
                })}
              </div>

              <h2 className="mt-8 text-xl font-bold">Rooms</h2>
              <div className="mt-4 space-y-3">
                {rooms.map((room) => (
                  <div key={room._id || room.type} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{room.type}</p>
                        <p className="mt-1 text-sm text-slate-600">{room.description || "No room description provided."}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(room.price)}</p>
                        <p className="text-sm text-slate-500">{room.availableBeds}/{room.totalBeds} beds available</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-6">
              <InquiryForm propertyId={String(property?._id || id)} />

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Owner</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{property.owner?.name || "-"}</p>
                  <p>{property.owner?.phone || "-"}</p>
                  <p>{property.owner?.avatar ? "Avatar available" : "No avatar provided"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Property Stats</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-500">Total beds</p>
                    <p className="mt-1 text-lg font-bold">{property.totalBeds || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-500">Inquiries</p>
                    <p className="mt-1 text-lg font-bold">{property.inquiries || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-500">Ratings</p>
                    <p className="mt-1 text-lg font-bold">{property.totalRatings || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-500">Gender</p>
                    <p className="mt-1 text-lg font-bold">{property.gender || "-"}</p>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
