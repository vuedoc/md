# methods

## nameOnly()

Name only

**Syntax**

```ts
nameOnly(somebody: any): void
```

**Parameters**

- **`somebody`**

## nameAndType()

Name and type

**Syntax**

```ts
nameAndType(somebody: string): void
```

**Parameters**

- **`somebody`**

## nameTypeAndDescription()

Name, type, and description

**Syntax**

```ts
nameTypeAndDescription(somebody: string): void
```

**Parameters**

- **`somebody`**<br>
  Somebody's name.

## nameTypeAndDescriptionWithHyphen()

Name, type, and description, with a hyphen before the description

**Syntax**

```ts
nameTypeAndDescriptionWithHyphen(somebody: string): void
```

**Parameters**

- **`somebody`**<br>
  Somebody's name.

## withParameterProperties()

Assign the project to an employee.

**Syntax**

```ts
withParameterProperties(employee: Object): void
```

**Parameters**

- **`employee`**<br>
  The employee who is responsible for the project.

- **`employee.name`**<br>
  The name of the employee.

- **`employee.department`**<br>
  The employee's department.

## withDestructuringParameter()

Assign the project to an employee.

**Syntax**

```ts
withDestructuringParameter(employee: Object): void
```

**Parameters**

- **`employee`**<br>
  The employee who is responsible for the project.

- **`employee.name`**<br>
  The name of the employee.

- **`employee.department`**<br>
  The employee's department.

## withPropertiesOfValuesInAnArray()

Assign the project to a list of employees.

**Syntax**

```ts
withPropertiesOfValuesInAnArray(employees: Object[]): void
```

**Parameters**

- **`employees`**<br>
  The employees who are responsible for the project.

- **`employees[].name`**<br>
  The name of an employee.

- **`employees[].department`**<br>
  The employee's department.

## withOptionalParameter()

An optional parameter (using JSDoc syntax)

**Syntax**

```ts
withOptionalParameter(somebody?: string): void
```

**Parameters**

- **`somebody`**<br>
  Somebody's name.

## withOptionalParameterAndDefaultValue()

An optional parameter and default value

**Syntax**

```ts
withOptionalParameterAndDefaultValue(somebody: string = 'John Doe'): void
```

**Parameters**

- **`somebody`**<br>
  Somebody's name.

## withMultipleType()

Allows one type OR another type (type union)

**Syntax**

```ts
withMultipleType(somebody: string | string[] = John Doe): void
```

**Parameters**

- **`somebody`**<br>
  Somebody's name, or an array of names.

## withAnyType()

Allows any type

**Syntax**

```ts
withAnyType(somebody: any): void
```

**Parameters**

- **`somebody`**<br>
  Whatever you want.

## withSpreadNotation()

Allows a parameter to be repeated.
Returns the sum of all numbers passed to the function.

**Syntax**

```ts
withSpreadNotation(...num: number[]): void
```

**Parameters**

- **`num`**<br>
  A positive or negative number.

## doSomethingAsynchronously()

Does something asynchronously and executes the callback on completion.

**Syntax**

```ts
doSomethingAsynchronously(cb: requestCallback): void
```

**Parameters**

- **`cb`**<br>
  The callback that handles the response.

