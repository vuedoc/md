// invalid config: options.level should be >= 1

module.exports = {
  level: 0,
  parsing: {
    features: [ 'name', 'description', 'keywords', 'slots', 'model', 'props', 'events', 'methods' ],
    loaders: []
  }
};
