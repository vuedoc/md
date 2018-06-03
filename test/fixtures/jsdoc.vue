<script>
  export default {
    name: 'checkbox',
    methods: {
      /**
      * Set the checkbox ID
      * @param {string} id - The checkbox ID
      * @param {string} [name] - The checkbox name
      * @param {number} [order=1] - The checkbox order
      * @param {string|string[]} [values] - The checkbox values
      * @param {*} [...rest] - The rest options
      * @return {boolean} True on success; ortherwise false
      */
      set (id, name, ...rest) {
        const status = true
        /**
        * Emitted the event `finished` when loaded
        * Multilign
        * @param {*} status - The finishing status
        */
        this.$emit('finished', status)
      }
    }
  }
</script>
