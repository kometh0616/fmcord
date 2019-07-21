module.exports = date => {
  let res = ``;
  const diff = new Date(new Date() - date);
  const [year, month, day] = [
    diff.getFullYear() - 1970,
    diff.getMonth() + 1,
    diff.getDate()
  ];
  if (year > 0) {
    res += `${year} year${year > 1 ? `s ` : ` `}`;
  }
  if (month > 0) {
    res += `${month} month${month > 1 ? `s ` : ` `}`;
  }
  if (day > 0) {
    res += `${day} day${day > 1 ? `s ` : ` `}`;
  }
  return res;
};
