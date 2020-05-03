<script>
export default Vue.extend({
  methods: {
    //
    // Names, types, and descriptions
    // The following examples show how to include names, types, and
    // descriptions in a @param tag.
    //

    /**
     * Name only
     * @param somebody
     */
    nameOnly(somebody) {
      alert('Hello ' + somebody);
    },

    /**
     * Name and type
     * @param {string} somebody
     */
    nameAndType(somebody) {
      alert('Hello ' + somebody);
    },

    /**
     * Name, type, and description
     * @param {string} somebody Somebody's name.
     */
    nameTypeAndDescription(somebody) {
      alert('Hello ' + somebody);
    },

    /**
     * Name, type, and description, with a hyphen before the description
     * @param {string} somebody - Somebody's name.
     */
    nameTypeAndDescriptionWithHyphen(somebody) {
      alert('Hello ' + somebody);
    },

    //
    // Documenting a parameter's properties
    // If a parameter is expected to have a specific property, you can
    // document that property by providing an additional @param tag. For
    // example, if an employee parameter is expected to have name and
    // department properties, you can document it as follows:
    //

    /**
     * Assign the project to an employee.
     * @param {Object} employee - The employee who is responsible for the project.
     * @param {string} employee.name - The name of the employee.
     * @param {string} employee.department - The employee's department.
     */
    withParameterProperties(employee) {
      // ...
    },

    /**
     * Assign the project to an employee.
     * @param {Object} employee - The employee who is responsible for the project.
     * @param {string} employee.name - The name of the employee.
     * @param {string} employee.department - The employee's department.
     */
    withDestructuringParameter({ name, department }) {
      // ...
    },

    /**
     * Assign the project to a list of employees.
     * @param {Object[]} employees - The employees who are responsible for the project.
     * @param {string} employees[].name - The name of an employee.
     * @param {string} employees[].department - The employee's department.
     */
    withPropertiesOfValuesInAnArray(employees) {
      // ...
    },

    /**
     * An optional parameter (using JSDoc syntax)
     * @param {string} [somebody] - Somebody's name.
     */
    withOptionalParameter(somebody) {
      if (!somebody) {
        somebody = 'John Doe';
      }

      alert('Hello ' + somebody);
    },

    /**
     * An optional parameter and default value
    * @param {string} [somebody=John Doe] - Somebody's name.
    */
    withOptionalParameterAndDefaultValue(somebody) {
        if (!somebody) {
            somebody = 'John Doe';
        }
        alert('Hello ' + somebody);
    },

    //
    // Multiple types and repeatable parameters
    // The following examples show how to use type expressions to indicate
    // that a parameter can accept multiple types (or any type), and that a
    // parameter can be provided more than once. See the @type tag
    // documentation for details about the type expressions that JSDoc
    // supports.
    //

    /**
     * Allows one type OR another type (type union)
     * @param {(string|string[])} [somebody=John Doe] - Somebody's name, or an array of names.
     */
    withMultipleType(somebody) {
      if (!somebody) {
        somebody = 'John Doe';
      } else if (Array.isArray(somebody)) {
        somebody = somebody.join(', ');
      }

      alert('Hello ' + somebody);
    },

    /**
     * Allows any type
     * @param {*} somebody - Whatever you want.
     */
    withAnyType(somebody) {
      console.log('Hello ' + JSON.stringify(somebody));
    },

    /**
     * Allows a parameter to be repeated.
     * Returns the sum of all numbers passed to the function.
     * @param {...number} num - A positive or negative number.
     */
    withSpreadNotation(num) {
      var i = 0, n = arguments.length, t = 0;
      for (; i < n; i++) {
          t += arguments[i];
      }
      return t;
    },

    //
    // Callback functions
    // If a parameter accepts a callback function, you can use the @callback
    // tag to define a callback type, then include the callback type in the
    // @param tag.
    //

    /**
     * This callback type is called `requestCallback` and is displayed as a global symbol.
     *
     * @callback requestCallback
     * @param {number} responseCode
     * @param {string} responseMessage
     */

    /**
     * Does something asynchronously and executes the callback on completion.
     * @param {requestCallback} cb - The callback that handles the response.
     */
    doSomethingAsynchronously(cb) {
      // code
    }
  }
})
</script>
