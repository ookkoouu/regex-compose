# regex-compose

Simple Reusable Typed RegExp

## Features

### Basic Usage

```ts
import { r, maybe, or, seq } from "@okou/regex-compose";

// URL
const short = r`youtu\.be`;
const long = r`${maybe(r`www\.`)}youtube\.com`;
const host = r`https?://${or(short, long)}`;
const url = r`${host}/watch\?v=([\w-]+)`;

// Number
const digits = r`[0-9]+`;
const oneNine = r`[1-9]`;
const int = r`${maybe("-")}${maybe(oneNine)}${digits}`;
const fract = r`\.${digits}${oneNine}`;
const number = seq(int, maybe(fract));
```

### Typed named-capture

```ts
import { r, ncap } from "@okou/regex-compose";

const a = ncap("aaa", "a+");
const b = r`${a}${ncap("bbb", b+)}`;
const c = ncap("ccc", a, b);

c.exec("")?.groups.| // = RegExpT<"aaa"|"bbb"|"ccc">
                    _____________________________
                    | aaa?    string | undefined
                    | bbb?    string | undefined
                    | ccc?    string | undefined
```

### Helpers

```ts
// Core
seq(...expr)               // abc
or(...expr)                // (?:a|b|c)
flag(flags, regexp)         // /regexp/flags

// Quantifiers
quantity(suffix, ...expr)  // (?:...)suffix
maybe(...expr)             // ?
maybeL(...expr)            // ??
many0(...expr)             // *
many0L(...expr)            // *?
many1(...expr)             // +
many1(...expr)             // +?
releat(count, ...expr)     // {1}  {2,}  {0,3}
releatL(count, ...expr)    // {1}? {2,}? {0,3}?

// Captures & Refs
cap(...expr)               // (...)
ncap(...expr)              // (?<group>...)
ref(number or label)       // \1  \k<label>
modifier(flag, ...expr)    // (?ims-ims:...)

// Assertions
lookAhead(...expr)            // (?=...)
notAhead(...expr)             // (?!...)
lookBehind(...expr)           // (?<=...)
notBehind(...expr)            // (?<!...)
hasPrefix(prefix, ...expr)    // (?<=prefix)...
hasNoPrefix(prefix, ...expr)  // (?<!prefix)...
hasSuffix(suffix, ...expr)    // ...(?=suffix)
hasNoSuffix(suffix, ...expr)  // ...(?!suffix)

// Utils
sepBy(sep, ...expr)           // ...(?:sep...)+
between(wrapper, ...expr)     // wrapper...wrapper
```
