// returns true if strings contain numbers that are equal to first len digits
// e.g. cmpnum("123456", "123567", 3) returns 'true'

// len should be short enough to fit js numbers
const cmpnum = (n1, n2, len) => {

    let padding1 = 0;
    let padding2 = 0;
    if(n1.length > n2.length) {
        padding1 = n1.length - n2.length;
    }
    if(n2.length > n1.length) {
        padding2 = n2.length - n1.length;
    }

    // now cut strings to desired comparison length
    let minlength = len + 1;
    if(n2.length < minlength) {
        minlength = n2.length;
    }
    if(n1.length < minlength) {
        minlength = n1.length;
    }

    n1cmp = n1.substring(0, minlength + padding1);
    n2cmp = n2.substring(0, minlength + padding2);

    n1num = parseInt(n1cmp, 10)
    n2num = parseInt(n2cmp, 10)

    if (Math.abs(n1num - n2num) < 10) {
        return true;
    }

    return false;
};

module.exports = { cmpnum };
