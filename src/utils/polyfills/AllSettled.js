const settler = Promise.allSettled ? Promise.allSettled.bind(Promise) : arr => {
  const promises = arr.map(x => Promise.resolve(x)
    .then(
      value => ({ status: `fulfilled`, value }),
      reason => ({ status: `rejected`, reason })
    )
  );
  return Promise.all(promises);
};

module.exports = settler;