# checkbox

## events

| Name       | Description                                        | Arguments                                |
| ---------- | -------------------------------------------------- | ---------------------------------------- |
| `created`  | Emitted the event `created` when loaded Multilign  | **`status: any`** — The finishing status |
| `finished` | Emitted the event `finished` when loaded Multilign | **`status: any`** — The finishing status |

## methods

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

