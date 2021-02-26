export const finalPrice = (price, interest = 0.3, shipping = 0) => Math.ceil(price / (1 - interest) + (shipping ?? 0));
