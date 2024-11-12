const Filter = require('bad-words');
const filter = new Filter();

const badWordsFilter = (req, res, next) => {
    if (req.body.note) {
        req.body.note = filter.clean(req.body.note);
    }
    next();
};

module.exports = badWordsFilter;
