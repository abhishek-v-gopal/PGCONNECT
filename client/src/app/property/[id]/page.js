import Link from "next/link";
import { cache } from "react";
import InquiryForm from "./InquiryForm";
import BookingForm from "./BookingForm";
import ReviewForm from "./ReviewForm";
import Gallery from "./Gallery";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
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

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

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

const getPropertyReviews = cache(async (id) => {
  const response = await fetch(`${API_URL}/api/reviews/property/${id}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) return { reviews: [], total: 0 };
  const data = await response.json();
  return { reviews: data?.reviews ?? [], total: data?.total ?? 0 };
});

const buildPropertyDescription = (property) => {
  const city = property?.city || "India";
  const price = Number(property?.starting_price || 0).toLocaleString("en-IN");
  const available = property?.available_beds ?? 0;
  const tagline = property?.tagline || "Verified PG with detailed amenities and room information.";

  return `${tagline} Located in ${city}. Starting from INR ${price} per month with ${available} beds currently available.`;
};

const buildStructuredData = (property, propertyId, images) => {
  const url = `${SITE_URL}/property/${propertyId}`;
  const aggregateRating = property?.total_ratings > 0
    ? {
      "@type": "AggregateRating",
      ratingValue: property.rating || 0,
      ratingCount: property.total_ratings,
    }
    : undefined;

  const roomOffers = (property?.property_rooms || []).map((room) => ({
    "@type": "Offer",
    priceCurrency: "INR",
    price: room.price || 0,
    availability: room.available_beds > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
      streetAddress: property?.address || "",
      addressLocality: property?.city || "",
      addressRegion: property?.landmark || "",
      addressCountry: "IN",
    },
    telephone: property?.manager_phone || property?.owner?.phone || "",
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

  const image = property?.property_images?.[0]?.image_url || FALLBACK_IMAGE;
  const title = `${property.name} in ${property?.city || "India"}`;
  const description = buildPropertyDescription(property);
  const canonical = `/property/${id}`;

  return {
    title,
    description,
    keywords: [
      property.name,
      property?.city,
      property?.address,
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
      <div className="min-h-screen bg-[#EFF6FF] text-[#1E3A5F]">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-24 text-center text-[#1E3A5F80]">
          <div>
            <p className="text-lg font-semibold text-[#1E3A5F]">Property not found</p>
            <p className="mt-2 text-sm">The listing may have been removed or the URL is invalid.</p>
            <Link href="/propertys" className="mt-5 inline-block rounded-full border border-[#bfdbfe] px-4 py-2 text-sm font-semibold text-[#1E3A5F] hover:border-blue-300 hover:text-[#1D4ED8]">
              Back to Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { reviews, total: reviewsTotal } = await getPropertyReviews(id);
  const images = property?.property_images?.length
    ? property.property_images.slice().sort((a, b) => a.position - b.position).map((img) => img.image_url)
    : [FALLBACK_IMAGE];
  const rooms = Array.isArray(property?.property_rooms) ? property.property_rooms : [];
  const amenities = Array.isArray(property?.amenities) ? property.amenities : [];
  const schema = buildStructuredData(property, id, images);

  return (
    <div className="min-h-screen bg-[#EFF6FF] text-[#1E3A5F]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/propertys" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:opacity-80 transition-opacity">
          &larr; Back to Listings
        </Link>
        <div className="space-y-6">
          <Reveal as="section" className="overflow-hidden rounded-3xl border border-[#bfdbfe] bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
              <Gallery images={images} name={property.name} />

              <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1D4ED8]">
                    {/* <span className="rounded-full bg-[#dbeafe] px-3 py-1">{property.status || "verified"}</span> */}
                    {property.is_verified && <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">Verified</span>}
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{property.name}</h1>
                  <p className="mt-2 text-base text-[#1E3A5F80]">{property.tagline}</p>

                  <div className="mt-5 space-y-3 text-sm text-[#1E3A5F80]">
                    <p><span className="font-semibold text-[#1E3A5F]">Location:</span> {property.address || "-"}, {property.city || "-"}</p>
                    <p><span className="font-semibold text-[#1E3A5F]">Landmark:</span> {property.landmark || "-"}</p>
                    <p><span className="font-semibold text-[#1E3A5F]">Manager:</span> {property.manager_name || "-"} {property.manager_phone ? `(${property.manager_phone})` : ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#EFF6FF] p-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#1E3A5F60]">Starting price</p>
                    <p className="mt-1 text-xl font-bold text-[#1E3A5F]">{formatCurrency(property.starting_price)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#1E3A5F60]">Beds available</p>
                    <p className="mt-1 text-xl font-bold text-[#1E3A5F]">{property.available_beds ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#1E3A5F60]">Rating</p>
                    <p className="mt-1 text-xl font-bold text-[#1E3A5F]">{property.rating || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#1E3A5F60]">Views</p>
                    <p className="mt-1 text-xl font-bold text-[#1E3A5F]">{property.views || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Reveal direction="right" className="rounded-3xl border border-[#bfdbfe] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Amenities</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {amenities.map((amenity) => {
                  const iconKey = getAmenityIconKey(amenity);
                  return (
                    <span key={amenity} className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#EFF6FF] px-3 py-2 text-sm text-[#1E3A5F] transition-colors hover:border-[#1D4ED8]">
                      {iconKey ? AMENITY_ICONS[iconKey] : null}
                      {amenity}
                    </span>
                  );
                })}
              </div>

              <h2 className="mt-8 text-xl font-bold">Rooms</h2>
              <div className="mt-4 space-y-3">
                {rooms.map((room) => (
                  <div key={room.id || room.type} className="rounded-2xl border border-[#bfdbfe] p-4 transition-all hover:border-[#1D4ED8] hover:shadow-md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1E3A5F]">{room.type}</p>
                        <p className="mt-1 text-sm text-[#1E3A5F80]">{room.description || "No room description provided."}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#1E3A5F]">{formatCurrency(room.price)}</p>
                        <p className="text-sm text-[#1E3A5F60]">{room.available_beds}/{room.total_beds} beds available</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal direction="left" delay={0.1} as="aside" className="space-y-6">
              <BookingForm propertyId={id} rooms={rooms} />
              <InquiryForm propertyId={id} />

              <div className="rounded-3xl border border-[#bfdbfe] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Manager</h2>
                <div className="mt-4 space-y-2 text-sm text-[#1E3A5F80]">
                  <p className="font-semibold text-[#1E3A5F]">{property.manager_name || "-"}</p>
                  <p>{property.manager_phone || "-"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-[#bfdbfe] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Property Stats</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-[#EFF6FF] p-3">
                    <p className="text-[#1E3A5F60]">Total beds</p>
                    <p className="mt-1 text-lg font-bold">{property.total_beds || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-[#EFF6FF] p-3">
                    <p className="text-[#1E3A5F60]">Inquiries</p>
                    <p className="mt-1 text-lg font-bold">{property.inquiries_count || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-[#EFF6FF] p-3">
                    <p className="text-[#1E3A5F60]">Ratings</p>
                    <p className="mt-1 text-lg font-bold">{property.total_ratings || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-[#EFF6FF] p-3">
                    <p className="text-[#1E3A5F60]">Gender</p>
                    <p className="mt-1 text-lg font-bold">{property.gender || "-"}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Reveal direction="right" className="rounded-3xl border border-[#bfdbfe] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Reviews</h2>
                {property.total_ratings > 0 && (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-[#1E3A5F]">
                    <span style={{ color: "#F97316" }}>★</span> {property.rating} <span className="font-normal text-[#1E3A5F60]">({property.total_ratings})</span>
                  </span>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="mt-4 text-sm text-[#1E3A5F80]">No reviews yet. Be the first to share your experience.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-[#bfdbfe] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#1E3A5F]">
                            {r.tenant?.first_name || "Anonymous"} {r.tenant?.last_name?.[0] ? `${r.tenant.last_name[0]}.` : ""}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} style={{ color: s <= r.rating ? "#F97316" : "#e2e8f0" }}>★</span>
                            ))}
                            {r.is_verified_stay && (
                              <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">Verified Stay</span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-[#1E3A5F60]">
                          {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-[#1E3A5F80]">{r.comment}</p>}
                    </div>
                  ))}
                  {reviewsTotal > reviews.length && (
                    <p className="text-xs text-[#1E3A5F60]">Showing {reviews.length} of {reviewsTotal} reviews</p>
                  )}
                </div>
              )}
            </Reveal>

            <Reveal direction="left" delay={0.1}>
              <ReviewForm propertyId={id} />
            </Reveal>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
