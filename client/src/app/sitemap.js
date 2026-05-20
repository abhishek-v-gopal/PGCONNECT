const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchProperties() {
  try {
    const response = await fetch(`${API_URL}/api/properties`, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data?.properties) ? data.properties : [];
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const now = new Date();
  const properties = await fetchProperties();

  const staticRoutes = [
    "",
    "/propertys",
    "/signin",
    "/register",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.8,
  }));

  const propertyRoutes = properties
    .filter((item) => item?._id)
    .map((item) => ({
      url: `${SITE_URL}/property/${item._id}`,
      lastModified: item?.updatedAt ? new Date(item.updatedAt) : now,
      changeFrequency: "daily",
      priority: 0.9,
    }));

  return [...staticRoutes, ...propertyRoutes];
}
