# jsdoc.param.example

## Methods

### nameOnly()

Name only

**Syntax**

```typescript
nameOnly(somebody: unknow): void
```

### nameAndType()

Name and type

**Syntax**

```typescript
nameAndType(somebody: string): void
```

### nameTypeAndDescription()

Name, type, and description

**Syntax**

```typescript
nameTypeAndDescription(somebody: string): void
```

**Parameters**

- `somebody: string`<br/>
  Somebody's name.

### nameTypeAndDescriptionWithHyphen()

Name, type, and description, with a hyphen before the description

**Syntax**

```typescript
nameTypeAndDescriptionWithHyphen(somebody: string): void
```

**Parameters**

- `somebody: string`<br/>
  Somebody's name.

### withParameterProperties()

Assign the project to an employee.

**Syntax**

```typescript
withParameterProperties(employee: Object): void
```

**Parameters**

- `employee: Object`<br/>
  The employee who is responsible for the project.

- `employee.name: string`<br/>
  The name of the employee.

- `employee.department: string`<br/>
  The employee's department.

### withDestructuringParameter()

Assign the project to an employee.

**Syntax**

```typescript
withDestructuringParameter(employee: Object): void
```

**Parameters**

- `employee: Object`<br/>
  The employee who is responsible for the project.

- `employee.name: string`<br/>
  The name of the employee.

- `employee.department: string`<br/>
  The employee's department.

### withPropertiesOfValuesInAnArray()

Assign the project to a list of employees.

**Syntax**

```typescript
withPropertiesOfValuesInAnArray(employees: Object[]): void
```

**Parameters**

- `employees: Object[]`<br/>
  The employees who are responsible for the project.

- `employees[].name: string`<br/>
  The name of an employee.

- `employees[].department: string`<br/>
  The employee's department.

### withOptionalParameter()

An optional parameter (using JSDoc syntax)

**Syntax**

```typescript
withOptionalParameter(somebody?: string): void
```

**Parameters**

- `somebody?: string`<br/>
  Somebody's name.

### withOptionalParameterAndDefaultValue()

An optional parameter and default value

**Syntax**

```typescript
withOptionalParameterAndDefaultValue(somebody?: string = 'John Doe'): void
```

**Parameters**

- `somebody?: string = 'John Doe'`<br/>
  Somebody's name.

### withMultipleType()

Allows one type OR another type (type union)

**Syntax**

```typescript
withMultipleType(somebody?: string | string[] = John Doe): void
```

**Parameters**

- `somebody?: string | string[] = John Doe`<br/>
  Somebody's name, or an array of names.

### withAnyType()

Allows any type

**Syntax**

```typescript
withAnyType(somebody: any): void
```

**Parameters**

- `somebody: any`<br/>
  Whatever you want.

### withSpreadNotation()

Allows a parameter to be repeated.
Returns the sum of all numbers passed to the function.

**Syntax**

```typescript
withSpreadNotation(...num: number[]): unknow
```

**Parameters**

- `...num: number[]`<br/>
  A positive or negative number.

### doSomethingAsynchronously()

Does something asynchronously and executes the callback on completion.

**Syntax**

```typescript
doSomethingAsynchronously(cb: requestCallback): void
```

**Parameters**

- `cb: requestCallback`<br/>
  The callback that handles the response.
