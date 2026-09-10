export const PLACEHOLDER_DISH = "/dishes/dish-placeholder.png";

export const DEFAULT_DISH_IMAGES: Record<string, string> = {
  m1: "/dishes/chicken-karahi.png",
  m2: "/dishes/mutton-karahi.png",
  m3: "/dishes/chicken-biryani.png",
  m4: "/dishes/chicken-tikka.png",
  m5: "/dishes/seekh-kabab.png",
  m6: "/dishes/garlic-naan.png",
  m7: "/dishes/plain-naan.png",
  m8: "/dishes/fresh-lime.png",
  m9: "/dishes/soft-drink.png",
  m10: "/dishes/kheer.png",
};

const BY_NAME: Record<string, string> = {
  "chicken karahi": "/dishes/chicken-karahi.png",
  "mutton karahi": "/dishes/mutton-karahi.png",
  "chicken biryani": "/dishes/chicken-biryani.png",
  "chicken tikka": "/dishes/chicken-tikka.png",
  "seekh kabab": "/dishes/seekh-kabab.png",
  "garlic naan": "/dishes/garlic-naan.png",
  "plain naan": "/dishes/plain-naan.png",
  "fresh lime": "/dishes/fresh-lime.png",
  "soft drink": "/dishes/soft-drink.png",
  kheer: "/dishes/kheer.png",
};

export function dishImage(item: { id?: string; name?: string; image?: string }) {
  if (item.image?.trim()) return item.image.trim();
  if (item.id && DEFAULT_DISH_IMAGES[item.id]) return DEFAULT_DISH_IMAGES[item.id];
  const named = item.name ? BY_NAME[item.name.trim().toLowerCase()] : undefined;
  return named ?? PLACEHOLDER_DISH;
}
