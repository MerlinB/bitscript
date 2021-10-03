#!/usr/bin/env node

const yargs = require("yargs")
const fs = require("fs")
const path = require("path")

const opcodes = [
  "0",
  "false",
  "pushdata1",
  "pushdata2",
  "pushdata4",
  "1negate",
  "reserved",
  "1",
  "true",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",

  // control
  "nop",
  "ver",
  "if",
  "notif",
  "verif",
  "vernotif",
  "else",
  "endif",
  "verify",
  "return",

  // stack ops
  "toaltstack",
  "fromaltstack",
  "2drop",
  "2dup",
  "3dup",
  "2over",
  "2rot",
  "2swap",
  "ifdup",
  "depth",
  "drop",
  "dup",
  "nip",
  "over",
  "pick",
  "roll",
  "rot",
  "swap",
  "tuck",

  // splice ops
  "cat",
  "split", // after monolith upgrade (May 2018)
  "num2bin", // after monolith upgrade (May 2018)
  "bin2num", // after monolith upgrade (May 2018)
  "size",

  // bit logic
  "invert",
  "and",
  "or",
  "xor",
  "equal",
  "equalverify",
  "reserved1",
  "reserved2",

  // numeric
  "1add",
  "1sub",
  "2mul",
  "2div",
  "negate",
  "abs",
  "not",
  "0notequal",

  "add",
  "sub",
  "mul",
  "div",
  "mod",
  "lshift",
  "rshift",

  "booland",
  "boolor",
  "numequal",
  "numequalverify",
  "numnotequal",
  "lessthan",
  "greaterthan",
  "lessthanorequal",
  "greaterthanorequal",
  "min",
  "max",

  "within",

  // crypto
  "ripemd160",
  "sha1",
  "sha256",
  "hash160",
  "hash256",
  "codeseparator",
  "checksig",
  "checksigverify",
  "checkmultisig",
  "checkmultisigverify",

  // expansion
  "nop1",
  "checklocktimeverify",
  "nop2",
  "checksequenceverify",
  "nop3",
  "nop4",
  "nop5",
  "nop6",
  "nop7",
  "nop8",
  "nop9",
  "nop10",

  // template matching params
  "smallinteger",
  "pubkeys",
  "pubkeyhash",
  "pubkey",

  "invalidopcode"
]

const argv = yargs.command("$0 <input>", "Compile to Bitcoin Script", yargs => {
  yargs.positional("input", {
    describe: "Path to file to compile",
    type: "string"
  })
}).argv

function getSymbols(string) {
  return string.split(/\s/).filter(symbol => symbol)
}

function load(path) {
  const fileString = fs.readFileSync(path).toString()
  return getSymbols(fileString)
}

function compile(symbols) {
  const macros = {}
  const output = []

  function next(symbols) {
    const symbol = symbols.shift()

    if (symbol === "import") {
      const importPath = symbols.shift()
      const basePath = path.dirname(argv.input)
      const marcoSymbols = load(path.join(basePath, importPath + ".bits"))
      const macroName = path.parse(importPath).name
      const macroOpCodes = compile(marcoSymbols)

      macros[macroName] = macroOpCodes
    } else if (Object.keys(macros).includes(symbol)) {
      symbols.unshift(...macros[symbol])
    } else if (opcodes.includes(symbol)) {
      output.push(`OP_${symbol.toUpperCase()}`)
    } else {
      output.push(symbol)
    }
  }

  while (symbols.length > 0) {
    next(symbols, output)
  }

  return output
}

const symbols = load(argv.input)

console.log(compile(symbols).join(" "))
