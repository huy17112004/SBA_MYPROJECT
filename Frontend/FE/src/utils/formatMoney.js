export function formatMoney(amount) {
  if (amount == null) return "0 đ";
  return amount.toLocaleString('vi-VN') + " đ";
}