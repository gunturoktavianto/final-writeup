the final result is created in generateSignEntry

# notes 1 - 4
inside generateSignEntry:
- the data we want is placed into variable `i` using `jt.apply` 
- `jt.apply` calls some horrendous mess, but the interesting line (note #4) is `Dt = He(r[h++])`
- `Dt =` is the data we want, so `He(r[h++])` is what produces the data
- using toString, we can see that the soruce of `He` looks like the following (note #5):
```js
function( \u{fc5e}8,\u{fc5e}7 ) {
	return (
		\u{fc5e}7 = (((\u{fc5e}8) & (15))),
		
		(
			(\u{fc5e}11)[\u{fc5e}7]
		)[(
			(\u{fc5e}8) >>(4)
		)]
	);
}
```

# note5 function
I'll call this function "note5". be aware that was created using an `eval`, or similar.

The note5 function references 3 variables, all of which are of the form U+FC5E followed by a number. On each run of the script, the numbers change.

Two of the variables in note5() are simply argument names, and don't pose any particular issuue.

However, the third variable (in the case above, it was `\u{fc5e}11`) is a significant stumbling block. I'll call that "note6".


# note6 variable
As can be seen in the function definition, the "note6" variable is what is actually _storing_ the data we're after; there's a line in the note5 function that equates to `note6[i][j]`, where `i = arg0 & 15` and `j = arg0 >> 4`.

Referencing the original code (near line "note 4"), I found that the note5 function is always called as `note5(96, undefined)`; so I therefore conclude that `i = 0` and `j = 6`. This is probably not useful, because it's the "note6" variable that we actually need, but I'm going to write these down for completeness's sake.

## things that protect the variable

ideally, we would be able to see where the variable is defined, or at least *read* the variable directly.

however, the variable name is dynamically generated on each run (in an `eval()`, since confirmed to be aliased as `ct()`), and this makes it hard to probe directly.

Instead, I needed to locate the eval() call itself, and rewrite it (which I've designated as "note8").


# note8 block
The "note5" function is initially created using the statement `st = ct(Ft())` in the unmodified source code. I've replaced this with `st = eval(Ft())`, and confirmed this works; and from there I'm able to replace `Ft()` (the dynamic source code) with a static version that includes logging and instrumentation.

This modified section of code is what I'll call the "note8 block/section".

I've been able to determine the following:
- the note5 function is called many, MANY times
- on a small number of those invocations, the note6 variable is the same object as what we're looking for

Specifically, I've confirmed that note6 is equal to object I'm trying to probe on 5 runs: run #2649 (0-indexed), and #40471 - #40474.

on run 2649, the object does not yet contain the x-sap-sec payload where I expect it to be. On runs 40471 - 40474, it does contain it.

From this, I conclude that the target data is inserted into this object *sometime* between ruuns 2649 and 40471, likely somewhere else in the code. 

on invocation 2649, the relevant location in note6 (i.e., `note6[0][129]`) does actually have an empty object!

## probing note6 on invocation #2649
replacing `note6[0][129]` (I'll call this the "note9 object") with a `null` results in a console log message with `x-sap-fixme` inside the logged object. This is an encouraging sign; it looks like we're hitting debug logic.

the value of x-sap-fixme is a multiply-encoded error message ("note10 error"), which can be read by calling `decodeURI(JSON.parse(atob(note10)).m)`. the error message uses the dynamic variable names, that use Unicode U+FC5E; I HIGHLY recommend re-encoding those somehow. (I've got a debug function that I've called `func2str` which works for that)

the console log itself comes from a line looking like `res = de[lt](pe, ee)`, which I'm annotating as note11 for future reference.

by replacing note9 with a Proxy, we can check where the `'x-sap-sec'` field is set (and `'x-sap-ri'`, which I'm skipping for now). this eventually traces back to the `res` variable, in the horrid mess of a function that is `jt`. interestingly, the only call to `res =` that I see, happens to be note11!

# investigating note11

by checking for a `res` that fits the relevant pattern (typeof is "string", length > 200, no spaces), I can determine that the `x-sap-sec` string is assigned to `res` at a time where `ee` (in note11) is a Uint8Array with length roughly ~75% that of the final output string. this STRONGLY suggests that the relevant Uint8Array ("note12 byte array") is the actual payload data, before ASCII encoding. therefore I'll ignore the rest of the note11 statement, and focus on the note12 byte array.

tracking this back a bit farther, the note12 byte array lives in `note5[0][162]` of the same object as note9 lives in (note9 is index 129, note12 is index 162).

this provides a promising avenue for further investigation.
