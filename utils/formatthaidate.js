const { format } = require('date-fns');
const th = require('date-fns/locale/th');

const formatThaiDateBuddhistEra = (dateInput) => {
  if (!dateInput) return "";
  const christianYear = format(dateInput, "yyyy", { locale: th });
  const buddhistYear = parseInt(christianYear, 10) + 543;
  return format(dateInput, `d MMMM '${buddhistYear}'`, { locale: th });
}

module.exports = {
  formatThaiDateBuddhistEra,
};