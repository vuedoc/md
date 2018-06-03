# checkbox 

A simple checkbox component 

- **author** - Sébastien 
- **license** - MIT 
- **input** 

## slots 

- `default`  

- `label` Use this slot to set the checkbox label 

## props 

- `model` ***Array*** (*required*) 

   The checkbox model 

- `disabled` ***Boolean*** (*optional*) 

   Initial checkbox state 

- `enabled` ***Boolean*** (*optional*) `default: true` 

   Initial checkbox value 

- `label` ***String*** (*optional*) `default: 'Unamed checkbox'` 

   The checkbox label 

- `object` ***Object*** (*optional*) `default: null` 

- `bool-false` ***Boolean*** (*optional*) `default: false` 

## data 

- `initialValue` 

   The initial component value. Used to detect changes and restore the initial value. 

**initial value:** `''` 

- `currentValue` 

**initial value:** `''` 

## computed properties 

- `id` 

   The component identifier. Generated using the `initialValue` data. 

   **dependencies:** `initialValue` 

- `changed` 

   **dependencies:** `currentValue`, `initialValue` 

- `withNoDependencies` 

## events 

- `loaded` 

   Emitted when the component has been loaded 

- `enabled` 

   Emitted the event `enabled` when loaded Multilign 

## methods 

- `check()` 

   Check if the input is checked 

- `prop()` 

- `dynamic()` 

   Make component dynamic 

- `dynamic2()` 

   Enter to dynamic mode 

- `enable(value)` 

   Enable the checkbox 

