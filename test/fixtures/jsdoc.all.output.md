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

```typescript
set(id: string, name?: string, order?: number = 1, values?: string | string[], ...rest: unknow[]): boolean
```

**Parameters**

- **`id: string`**<br>
  The checkbox ID

- **`name?: string`**<br>
  The checkbox name

- **`order?: number = 1`**<br>
  The checkbox order

- **`values?: string | string[]`**<br>
  The checkbox values

- **`...rest?: any`**<br>
  The rest options

- **`...rest: unknow[]`**

**Return value**

True on success; ortherwise false

