# checkbox

## Events

| Name       | Description                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `created`  | Emitted the event `created` when loaded Multilign<br>**Arguments**<br><ul><li>**`status: any`** — The finishing status</li></ul>  |
| `finished` | Emitted the event `finished` when loaded Multilign<br>**Arguments**<br><ul><li>**`status: any`** — The finishing status</li></ul> |

## Methods

### set()

Set the checkbox ID

**Syntax**

```ts
set(id: string, name?: string, order: number = 1, values?: string | string[]): boolean
```

**Parameters**

- **`id`**<br>
  The checkbox ID

- **`name`**<br>
  The checkbox name

- **`order`**<br>
  The checkbox order

- **`values`**<br>
  The checkbox values

- **`...rest`**<br>
  The rest options

**Return value**

True on success; ortherwise false

