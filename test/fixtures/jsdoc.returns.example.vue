<script>
export default {
  methods: {
    /**
     * Returns the sum of a and b
     * @param {number} a
     * @param {number} b
     * @returns {number}
     */
    withType(a, b) {
        return a + b;
    },

    /**
     * Returns the sum of a and b
     * @param {number} a
     * @param {number} b
     * @param {boolean} retArr If set to true, the function will return an array
     * @returns {(number|Array)} Sum of a and b or an array that contains a, b and the sum of a and b.
     */
    withMultipleType(a, b, retArr) {
      if (retArr) {
          return [a, b, a + b];
      }
      return a + b;
    },

    /**
     * Returns the sum of a and b
     * @param {number} a
     * @param {number} b
     * @returns {Promise} Promise object represents the sum of a and b
     */
    withPromise(a, b) {
      return new Promise(function(resolve, reject) {
        resolve(a + b);
      });
    }
  }
}
</script>
