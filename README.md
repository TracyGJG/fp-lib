# fp-lib

A small library of Functional Programming functions

# Tools

- [compose](#compose)
- [curry](#curry)
- [lens](#lens)
- [memoise](#memoise)

---

## [compose](:#compose)

Combines a list of monadic (single parameter) functions into a single new function that expects a single input parameter.

### Parameters

- args: a number of monadic (single parameter) functions.

### Return Value

A new monadic function that is a combination of all those provided.

## [curry](:#curry)

Converts the given variadic function into one that expects arguments to be supplied one at a time.

### Parameters

- fn: variadic function to convert into a curried function.
- \_args: private array of arguments accumulated prior to execution.

### Return Value

A curried function.

## [lens](:#lens)

Creates a repeatable function for extracting values out of objects/arrays at a given location (property/subscript).

### Parameters

- props: one or more propertyNames or array subscripts, either individually or in strings.

### Return Value

A lookup function to return the value of a property at the stated location, for a given object.

## [lensFn](:#lens)

Creates a repeatable function for extracting values out of objects/arrays at a given location (property/subscript) and apply the specified function on the property and the entire object.

### Parameters

- fn: transformation to be applied to each value returned by the lens operation.
- props: one or more propertyNames or array subscripts, either individually or in strings.

### Return Value

A lookup function to lookup the value of a property at the stated location, for a given object, and return the value of an applied function.

## [memoise](:#memoise)

Converts the given pure function into on that is optimised using memoisation (caching.)

### Parameters

- fn: pure function to convert into a memoised function.
- \_cache: private cache of function executions.

### Return Value

A memoised function.

---
