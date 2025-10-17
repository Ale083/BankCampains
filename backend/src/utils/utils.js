exports.redondear = (num) => {
    if (Number.isNaN(num)) return 0;
    return Math.round(num * 100) / 100
}

exports.isNum = (n) => Number.isFinite(n);
