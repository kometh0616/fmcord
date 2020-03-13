export default (date: Date): string => {
    let res = ``;
    const diff = new Date(new Date().getTime() - date.getTime());
    const [year, month, day]: number[] = [
        diff.getFullYear() - 1970,
        diff.getMonth(),
        diff.getDate() - 1
    ];
    if (year > 0) {
        res += `${year} year${year > 1 ? `s ` : ` `}`;
    }
    if (month > 0) {
        res += `${month} month${month > 1 ? `s ` : ` `}`;
    }
    if (day > 0) {
        res += `${day} day${day > 1 ? `s` : ``}`;
    }
    return res;
};