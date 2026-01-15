const { createHash } = require("crypto");

const id = "Ralein Nova";
const pass = "Raleinnova12345";

const idHash = createHash("sha256").update(id).digest("hex");
const passHash = createHash("sha256").update(pass).digest("hex");

console.log("ID:", id);
console.log("ID Hash:", idHash);

console.log("Pass:", pass);
console.log("Pass Hash:", passHash);

const EXPECTED_ID_HASH = "1ff4fdba848a3fb50cd945579ec3683a5162d4d93903f4af948f6a151acb2d10";
const EXPECTED_PASS_HASH = "287b1be1a9ee154f81093ae64d189dab44d8519ecb1fd9404420cc5c267eedf6";

console.log("ID Match:", idHash === EXPECTED_ID_HASH);
console.log("Pass Match:", passHash === EXPECTED_PASS_HASH);
