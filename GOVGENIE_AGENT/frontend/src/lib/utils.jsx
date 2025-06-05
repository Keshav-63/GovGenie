export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(number) {
  return new Intl.NumberFormat().format(number)
}

export function formatDate(date) {
  // if (!date) return "N/A"; // Handle null or undefined dates
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return "N/A"; 
    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
}

