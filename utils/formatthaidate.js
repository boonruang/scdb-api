const { format } = require('date-fns');
const th = require('date-fns/locale/th');

const formatThaiDateBuddhistEra = (dateInput) => {
  if (!dateInput) return ''; // ป้องกัน undefined/null

  const d = new Date(dateInput);

  if (isNaN(d)) return ''; // ป้องกัน invalid date เช่น string ผิด format

  const formatted = format(d, 'd MMMM yyyy', { locale: th }); // 6 กรกฎาคม 2025
  const buddhistYear = d.getFullYear() + 543;
  return formatted.replace(d.getFullYear().toString(), buddhistYear.toString()); // เป็น พ.ศ.
};

module.exports = {
  formatThaiDateBuddhistEra,
};