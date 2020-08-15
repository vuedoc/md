# jsdoc.returns.example

## Methods

### withType()

Returns the sum of a and b

**Syntax**

```typescript
withType(a: number, b: number): number
```

### withMultipleType()

Returns the sum of a and b

**Syntax**

```typescript
withMultipleType(a: number, b: number, retArr: boolean): number | Array
```

**Parameters**

- **`a: number`**

- **`b: number`**

- **`retArr: boolean`**<br>
  If set to true, the function will return an array

**Return value**

Sum of a and b or an array that contains a, b and the sum of a and b.

### withPromise()

Returns the sum of a and b

**Syntax**

```typescript
withPromise(a: number, b: number): Promise
```

**Return value**

Promise object represents the sum of a and b

