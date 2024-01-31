// returns true if strings contain numbers that are equal to first len digits
// e.g. cmpnum("123456", "123567", 3) returns 'true'

const cmpnum = (n1, n2, len) => {

    if(n1.length != n2.length) {
        return false;
    }

    if(n1.substring(0, len) == n2.substring(0, len)) {
        return true;
    }

    return false;
};

module.exports = { cmpnum };
